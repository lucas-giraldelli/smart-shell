#!/usr/bin/env node
// YouTube Music's like state, read from the app itself over the Chrome
// DevTools Protocol. The app must run with --remote-debugging-port (see the
// README); without it this exits 2 and the dock falls back to the shortcut.
//
//   ytm-like.mjs get      prints LIKE | INDIFFERENT | DISLIKE
//   ytm-like.mjs toggle   clicks the like button, then prints the new state
const PORT = process.env.YTM_DEBUG_PORT || 9223;
const STATUS = `document.querySelector('ytmusic-player-bar ytmusic-like-button-renderer')?.getAttribute('like-status') ?? ''`;
const CLICK = `document.querySelector('ytmusic-player-bar ytmusic-like-button-renderer #button-shape-like button')?.click()`;

async function evaluate(ws, expression) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1e9);
    ws.addEventListener('message', function on(ev) {
      const msg = JSON.parse(ev.data);
      if (msg.id !== id) return;
      ws.removeEventListener('message', on);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result.result.value);
    });
    ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, userGesture: true } }));
  });
}

try {
  const pages = await (await fetch(`http://127.0.0.1:${PORT}/json`, { signal: AbortSignal.timeout(1500) })).json();
  const page = pages.find(p => p.type === 'page' && p.url.startsWith('https://music.youtube.com'));
  if (!page) process.exit(2);
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((ok, fail) => { ws.onopen = ok; ws.onerror = fail; });
  if (process.argv[2] === 'toggle') {
    await evaluate(ws, CLICK);
    await new Promise(r => setTimeout(r, 400));
  }
  console.log(await evaluate(ws, STATUS));
  ws.close();
} catch {
  process.exit(2);
}
