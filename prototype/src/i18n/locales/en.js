// English (fallback for any missing key)
export default {
  common: {
    on: 'On', off: 'Off', muted: 'Muted', now: 'Now', today: 'Today', tomorrow: 'Tomorrow',
    copy: 'Copy', copied: 'Copied!', stopped: 'Stopped',
  },

  widgets: {
    workspaces: 'Workspaces', capslock: 'Caps Lock', apps: 'Apps', music: 'Music', weather: 'Weather', prs: 'PRs',
    bluetooth: 'Bluetooth', quick: 'Quick controls', tray: 'Tray', clock: 'Clock',
  },

  workspaces: { label: 'Workspace {id} · {windows}', empty: 'empty' },

  music: { volume: 'YouTube Music volume', notPlaying: 'YouTube Music isn\'t open' },

  keyboard: { dnd: 'Click to turn off do not disturb', recording: 'Click to stop recording', resize: 'Resize · Esc to exit' },

  capslock: { on: 'Caps Lock on', off: 'Caps Lock off' },


  system: {
    label: 'System', cpu: 'CPU', memory: 'Memory', temp: 'Die (Tccd1) at {temp}°C',
    free: '{free} GiB', used: '{used} of {total} GiB in use',
    uptime: 'Up for {time}', screen: 'Screen', screenOff: 'Turn off screen', since: 'On since {date}',
    top: 'RAM usage', kill: 'Quit', killArm: 'Click to confirm',
    killWait: 'Quitting…', killForce: 'Click to force',
    uptimeDays: '{d} d {h} h', uptimeHours: '{h} h {m} min', uptimeMinutes: '{m} min',
  },

  bluetooth: {
    turnOn: 'Click to turn on', turnOff: 'Click to turn off',
    connecting: 'Connecting…', headset: 'Headset · {battery}%',
    paired: 'Paired devices', connected: 'Connected · {battery}%', disconnected: 'Disconnected',
    connect: 'Connect', disconnect: 'Disconnect', manager: 'Open manager…',
    headsetOutput: 'Bluetooth headset',
  },

  volume: {
    label: 'Volume', output: 'Output', input: 'Input', apps: 'Apps',
    editLabel: 'Edit description', hide: 'Hide', show: 'Show', hidden: 'Hidden devices ({n})',
    kinds: { hdmi: 'HDMI', spdif: 'S/PDIF', analog: 'Analog', usb: 'USB', bluetooth: 'Bluetooth' },
    where: { gpu: 'graphics card', board: 'motherboard' },
    titles: { hdmi: 'HDMI output', spdif: 'Onboard digital output', analog: 'Onboard analog output' },
  },

  brightness: {
    label: 'Brightness', monitor: 'Monitor', night: 'Night light', temperature: 'Temperature',
    presets: { night: 'Night', normal: 'Normal', day: 'Day', max: 'Max' },
  },

  settings: {
    label: 'Dock', look: 'Appearance', size: 'Size', magnify: 'Magnification', clock: 'Clock', dnd: 'Do not disturb', wsStyle: 'Workspaces', wsStyles: { icons: 'Icons', numbers: 'Numbers', dots: 'Dots' },
    widgets: 'Widgets', pets: 'Pet', weatherFx: 'Weather in the dock', tama: 'Tamagotchi', tamaTip: 'A click on the pet opens its care menu', noPet: 'None', language: 'Language',
    locales: { 'pt-BR': 'Português', en: 'English' },
  },

  network: {
    label: 'Network', connected: 'Connected', offline: 'No internet',
    ip: 'IP', gateway: 'Gateway', dockerNet: 'Docker network',
    download: 'Download', upload: 'Upload', connections: 'Connections', vpn: 'VPN', vpnStates: { off: 'Off', authenticating: 'Approve in the browser', connecting: 'Connecting…', on: 'On · {server}', error: 'Couldn\'t connect' }, vpnOnTip: 'VPN · {server}', profile: 'Profile', copyIp: 'Copy IP',
  },

  docker: {
    label: 'Docker', summary: '{up} of {total} running · {mem}', serviceDown: 'Docker service stopped',
    running: 'Running', paused: 'Paused', restarting: 'Restarting…', unhealthy: 'Running · failing health check', exitedError: 'Exited with error ({code})',
    start: 'Start', stop: 'Stop', other: 'Other',
  },

  capabilities: {
    bluetooth: 'No Bluetooth adapter', ddcutil: 'ddcutil not installed',
    docker: 'Docker not installed', hyprsunset: 'hyprsunset not installed',
    unknown: '{name} unavailable', install: 'Install the {pkg} package to use it.',
  },

  notifications: { close: 'Close' },
  prs: {
    title: 'Pull requests', tile: '{n} PRs', refresh: 'Refresh', none: 'No open PRs',
    hide: 'Hide', dismiss: 'Dismiss', unhide: 'Show',
    showHidden: 'Show hidden ({n})', hideHidden: 'Hide hidden ({n})',
    updated: 'updated at {time}', sample: 'sample',
    status: { failing: 'pipeline failed', conflict: 'conflicts with base', behind: 'behind main',
      pending: 'pipeline running', green: 'pipeline green', approved: 'pipeline green and approved', merged: 'merged' },
  },
  weather: {
    feels: 'Feels like {temp}°', nextHours: 'Next hours', days: '7 days',
    updated: 'Open-Meteo · updated {time}', sample: 'Sample forecast · offline',
    codes: {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Rime fog',
      51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 56: 'Freezing drizzle', 57: 'Freezing drizzle',
      61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain',
      71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
      80: 'Light showers', 81: 'Showers', 82: 'Heavy showers',
      85: 'Snow showers', 86: 'Heavy snow showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail',
      unknown: 'Unknown',
    },
  },

  calendar: {
    prevMonth: 'Previous month', nextMonth: 'Next month', today: 'Today',
    weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    allDay: 'All day', optional: 'optional', upcoming: 'Upcoming holidays',
    showPast: p => `${p.n} earlier`, hidePast: 'hide earlier',
    untitled: '(untitled)',
    skipped: '{name} is hidden: {reason}',
    reasons: {
      offline: 'offline support is off in Thunderbird',
      disabled: 'disabled in Thunderbird',
      unknown: 'not found in Thunderbird',
    },
  },

  reminder: { join: 'Join the Meet', soon: 'in {minutes} min', now: 'now' },

  categories: { work: 'Work', health: 'Health', personal: 'Personal' },

  regions: { br: 'Brazil', cba: 'Cuiabá / MT', us: 'USA' },

  holidays: {
    newYear: "New Year's Day (Brazil)", carnival: 'Carnival', ashWednesday: 'Ash Wednesday',
    goodFriday: 'Good Friday', tiradentes: 'Tiradentes Day', labour: 'Labour Day',
    corpusChristi: 'Corpus Christi', independenceBR: 'Brazilian Independence Day',
    aparecida: 'Our Lady of Aparecida', allSouls: "All Souls' Day", republic: 'Republic Proclamation Day',
    blackConsciousness: 'Black Consciousness Day', christmas: 'Christmas (Brazil)',
    cuiaba: "Cuiabá's Anniversary", matoGrosso: 'Mato Grosso Foundation Day', conception: 'Our Lady of the Conception',
    usNewYear: "New Year's Day", mlk: 'Martin Luther King Jr. Day', presidents: "Presidents' Day",
    memorial: 'Memorial Day', juneteenth: 'Juneteenth', independenceUS: 'Independence Day',
    labor: 'Labor Day', columbus: 'Columbus Day', veterans: 'Veterans Day',
    thanksgiving: 'Thanksgiving', usChristmas: 'Christmas Day',
  },

  themes: {
    glass: 'Glass', midnight: 'Midnight', aqua: 'Aqua Shelf', neon: 'Neon', paper: 'Paper',
    canarinho: 'Canarinho', snowy: 'Snowy Night', halloween: 'Halloween',
  },

  pets: {
    names: { cat: 'Cat', shiba: 'Shiba', fox: 'Fox', penguin: 'Penguin', bunny: 'Bunny', capy: 'Capybara', frog: 'Frog',
      duck: 'Duck', corgi: 'Corgi', panda: 'Panda', owl: 'Owl', turtle: 'Turtle', octopus: 'Octopus',
      macaw: 'Hyacinth macaw', anteater: 'Anteater', ghost: 'Ghost', blackcat: 'Black cat', pig: 'Pig' },
    bubble: '{mood} · CPU {load}%',
    chill: "Couldn't care less about the CPU",
    says: { yum: 'yum!', yay: 'yay!', no: 'nope!', croak: 'ribbit!', yip: 'yip!', squeak: 'squeak!', blub: 'blub blub', meow: 'meow', hiss: 'hsss!', wow: 'such wow', woof: 'woof!', pullup: 'ok I pull up', quack: 'quack!', noot: 'noot noot', munch: 'munch munch', hoot: 'hoo-hoo', slow: 'slowly…', hello: 'hello!', hug: 'hug?', boo: 'boo!', oink: 'oink' },
    moods: {
      leaf: 'In the shade', stretch: 'Stretching', dark: 'In the dark', wag: 'Wagging', sploot: 'Splooting', scratch: 'Scratching', ducklings: 'With its ducklings', roll: 'Rolling', yawn: 'Yawning', camo: 'Camouflaged', hang: 'Hanging', hug: 'Hug!', flip: 'Upside down', happy: 'So happy', fly: 'Catching a fly', lick: 'Licking a paw', arch: 'Spooked!', sit: 'Sitting', chase: 'Chasing its tail', dive: 'Diving', binky: 'Happy!', nose: 'Sniffing', bath: 'In the bath', flap: 'Flapping', slide: 'Sliding', bamboo: 'Eating bamboo', wink: 'Winking', spin: 'Turning its head', hide: 'Hiding', ink: 'Squirting ink', wave: 'Waving', ants: 'Catching ants', fade: 'Fading…', mud: 'In the mud', talk: 'Talking', sleep: 'Sleeping', walk: 'Walking', run: 'Running!', stand: 'Chilling', stroll: 'Strolling',
      turn: 'Looking around', lie: 'Lying down', nap: 'Napping', sniff: 'Sniffing around', zoomies: 'Zoomies!', jump: 'Jumping',
      pounce: 'Pouncing', croak: 'Croaking', tongue: 'Catching a fly', work: 'In a meeting', dance: 'Dancing',
    },
  },

  tama: {
    food: 'Food', fun: 'Fun', clean: 'Hygiene', energy: 'Energy', health: 'Health',
    pet: 'Pet', feed: 'Feed', play: 'Play', wash: 'Clean', medicine: 'Medicine', sleep: 'Sleep', wake: 'Wake up',
    baby: 'Baby', young: 'Young', adult: 'Adult', hours: '{h} h', days: '{d} days',
    sick: 'Sick',
    ranAway: '{name} ran away', ranAwayBody: 'Left uncared for, it ran off… and came back as a ghost.',
  },

  dev: {
    notify: 'Simulate a notification', recording: 'Recording the screen (Alt+Print)',
    show: 'Show panel (H)', title: 'smart-shell · prototype',
    intro: 'HTML mock-up. The real shell runs on Quickshell (QML) with the same look.',
    backends: 'Installed backends (simulated)', failures: 'Simulate failures',
    offline: 'Network down', dockerDown: 'Docker stopped', containerError: 'Container error', memHeavy: 'RAM almost full', trayAttention: 'Slack mention',
    tuning: 'Tuning', cpuLoad: 'CPU load', resizeSubmap: 'Resize submap (Alt+R)', musicPlaying: 'YouTube Music playing (pets dance)', cpuAuto: 'Simulated CPU (X3D-style spikes)',
    liveWallpaper: 'Animated wallpaper (local video)', auto: 'auto',
    hint: 'Click an app to open it · right-click closes · click the quick tile for the control center (dock settings in its Dock tab) · scroll on volume/brightness · click a pet · Caps Lock lights the indicator.',
    keys: 'H hides the panel · 1–{n} switches theme',
    weather: 'Weather (simulated)', real: 'real', tamaSpeed: 'Tamagotchi time', tamaReset: 'Reset',
    weathers: { sun: 'Sun', stars: 'Clear night', clouds: 'Cloudy', fog: 'Fog', drizzle: 'Drizzle', rain: 'Rain', downpour: 'Heavy rain', storm: 'Storm', snow: 'Snow' },
  },
};
