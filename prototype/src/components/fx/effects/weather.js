// The current weather, live inside the dock (ui.weatherFx): rain, drizzle and
// storms streak down and splash on the dock's floor, fog and clouds drift
// across, a clear day glows and floats a few motes, a clear night twinkles.
// Snow reuses the theme's snow effect (snow.js). Shared with the shell
// (lib/weather-fx.mjs links here): `canvas` only needs width and height, there
// is no devicePixelRatio in QML, and no spread or browser-only Canvas calls.
const rnd = (a, b) => a + Math.random() * (b - a);
const ratio = () => (typeof devicePixelRatio === 'number' ? devicePixelRatio : 1);

// WMO code (Open-Meteo) -> effect id, or null for nothing
export function weatherFx(code, isDay = true) {
  if (code <= 1) return isDay ? 'sun' : 'stars';
  if (code <= 3) return 'clouds';
  if (code <= 48) return 'fog';
  if (code <= 57) return 'drizzle';
  if (code === 65 || code === 67 || code === 82) return 'downpour';
  if (code <= 67 || (code >= 80 && code <= 82)) return 'rain';
  if (code <= 77 || code === 85 || code === 86) return 'snow';
  return 'storm';
}

// streaks falling a little slanted; each one splashes where it lands
function falling(canvas, count, { speed, len, alpha, width, flash = false }) {
  const dpr = ratio();
  const drop = top => ({ x: rnd(-20, canvas.width), y: top ? rnd(-40, 0) : rnd(0, canvas.height), v: rnd(.8, 1.2) });
  const drops = Array.from({ length: count }, () => drop(false));
  const splashes = [];
  let flashIn = rnd(3, 7), glow = 0;
  return function draw(ctx, dt) {
    const floor = canvas.height;
    ctx.strokeStyle = `rgba(186, 230, 253, ${alpha})`;
    ctx.lineWidth = width * dpr;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const d of drops) {
      d.y += speed * d.v * dpr * dt * 60;
      d.x += speed * .18 * d.v * dpr * dt * 60;
      if (d.y > floor) {
        if (splashes.length < 40) splashes.push({ x: d.x, life: 1 });
        Object.assign(d, drop(true));
      }
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - len * .18 * dpr, d.y - len * dpr);
    }
    ctx.stroke();
    // splashes: two tiny arcs that open and fade
    ctx.lineWidth = dpr;
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      s.life -= dt * 3;
      if (s.life <= 0) { splashes.splice(i, 1); continue; }
      const r = (1 - s.life) * 4 * dpr;
      ctx.strokeStyle = `rgba(186, 230, 253, ${alpha * s.life})`;
      ctx.beginPath();
      ctx.arc(s.x - r, floor, r, Math.PI * 1.2, Math.PI * 1.8);
      ctx.arc(s.x + r, floor, r, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();
    }
    if (flash) {
      if ((flashIn -= dt) <= 0) { flashIn = rnd(3, 8); glow = 1; }
      if (glow > 0) {
        // a double flicker, like lightning
        const k = glow > .7 ? glow : glow > .5 ? .2 : glow * .8;
        ctx.fillStyle = `rgba(237, 233, 254, ${k * .55})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        glow -= dt * 2.2;
      }
    }
    return { drops: drops.length };
  };
}

export const rain = (canvas, count) => falling(canvas, Math.round(count * 1.6), { speed: 7, len: 10, alpha: .6, width: 1.2 });
export const downpour = (canvas, count) => falling(canvas, Math.round(count * 2.8), { speed: 9, len: 13, alpha: .65, width: 1.3 });
export const drizzle = (canvas, count) => falling(canvas, Math.round(count * 1.1), { speed: 4, len: 4, alpha: .45, width: 1 });
export const storm = (canvas, count) => falling(canvas, Math.round(count * 2.6), { speed: 10, len: 14, alpha: .65, width: 1.3, flash: true });

// soft shapes drifting sideways: fog bands, or clouds made of puffs
function drifting(canvas, { n, make, paint }) {
  const items = Array.from({ length: n }, (_, i) => make(i / n));
  return function draw(ctx, dt) {
    for (const it of items) {
      it.x += it.vx * ratio() * dt * 60;
      if (it.x - it.w > canvas.width) Object.assign(it, make(0), { x: -it.w });
      paint(ctx, it);
    }
  };
}

export const fog = canvas => drifting(canvas, {
  n: 5,
  make: f => ({ x: f * canvas.width, y: rnd(.2, .9) * canvas.height, w: rnd(.3, .6) * canvas.width, h: rnd(.25, .5) * canvas.height, vx: rnd(.15, .35), a: rnd(.1, .18) }),
  paint: (ctx, b) => {
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.w / 2);
    g.addColorStop(0, `rgba(226, 232, 240, ${b.a})`);
    g.addColorStop(1, 'rgba(226, 232, 240, 0)');
    ctx.fillStyle = g;
    // an ellipse as a scaled circle (QML's Canvas has no browser-style ellipse())
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(1, b.h / (b.w / 2));
    ctx.beginPath();
    ctx.arc(0, 0, b.w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
});

export const clouds = canvas => drifting(canvas, {
  n: 4,
  make: f => {
    const s = rnd(.5, .9) * canvas.height;
    return { x: f * canvas.width * 1.2, y: rnd(.25, .6) * canvas.height, w: s * 2.2, s, vx: rnd(.2, .4), a: rnd(.1, .16) };
  },
  paint: (ctx, c) => {
    for (const [dx, dy, r] of [[-.7, .2, .5], [-.2, -.05, .7], [.35, .05, .6], [.8, .22, .45]]) {
      const x = c.x + dx * c.s, y = c.y + dy * c.s, R = r * c.s;
      const g = ctx.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, `rgba(241, 245, 249, ${c.a})`);
      g.addColorStop(1, 'rgba(241, 245, 249, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - R, y - R, R * 2, R * 2);
    }
  },
});

// a warm glow sweeping slowly along the dock, and a few motes of light floating up
export function sun(canvas) {
  const motes = Array.from({ length: 14 }, () => ({ x: rnd(0, canvas.width), y: rnd(0, canvas.height), v: rnd(.1, .3), ph: rnd(0, 6.28) }));
  return function draw(ctx, dt, t) {
    const dpr = ratio();
    const cx = (Math.sin(t * .002) * .4 + .5) * canvas.width;
    const g = ctx.createRadialGradient(cx, -canvas.height * .3, 0, cx, -canvas.height * .3, canvas.height * 2.2);
    g.addColorStop(0, 'rgba(253, 224, 71, .22)');
    g.addColorStop(.5, 'rgba(251, 191, 36, .07)');
    g.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const m of motes) {
      m.y -= m.v * dpr * dt * 60;
      m.x += Math.sin(t * .02 + m.ph) * .2 * dpr;
      if (m.y < -4) Object.assign(m, { y: canvas.height + 4, x: rnd(0, canvas.width) });
      ctx.fillStyle = `rgba(254, 240, 138, ${.35 + .3 * Math.sin(t * .05 + m.ph)})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 1.3 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
  };
}

// a clear night: stars twinkling
export function stars(canvas) {
  const sky = Array.from({ length: Math.round(canvas.width / 18) }, () => ({ x: rnd(0, canvas.width), y: rnd(0, canvas.height), r: rnd(.5, 1.4), ph: rnd(0, 6.28), f: rnd(.02, .06) }));
  return function draw(ctx, dt, t) {
    const dpr = ratio();
    for (const s of sky) {
      ctx.fillStyle = `rgba(248, 250, 252, ${.25 + .55 * (.5 + .5 * Math.sin(t * s.f + s.ph))})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
  };
}
