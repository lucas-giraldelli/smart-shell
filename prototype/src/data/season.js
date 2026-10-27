// The astronomical season on a date, at a latitude: the equinoxes and
// solstices on their usual days (20 Mar, 21 Jun, 22 Sep, 21 Dec), flipped
// south of the equator. Shared with the shell (shell/lib/season.mjs links here);
// labels are translated under `weather.seasons.<key>`.
const NORTH = ['winter', 'spring', 'summer', 'autumn'];
const STARTS = [[2, 20], [5, 21], [8, 22], [11, 21]];   // [month (0-11), day]: spring, summer, autumn, winter

export function season(date, lat) {
  const m = date.getMonth(), d = date.getDate();
  let i = 0;    // how many of the four starts this date has reached
  for (const s of STARTS) if (m > s[0] || (m === s[0] && d >= s[1])) i++;
  const north = NORTH[i % 4];
  return lat < 0 ? NORTH[(NORTH.indexOf(north) + 2) % 4] : north;
}
