// Português (Brasil)
export default {
  common: {
    on: 'Ligado', off: 'Desligado', muted: 'Mudo', now: 'Agora', today: 'Hoje', tomorrow: 'Amanhã',
    copy: 'Copiar', copied: 'Copiado!', stopped: 'Parado',
  },

  widgets: {
    workspaces: 'Workspaces', capslock: 'Caps Lock', apps: 'Apps', music: 'Música', weather: 'Clima', prs: 'PRs',
    bluetooth: 'Bluetooth', quick: 'Controles rápidos', tray: 'Tray', clock: 'Relógio',
  },

  workspaces: { label: 'Workspace {id} · {windows}', empty: 'vazio' },

  music: { volume: 'Volume do YouTube Music', notPlaying: 'YouTube Music não está aberto' },

  keyboard: { resize: 'Redimensionar · Esc sai', recording: 'Clique para parar gravação' },

  capslock: { on: 'Caps Lock ligado', off: 'Caps Lock desligado' },


  system: {
    label: 'Sistema', cpu: 'CPU', memory: 'Memória', temp: 'Die (Tccd1) a {temp}°C',
    free: '{free} GiB', used: '{used} de {total} GiB em uso',
    uptime: 'Ligado há {time}', screen: 'Tela', screenOff: 'Desligar tela', since: 'Ligado desde {date}',
    top: 'Mais memória', kill: 'Encerrar', killArm: 'Clique de novo',
    killWait: 'Encerrando…', killForce: 'Clique para forçar',
    uptimeDays: '{d} d {h} h', uptimeHours: '{h} h {m} min', uptimeMinutes: '{m} min',
  },

  bluetooth: {
    turnOn: 'Clique para ligar', turnOff: 'Clique para desligar',
    connecting: 'Conectando…', headset: 'Fone · {battery}%',
    paired: 'Dispositivos pareados', connected: 'Conectado · {battery}%', disconnected: 'Desconectado',
    connect: 'Conectar', disconnect: 'Desconectar', manager: 'Abrir gerenciador…',
    headsetOutput: 'Fone Bluetooth',
  },

  volume: {
    label: 'Volume', output: 'Saída', input: 'Entrada', apps: 'Apps',
    editLabel: 'Editar descrição', hide: 'Ocultar', show: 'Mostrar', hidden: 'Dispositivos ocultos ({n})',
    kinds: { hdmi: 'HDMI', spdif: 'S/PDIF', analog: 'Analógico', usb: 'USB', bluetooth: 'Bluetooth' },
    where: { gpu: 'placa de vídeo', board: 'placa-mãe' },
    titles: { hdmi: 'Saída HDMI', spdif: 'Saída digital onboard', analog: 'Saída analógica onboard' },
  },

  brightness: {
    label: 'Brilho', monitor: 'Monitor', night: 'Luz noturna', temperature: 'Temperatura',
    presets: { night: 'Noite', normal: 'Normal', day: 'Dia', max: 'Máx' },
  },

  settings: {
    label: 'Dock', look: 'Aparência', size: 'Tamanho', magnify: 'Ampliação', clock: 'Relógio', wsStyle: 'Workspaces', wsStyles: { icons: 'Ícones', numbers: 'Números', dots: 'Pontos' },
    widgets: 'Widgets', pets: 'Pet', noPet: 'Nenhum', language: 'Idioma',
    locales: { 'pt-BR': 'Português', en: 'English' },
  },

  network: {
    label: 'Rede', connected: '{kind} conectada', offline: 'Sem internet',
    internetOk: 'internet ok', noPing: 'o ping não responde',
    ip: 'IP', gateway: 'Gateway', dockerNet: 'Rede Docker',
    download: 'Download', upload: 'Upload', connections: 'Conexões', vpn: 'VPN', vpnStates: { off: 'Desligada', authenticating: 'Aprove no navegador', connecting: 'Conectando…', on: 'Ligada · {server}', error: 'Erro ao conectar' }, vpnOnTip: 'VPN · {server}', profile: 'Perfil', copyIp: 'Copiar IP',
  },

  docker: {
    label: 'Docker', summary: '{up} de {total} rodando · {mem}', serviceDown: 'Serviço do Docker parado',
    running: 'Rodando', paused: 'Pausado', restarting: 'Reiniciando…', unhealthy: 'Rodando · unhealthy', exitedError: 'Saiu com erro ({code})',
    start: 'Iniciar', stop: 'Parar', other: 'Outros',
  },

  capabilities: {
    bluetooth: 'Sem adaptador Bluetooth', ddcutil: 'ddcutil não instalado',
    docker: 'Docker não instalado', hyprsunset: 'hyprsunset não instalado',
    unknown: '{name} indisponível', install: 'Instale o pacote {pkg} para usar.',
  },

  notifications: { close: 'Fechar' },
  prs: {
    title: 'Pull requests', tile: '{n} PRs', refresh: 'Atualizar', none: 'Nenhum PR aberto',
    hide: 'Ocultar', dismiss: 'Dispensar', unhide: 'Mostrar',
    showHidden: 'Mostrar ocultos ({n})', hideHidden: 'Esconder ocultos ({n})',
    updated: 'atualizado às {time}', sample: 'exemplo',
    status: { failing: 'pipeline quebrada', conflict: 'conflito com a base', behind: 'desatualizado com a main',
      pending: 'pipeline rodando', green: 'pipeline verde', approved: 'pipeline verde e aprovado', merged: 'mergeado' },
  },
  weather: {
    feels: 'Sensação {temp}°', nextHours: 'Próximas horas', days: '7 dias',
    updated: 'Open-Meteo · atualizado {time}', sample: 'Previsão de exemplo · sem conexão',
    codes: {
      0: 'Céu limpo', 1: 'Predominantemente limpo', 2: 'Parcialmente nublado', 3: 'Nublado',
      45: 'Neblina', 48: 'Neblina com gelo',
      51: 'Garoa leve', 53: 'Garoa moderada', 55: 'Garoa intensa', 56: 'Garoa congelante', 57: 'Garoa congelante',
      61: 'Chuva leve', 63: 'Chuva moderada', 65: 'Chuva forte', 66: 'Chuva congelante', 67: 'Chuva congelante',
      71: 'Neve leve', 73: 'Neve moderada', 75: 'Neve forte', 77: 'Grânulos de neve',
      80: 'Pancadas leves', 81: 'Pancadas moderadas', 82: 'Pancadas fortes',
      85: 'Pancadas de neve', 86: 'Pancadas de neve fortes',
      95: 'Trovoada', 96: 'Trovoada com granizo', 99: 'Trovoada com granizo',
      unknown: 'Desconhecido',
    },
  },

  calendar: {
    prevMonth: 'Mês anterior', nextMonth: 'Próximo mês', today: 'Hoje',
    weekdays: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    allDay: 'Dia todo', optional: 'facultativo', upcoming: 'Próximos feriados',
    showPast: p => (p.n === 1 ? '1 anterior' : `${p.n} anteriores`), hidePast: 'ocultar anteriores',
    untitled: '(sem título)',
    skipped: '{name} não aparece: {reason}',
    reasons: {
      offline: 'sem suporte offline no Thunderbird',
      disabled: 'desativado no Thunderbird',
      unknown: 'não existe no Thunderbird',
    },
  },

  reminder: { soon: 'em {minutes} min', now: 'agora', join: 'Entrar no Meet' },

  categories: { work: 'Trabalho', health: 'Saúde', personal: 'Pessoal' },

  regions: { br: 'Brasil', cba: 'Cuiabá / MT', us: 'EUA' },

  holidays: {
    newYear: 'Confraternização Universal', carnival: 'Carnaval', ashWednesday: 'Quarta-feira de Cinzas',
    goodFriday: 'Sexta-feira Santa', tiradentes: 'Tiradentes', labour: 'Dia do Trabalho',
    corpusChristi: 'Corpus Christi', independenceBR: 'Independência do Brasil',
    aparecida: 'Nossa Senhora Aparecida', allSouls: 'Finados', republic: 'Proclamação da República',
    blackConsciousness: 'Dia da Consciência Negra', christmas: 'Natal',
    cuiaba: 'Aniversário de Cuiabá', matoGrosso: 'Fundação de Mato Grosso', conception: 'Nossa Senhora da Conceição',
    usNewYear: 'Ano Novo (EUA)', mlk: 'Dia de Martin Luther King Jr.', presidents: 'Dia dos Presidentes',
    memorial: 'Memorial Day', juneteenth: 'Juneteenth', independenceUS: 'Independência dos EUA',
    labor: 'Labor Day', columbus: 'Columbus Day', veterans: 'Dia dos Veteranos',
    thanksgiving: 'Ação de Graças', usChristmas: 'Natal (EUA)',
  },

  themes: {
    glass: 'Vidro', midnight: 'Midnight', aqua: 'Aqua Shelf', neon: 'Neon', paper: 'Papel',
    canarinho: 'Canarinho', snowy: 'Snowy Night', halloween: 'Halloween',
  },

  pets: {
    names: { cat: 'Gato', shiba: 'Shiba', fox: 'Raposa', penguin: 'Pinguim', bunny: 'Coelho', capy: 'Capivara', frog: 'Sapo' },
    bubble: '{mood} · CPU {load}%',
    chill: 'Nem aí pra CPU',
    moods: {
      sleep: 'Dormindo', walk: 'Andando', run: 'Correndo!', stand: 'De boa', stroll: 'Passeando',
      turn: 'Olhando em volta', lie: 'Deitado', nap: 'Cochilando', zoomies: 'Zoomies!', jump: 'Pulando',
      pounce: 'Dando o bote', croak: 'Coaxando', tongue: 'Pegando mosca', work: 'Em reunião', dance: 'Dançando',
    },
  },

  dev: {
    notify: 'Simular notificação', recording: 'Gravando a tela (Alt+Print)',
    show: 'Mostrar painel (H)', title: 'smart-shell · protótipo',
    intro: 'Maquete em HTML. O shell real roda em Quickshell (QML) com o mesmo visual.',
    backends: 'Backends instalados (simulação)', failures: 'Simular falhas',
    offline: 'Rede caiu', dockerDown: 'Docker parado', containerError: 'Container com erro', memHeavy: 'RAM quase cheia', trayAttention: 'Slack com menção',
    tuning: 'Ajustes', cpuLoad: 'Carga da CPU', resizeSubmap: 'Submap resize (Alt+R)', musicPlaying: 'YouTube Music tocando (pets dançam)', cpuAuto: 'CPU simulada (picos estilo X3D)',
    liveWallpaper: 'Wallpaper animado (vídeo local)', auto: 'auto',
    hint: 'Clique num app para abrir · botão direito fecha · clique no bloco rápido abre a central (configurações da dock na aba Dock) · roda no volume/brilho · clique num pet · Caps Lock acende o indicador.',
    keys: 'H esconde o painel · 1–{n} troca o tema',
  },
};
