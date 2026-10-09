// Particle effects inside the dock, picked by the theme (Theme.fx), ported
// line by line from prototype/src/components/fx/effects. Each is created with
// its area's size ({ width, height }) and returns draw(ctx, dt, t, dock),
// dock = { left, right, top }: the line flakes land on (none inside the dock).
// Differences from the browser: no devicePixelRatio (the layer is drawn at
// 1:1), object spread and Canvas ellipse() spelled the QML way.
const rnd = (a, b) => a + Math.random() * (b - a);

const MELT = 1.8; // seconds a landed flake takes to disappear

export function snow(size, count = 220) {
  const flake = top => ({
    x: rnd(0, size.width), y: top ? -5 : rnd(0, size.height * .8),
    r: rnd(1, 3.4) * 1, vy: rnd(.4, 1.4), ph: rnd(0, 6.28), a: rnd(.5, .95),
    life: 0, // > 0 while resting on the dock
  });
  const flakes = Array.from({ length: count }, () => flake(false));
  const spills = []; // bits sliding off the cap's ends
  let spillIn = 1;

  return function draw(ctx, dt, t, dock) {
    const dpr = 1;
    // dock.top is the landing line (the snow cap's top when there is one, see fx.js)
    const left = dock.left * dpr, right = dock.right * dpr, floor = dock.top * dpr;
    ctx.fillStyle = '#fff';
    for (const p of flakes) {
      if (p.life > 0) {
        p.life -= dt / MELT;
        if (p.life <= 0) Object.assign(p, flake(true));
      } else {
        const before = p.y;
        p.y += p.vy * dpr * dt * 60;
        p.x += Math.sin(t * .02 + p.ph) * .5 * dpr;
        const overDock = p.x > left && p.x < right;
        if (overDock && p.y + p.r >= floor) {
          if (before + p.r <= floor + p.vy * dpr * 2) {
            p.y = floor - p.r; // reached the pets' floor: sit on it
            p.life = 1;
          } else {
            Object.assign(p, flake(true)); // drifted sideways under the dock top
          }
        } else if (p.y > size.height + 5) {
          Object.assign(p, flake(true));
        }
      }
      ctx.globalAlpha = p.a * (p.life > 0 ? p.life : 1);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.28);
      ctx.fill();
    }
    // spills: start at a cap end, drift outwards and fall past the dock
    if ((spillIn -= dt) <= 0) {
      spillIn = rnd(.6, 1.8);
      const side = Math.random() < .5 ? -1 : 1;
      spills.push({ x: (side < 0 ? left + rnd(6, 16) * dpr : right - rnd(6, 16) * dpr), y: floor + 6 * dpr,
        vx: side * rnd(.3, .9) * dpr, vy: rnd(.2, .6) * dpr, r: rnd(1.2, 2.6) * dpr, a: rnd(.6, .95) });
    }
    for (let i = spills.length - 1; i >= 0; i--) {
      const p = spills[i];
      p.vy += .05 * dpr * dt * 60; // gravity: they tumble, not float
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      if (p.y > size.height + 5) { spills.splice(i, 1); continue; }
      ctx.globalAlpha = p.a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.28);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // debug numbers, mirrored on the canvas as data-* by fx.js (CSS px)
    return {
      floorY: Math.round(floor / dpr),
      dockLeft: Math.round(dock.left), dockRight: Math.round(dock.right),
      flakes: flakes.length, landed: flakes.filter(p => p.life > 0).length, spilling: spills.length,
    };
  };
}

export function bats(size) {
  const bat = () => ({
    x: rnd(-200, -40), y: rnd(size.height * .08, size.height * .55),
    s: rnd(.6, 1.3) * 1, vx: rnd(1.6, 3.2), ph: rnd(0, 6.28), f: rnd(.25, .4),
  });
  const flock = Array.from({ length: 9 }, () => Object.assign(bat(), { x: rnd(0, size.width) }));

  function drawBat(ctx, b, t) {
    const flap = Math.sin(t * b.f * 2 + b.ph) * 0.9;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(b.s * 14, b.s * 14);
    ctx.fillStyle = '#120612';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(side * .8, -.9 * flap - .3, side * 1.9, -.5 * flap);
      ctx.quadraticCurveTo(side * 1.4, .1, side * 1.1, .15);
      ctx.quadraticCurveTo(side * .8, -.05, side * .55, .3);
      ctx.quadraticCurveTo(side * .3, .1, 0, .2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.ellipse(-.22, .1 - .32, .44, .64); // QML: x, y, w, h
    ctx.fill();
    ctx.restore();
  }

  return function draw(ctx, dt, t) {
    const dpr = 1;
    for (const b of flock) {
      b.x += b.vx * dpr * dt * 60;
      b.y += Math.sin(t * .03 + b.ph) * .8 * dpr;
      if (b.x > size.width + 60) Object.assign(b, bat());
      drawBat(ctx, b, t * .1);
    }
  };
}

export const effects = { snow, bats };
