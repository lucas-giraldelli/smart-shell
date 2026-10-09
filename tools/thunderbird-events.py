#!/usr/bin/env python3
"""Export Thunderbird calendar events to JSON for smart-shell.

Reads the offline cache Thunderbird keeps of every calendar (CalDAV included),
expands recurring events into concrete occurrences, applies exceptions and
moved occurrences, drops cancelled and declined events, and removes duplicates
(the same invite present in more than one calendar).

Which calendars to read comes from ~/.config/smart-shell/config.json:
  {"events": {"calendars": ["you@example.com", "Family"], "daysBack": 7, "daysAhead": 60}}
(no list = every enabled calendar). Command-line flags override the file.

Output (default ~/.cache/smart-shell/events.json):
  {"generatedAt": ..., "calendars": {name: color}, "skipped": [{name, reason}],
   (reason: "offline" | "disabled" | "unknown"; the UI translates it)
   "events": [{"title", "start", "end", "allDay", "calendars": [names]}, ...]}

Runs from a systemd user timer (systemd/smart-shell-events.*); safe to run any
time, since it only reads a copy of the database.
"""
import argparse
import configparser
import json
import os
import re
import shutil
import sqlite3
import sys
import tempfile
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

from dateutil.rrule import rrulestr

FLAG_ALLDAY = 8
FLAG_RECURRING = 16
LOCAL = datetime.now().astimezone().tzinfo
CONFIG = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config")) / "smart-shell" / "config.json"


def load_config() -> dict:
    """The `events` section of the smart-shell config, if any."""
    try:
        return json.loads(CONFIG.read_text()).get("events", {})
    except FileNotFoundError:
        return {}
    except (json.JSONDecodeError, AttributeError) as err:
        sys.exit(f"invalid {CONFIG}: {err}")


def find_profile(root: Path) -> Path:
    """The default Thunderbird profile, per profiles.ini (or the first with calendar data)."""
    ini = configparser.ConfigParser()
    ini.read(root / "profiles.ini")
    candidates = [s for s in ini.sections() if s.startswith("Install")]
    candidates += [s for s in ini.sections() if ini[s].get("Default") == "1" and "Path" in ini[s]]
    for section in candidates:
        path = ini[section].get("Default") if section.startswith("Install") else ini[section]["Path"]
        if path and (root / path / "calendar-data" / "cache.sqlite").exists():
            return root / path
    for db in sorted(root.glob("*/calendar-data/cache.sqlite")):
        return db.parent.parent
    sys.exit(f"no Thunderbird calendar found under {root}")


def read_calendars(profile: Path) -> dict:
    """calendar id -> {name, color, disabled} from prefs.js."""
    cals = {}
    pattern = re.compile(r'user_pref\("calendar\.registry\.([^.]+)\.(name|color|disabled|cache\.enabled)",\s*(.+)\);')
    for line in (profile / "prefs.js").read_text(errors="replace").splitlines():
        m = pattern.match(line)
        if m:
            cal_id, key, raw = m.groups()
            cals.setdefault(cal_id, {})[key] = json.loads(raw)
    return cals


def copy_db(profile: Path, tmp: Path) -> Path:
    """Thunderbird keeps the database open: work on a copy (with its WAL)."""
    src = profile / "calendar-data" / "cache.sqlite"
    for suffix in ("", "-wal", "-shm"):
        if Path(f"{src}{suffix}").exists():
            shutil.copy2(f"{src}{suffix}", tmp / f"cache.sqlite{suffix}")
    return tmp / "cache.sqlite"


def to_datetime(us: int, tz: str):
    """Thunderbird stores microseconds since the epoch plus a zone name."""
    utc = datetime.fromtimestamp(us / 1_000_000, timezone.utc)
    if tz in (None, "", "floating"):
        return utc.replace(tzinfo=None)  # wall-clock time, no zone
    try:
        return utc.astimezone(ZoneInfo(tz))
    except Exception:
        return utc


def parse_date_values(line: str, default_tz):
    """Values of an EXDATE/RDATE line -> list of date or datetime."""
    head, _, values = line.partition(":")
    params = dict(p.split("=", 1) for p in head.split(";")[1:] if "=" in p)
    out = []
    for v in values.split(","):
        v = v.strip()
        if not v:
            continue
        if params.get("VALUE") == "DATE" or len(v) == 8:
            out.append(date(int(v[:4]), int(v[4:6]), int(v[6:8])))
            continue
        dt = datetime.strptime(v.rstrip("Z"), "%Y%m%dT%H%M%S")
        if v.endswith("Z"):
            dt = dt.replace(tzinfo=timezone.utc)
        elif "TZID" in params:
            dt = dt.replace(tzinfo=ZoneInfo(params["TZID"]))
        elif default_tz is not None:
            dt = dt.replace(tzinfo=default_tz)
        out.append(dt)
    return out


def same_moment(a, b) -> bool:
    if isinstance(a, date) and not isinstance(a, datetime):
        return a == (b.date() if isinstance(b, datetime) else b)
    if (a.tzinfo is None) != (b.tzinfo is None):
        a, b = a.replace(tzinfo=None), b.replace(tzinfo=None)
    return a == b


def occurrences(start, rules, window_from, window_to):
    """Expand RRULE/RDATE/EXDATE lines for an event starting at `start`."""
    tz = start.tzinfo
    rrules = [l for l in rules if l.startswith("RRULE")]
    rdates = [d for l in rules if l.startswith("RDATE") for d in parse_date_values(l, tz)]
    exdates = [d for l in rules if l.startswith("EXDATE") for d in parse_date_values(l, tz)]

    found = []
    if rrules:
        text = "\n".join(rrules)
        if tz is None:  # floating start: UNTIL must be floating too
            text = re.sub(r"(UNTIL=\d{8}T\d{6})Z", r"\1", text)
        rule = rrulestr(text, dtstart=start, forceset=True)
        lo, hi = window_from, window_to
        if tz is None:
            lo, hi = lo.replace(tzinfo=None), hi.replace(tzinfo=None)
        found = rule.between(lo, hi, inc=True)
    for d in rdates:
        found.append(datetime.combine(d, start.timetz()) if not isinstance(d, datetime) else d)
    return [o for o in found if not any(same_moment(x, o) for x in exdates)]


def iso(value, all_day: bool) -> str:
    if all_day:
        return (value.date() if isinstance(value, datetime) else value).isoformat()
    if value.tzinfo is None:
        value = value.replace(tzinfo=LOCAL)
    return value.astimezone(LOCAL).isoformat(timespec="minutes")


def export(args) -> dict:
    root = Path(args.thunderbird).expanduser()
    profile = Path(args.profile).expanduser() if args.profile else find_profile(root)
    registry = read_calendars(profile)

    include = {c.casefold() for c in args.calendar}
    exclude = {c.casefold() for c in args.exclude}

    def chosen(cal_id):
        name = registry.get(cal_id, {}).get("name", cal_id).casefold()
        return name not in exclude and (not include or name in include)

    def wanted(cal_id):
        info = registry.get(cal_id, {})
        # without "offline support" Thunderbird keeps no local copy to read
        return chosen(cal_id) and not info.get("disabled") and info.get("cache.enabled", True)

    skipped = []
    for cal_id, info in registry.items():
        if chosen(cal_id) and not wanted(cal_id):
            skipped.append({"name": info.get("name", cal_id), "reason": "disabled" if info.get("disabled") else "offline"})
    known = {i.get("name", k).casefold() for k, i in registry.items()}
    skipped += [{"name": c, "reason": "unknown"} for c in args.calendar if c.casefold() not in known]

    now = datetime.now(LOCAL)
    window_from = (now - timedelta(days=args.days_back)).replace(hour=0, minute=0, second=0, microsecond=0)
    window_to = (now + timedelta(days=args.days_ahead)).replace(hour=23, minute=59, second=59, microsecond=0)

    with tempfile.TemporaryDirectory() as tmp:
        db = sqlite3.connect(copy_db(profile, Path(tmp)))
        db.row_factory = sqlite3.Row
        rows = db.execute("SELECT * FROM cal_events").fetchall()
        rules = {}
        for r in db.execute("SELECT cal_id, item_id, icalString FROM cal_recurrence"):
            for line in (r["icalString"] or "").splitlines():
                if line.strip():
                    rules.setdefault((r["cal_id"], r["item_id"]), []).append(line.strip())
        declined = set()
        for r in db.execute("SELECT cal_id, item_id, recurrence_id, icalString FROM cal_attendees"):
            # the calendar's own address (CalDAV calendars are named after it) declined
            me = registry.get(r["cal_id"], {}).get("name", "").lower()
            line = (r["icalString"] or "").lower()
            if me and "partstat=declined" in line and f"mailto:{me}" in line:
                declined.add((r["cal_id"], r["item_id"], r["recurrence_id"]))
        db.close()

    # moved/edited occurrences replace the generated ones
    overrides = {}
    for r in rows:
        if r["recurrence_id"] is not None:
            overrides[(r["cal_id"], r["id"], r["recurrence_id"])] = r

    events = []

    def add(row, start, end, all_day):
        if row["ical_status"] == "CANCELLED":
            return
        if (row["cal_id"], row["id"], row["recurrence_id"]) in declined:
            return
        cmp_start = start if isinstance(start, datetime) else datetime.combine(start, datetime.min.time())
        cmp_end = end if isinstance(end, datetime) else datetime.combine(end, datetime.min.time())
        lo, hi = (window_from, window_to) if cmp_start.tzinfo else (window_from.replace(tzinfo=None), window_to.replace(tzinfo=None))
        if cmp_end < lo or cmp_start > hi:
            return
        events.append({
            "title": (row["title"] or "").strip(),  # empty = untitled, shown translated
            "start": iso(start, all_day), "end": iso(end, all_day), "allDay": all_day,
            "calendar": registry.get(row["cal_id"], {}).get("name", row["cal_id"]),
        })

    for r in rows:
        if r["recurrence_id"] is not None or not wanted(r["cal_id"]):
            continue
        all_day = bool(r["flags"] & FLAG_ALLDAY)
        start = to_datetime(r["event_start"], r["event_start_tz"])
        end = to_datetime(r["event_end"], r["event_end_tz"] or r["event_start_tz"])
        if not r["flags"] & FLAG_RECURRING:
            add(r, start, end, all_day)
            continue
        length = end - start
        for occ in occurrences(start, rules.get((r["cal_id"], r["id"]), []), window_from, window_to):
            occ_us = int((occ if occ.tzinfo else occ.replace(tzinfo=timezone.utc)).timestamp() * 1_000_000)
            moved = overrides.get((r["cal_id"], r["id"], occ_us))
            if moved is not None:
                add(moved, to_datetime(moved["event_start"], moved["event_start_tz"]),
                    to_datetime(moved["event_end"], moved["event_end_tz"] or moved["event_start_tz"]),
                    bool(moved["flags"] & FLAG_ALLDAY))
            else:
                add(r, occ, occ + length, all_day)

    # dedup: the same invite in several calendars has the same title and times
    unique = {}
    for e in sorted(events, key=lambda e: (e["start"], e["title"])):
        key = (e["title"].casefold(), e["start"], e["end"])
        if key in unique:
            if e["calendar"] not in unique[key]["calendars"]:
                unique[key]["calendars"].append(e["calendar"])
        else:
            unique[key] = {**{k: v for k, v in e.items() if k != "calendar"}, "calendars": [e["calendar"]]}

    return {
        "generatedAt": now.isoformat(timespec="seconds"),
        "range": {"from": window_from.date().isoformat(), "to": window_to.date().isoformat()},
        "calendars": {v.get("name", k): v.get("color", "#9ca3af") for k, v in registry.items() if wanted(k)},
        "skipped": skipped,
        "events": list(unique.values()),
    }


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--thunderbird", default="~/.thunderbird", help="Thunderbird root folder")
    p.add_argument("--profile", help="profile folder (default: the default profile)")
    conf = load_config()
    p.add_argument("--calendar", action="append", help="only this calendar (repeatable; default: config)")
    p.add_argument("--exclude", action="append", default=[], help="skip this calendar (repeatable)")
    p.add_argument("--days-back", type=int, default=conf.get("daysBack", 7))
    p.add_argument("--days-ahead", type=int, default=conf.get("daysAhead", 60))
    p.add_argument("--output", default="~/.cache/smart-shell/events.json", help="'-' for stdout")
    args = p.parse_args()
    if args.calendar is None:
        args.calendar = conf.get("calendars", [])
    args.exclude += conf.get("exclude", [])

    data = export(args)
    text = json.dumps(data, ensure_ascii=False, indent=1)
    if args.output == "-":
        print(text)
        return
    out = Path(args.output).expanduser()
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_suffix(".tmp")
    tmp.write_text(text)
    os.replace(tmp, out)  # atomic: readers never see a half-written file


if __name__ == "__main__":
    main()
