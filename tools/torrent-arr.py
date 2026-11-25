#!/usr/bin/env python3
"""Send .torrent files to qBittorrent so Radarr or Sonarr import them.

  torrent-arr.py add FILE.torrent...   one JSON line per file on stdout
  torrent-arr.py unblock               import what Radarr/Sonarr blocked

`add` reads the release name inside each .torrent; a season or episode in it
(S01, S01E02, 1x02, season, temporada) makes it a series, anything else a
movie. With ~/.config/smart-shell/radarr.json or sonarr.json
({ "url", "apiKey", "rootFolder"?, "profiles"?: { "dual", "default" } },
profile names; "dual" for DUAL/DUBLADO/NACIONAL releases) it makes sure the
movie or series is in that library first, added monitored and without a
search (a series with no episode monitored, so nothing else downloads). The
torrent then goes to qBittorrent (qbittorrent.json) in the category of config
torrents.categories, or else the one Radarr/Sonarr download with; the file is
deleted once qBittorrent took it. Which library item each torrent is for is
kept in $XDG_STATE_HOME/smart-shell/arr-downloads.json.

`unblock` looks at those torrents in the Radarr/Sonarr queue: one whose
import is blocked (a release name that does not match the library, e.g. its
year is off by one) is imported by hand into the item `add` chose for it.
"""
import hashlib
import http.cookiejar
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid

CONFIG = os.path.join(os.environ.get("XDG_CONFIG_HOME") or os.path.expanduser("~/.config"), "smart-shell")
STATE = os.path.join(os.environ.get("XDG_STATE_HOME") or os.path.expanduser("~/.local/state"), "smart-shell", "arr-downloads.json")
STATE_DAYS = 60

TV = re.compile(r"(^|[^a-z0-9])(s\d{1,2}(e\d{1,3})?|\d{1,2}x\d{2,3}|season|temporada)([^a-z0-9]|$)", re.I)
DUAL = re.compile(r"(^|[^a-z0-9])(dual|dublado|nacional)([^a-z0-9]|$)", re.I)


def log(*a):
    print("[torrent-arr]", *a, file=sys.stderr)


# ---- .torrent ---------------------------------------------------------------

def bdecode(data, i=0):
    """Decode one bencoded value at i; returns (value, next index)."""
    c = data[i:i + 1]
    if c == b"i":
        end = data.index(b"e", i)
        return int(data[i + 1:end]), end + 1
    if c == b"l":
        out, i = [], i + 1
        while data[i:i + 1] != b"e":
            v, i = bdecode(data, i)
            out.append(v)
        return out, i + 1
    if c == b"d":
        out, i = {}, i + 1
        while data[i:i + 1] != b"e":
            k, i = bdecode(data, i)
            start = i
            v, i = bdecode(data, i)
            out[k] = v
            if k == b"info":
                out[b"__info_span"] = (start, i)
        return out, i + 1
    colon = data.index(b":", i)
    n = int(data[i:colon])
    return data[colon + 1:colon + 1 + n], colon + 1 + n


def torrent_meta(data):
    """(release name, v1 info hash) of a .torrent's bytes."""
    meta, _ = bdecode(data)
    start, end = meta[b"__info_span"]
    info = meta[b"info"]
    name = info.get(b"name.utf-8") or info.get(b"name") or b""
    name = name.decode("utf-8", "replace")
    name = re.sub(r"\.(mkv|mp4|avi|m4v|ts)$", "", name, flags=re.I)
    return name, hashlib.sha1(data[start:end]).hexdigest()


def kind_of(name):
    return "sonarr" if TV.search(name) else "radarr"


def pick_year(results, year, key="year"):
    """The first lookup result within a year of `year` (any first one without a year)."""
    if not year:
        return results[0] if results else None
    for r in results:
        if r.get(key) and abs(r[key] - year) <= 1:
            return r
    return None


# ---- HTTP ---------------------------------------------------------------------

def load(name):
    try:
        with open(os.path.join(CONFIG, name)) as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


class Arr:
    def __init__(self, app, conf):
        self.app, self.url, self.key, self.conf = app, conf["url"].rstrip("/"), conf["apiKey"], conf

    def call(self, path, params=None, body=None, method=None):
        url = f"{self.url}/api/v3/{path}" + ("?" + urllib.parse.urlencode(params) if params else "")
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(url, data=data, method=method or ("POST" if data else "GET"),
                                     headers={"X-Api-Key": self.key, "Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read()
            return json.loads(raw) if raw else None

    def category(self):
        field = "movieCategory" if self.app == "radarr" else "tvCategory"
        for client in self.call("downloadclient"):
            if client.get("implementation") == "QBittorrent" and client.get("enable"):
                for f in client["fields"]:
                    if f["name"] == field and f.get("value"):
                        return f["value"]
        return ""

    def profile(self, name):
        want = (self.conf.get("profiles") or {}).get("dual" if DUAL.search(name) else "default")
        profiles = self.call("qualityprofile")
        for p in profiles:
            if p["name"] == want:
                return p["id"]
        return profiles[0]["id"]

    def root(self):
        return self.conf.get("rootFolder") or self.call("rootfolder")[0]["path"]

    def ensure(self, name):
        """The library id of the movie/series `name` is, adding it when missing; None if unknown."""
        parsed = self.call("parse", {"title": name}) or {}
        if self.app == "radarr":
            if parsed.get("movie"):
                return parsed["movie"]["id"], parsed["movie"]["title"], False
            info = parsed.get("parsedMovieInfo") or {}
            title, year = (info.get("movieTitles") or [None])[0], info.get("year")
            if not title:
                return None
            hit = pick_year(self.call("movie/lookup", {"term": f"{title} {year or ''}".strip()}), year)
            if not hit:
                return None
            if hit.get("id"):
                return hit["id"], hit["title"], False
            hit.update(qualityProfileId=self.profile(name), rootFolderPath=self.root(), monitored=True,
                       minimumAvailability="released", addOptions={"searchForMovie": False})
            added = self.call("movie", body=hit)
            return added["id"], added["title"], True
        if parsed.get("series"):
            return parsed["series"]["id"], parsed["series"]["title"], False
        info = parsed.get("parsedEpisodeInfo") or {}
        title = info.get("seriesTitle")
        if not title:
            return None
        year = (info.get("seriesTitleInfo") or {}).get("year") or None
        hit = pick_year(self.call("series/lookup", {"term": title}), year)
        if not hit:
            return None
        if hit.get("id"):
            return hit["id"], hit["title"], False
        hit.update(qualityProfileId=self.profile(name), rootFolderPath=self.root(), monitored=True, seasonFolder=True,
                   addOptions={"monitor": "none", "searchForMissingEpisodes": False, "searchForCutoffUnmetEpisodes": False})
        added = self.call("series", body=hit)
        return added["id"], added["title"], True


class Qbit:
    def __init__(self, conf):
        self.url, self.conf = conf["url"].rstrip("/"), conf
        self.http = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
        body = urllib.parse.urlencode({"username": conf["username"], "password": conf["password"]}).encode()
        self.http.open(urllib.request.Request(f"{self.url}/api/v2/auth/login", body, headers={"Referer": self.url}), timeout=10)

    def add(self, data, category):
        boundary = uuid.uuid4().hex
        parts = [f'--{boundary}\r\nContent-Disposition: form-data; name="torrents"; filename="file.torrent"\r\n'
                 f"Content-Type: application/x-bittorrent\r\n\r\n".encode() + data + b"\r\n"]
        if category:
            parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\n{category}\r\n'.encode())
        body = b"".join(parts) + f"--{boundary}--\r\n".encode()
        req = urllib.request.Request(f"{self.url}/api/v2/torrents/add", body,
                                     headers={"Content-Type": f"multipart/form-data; boundary={boundary}", "Referer": self.url})
        with self.http.open(req, timeout=30) as r:
            return r.read().decode().strip() != "Fails."


# ---- state --------------------------------------------------------------------

def read_state():
    try:
        with open(STATE) as f:
            state = json.load(f)
    except (OSError, ValueError):
        return {}
    cutoff = time.time() - STATE_DAYS * 86400
    return {h: v for h, v in state.items() if v.get("added", 0) > cutoff}


def write_state(state):
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    tmp = STATE + ".tmp"
    with open(tmp, "w") as f:
        json.dump(state, f, indent=1)
    os.replace(tmp, STATE)


# ---- commands -----------------------------------------------------------------

def add(paths):
    qconf = load("qbittorrent.json")
    if not qconf:
        log("no qbittorrent.json")
        return 2
    qbit = Qbit(qconf)
    cats = ((load("config.json") or {}).get("torrents") or {}).get("categories") or {}
    arrs = {app: Arr(app, c) for app in ("radarr", "sonarr") if (c := load(f"{app}.json"))}
    state = read_state()
    for path in paths:
        out = {"path": path}
        try:
            with open(path, "rb") as f:
                data = f.read()
            name, ihash = torrent_meta(data)
            app = kind_of(name)
            out.update(name=name, kind="series" if app == "sonarr" else "movie")
            arr = arrs.get(app)
            category = cats.get("tv" if app == "sonarr" else "movie") or ""
            if arr:
                try:
                    category = category or arr.category()
                    found = arr.ensure(name)
                    if found:
                        out.update(title=found[1], added=found[2])
                        state[ihash] = {"app": app, "id": found[0], "name": name, "added": time.time()}
                    else:
                        log(f"{app}: no match for {name!r}")
                except Exception as e:  # the torrent still goes in, imported by hand
                    log(f"{app}: {e}")
            out["category"] = category
            out["ok"] = qbit.add(data, category)
            if out["ok"]:
                os.remove(path)
        except urllib.error.HTTPError as e:
            out.update(ok=False, error="already in qBittorrent" if e.code == 409 else str(e))
        except Exception as e:
            out.update(ok=False, error=str(e))
        print(json.dumps(out, ensure_ascii=False), flush=True)
    write_state(state)
    return 0


def unblock():
    state = read_state()
    for app in ("radarr", "sonarr"):
        conf = load(f"{app}.json")
        mine = {h: v for h, v in state.items() if v["app"] == app}
        if not conf or not mine:
            continue
        arr = Arr(app, conf)
        queue = arr.call("queue", {"pageSize": 200, "includeUnknownMovieItems" if app == "radarr" else "includeUnknownSeriesItems": "true"})
        for rec in queue.get("records", []):
            entry = mine.get((rec.get("downloadId") or "").lower())
            if not entry or rec.get("trackedDownloadState") != "importBlocked":
                continue
            key = "movieId" if app == "radarr" else "seriesId"
            items = arr.call("manualimport", {"downloadId": rec["downloadId"], key: entry["id"], "filterExistingFiles": "false"})
            files = []
            for it in items:
                f = {"path": it["path"], key: entry["id"], "quality": it["quality"], "languages": it["languages"],
                     "releaseGroup": it.get("releaseGroup"), "downloadId": rec["downloadId"], "indexerFlags": it.get("indexerFlags", 0)}
                if app == "sonarr":
                    if not it.get("episodes"):
                        continue
                    f.update(episodeIds=[e["id"] for e in it["episodes"]], seasonNumber=it.get("seasonNumber"),
                             releaseType=it.get("releaseType", "unknown"))
                files.append(f)
            if files:
                arr.call("command", body={"name": "ManualImport", "importMode": "auto", "files": files})
                log(f"{app}: importing {len(files)} file(s) of {entry['name']!r}")
                state.pop(rec["downloadId"].lower(), None)
    write_state(state)
    return 0


def main(argv):
    if len(argv) >= 2 and argv[1] == "add":
        return add(argv[2:])
    if len(argv) == 2 and argv[1] == "unblock":
        return unblock()
    print(__doc__, file=sys.stderr)
    return 64


if __name__ == "__main__":
    sys.exit(main(sys.argv))
