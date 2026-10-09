// Snowflakes falling over the wallpaper. Nothing falls below the top of the
// dock (snow cap included): flakes fade out just above it and respawn on top.
const rnd = (a, b) => a + Math.random() * (b - a);
const CAP = 9;   // px the theme's snow cap rises above the dock
const FADE = 36; // px over which a flake fades before reaching the floor

export function snow(canvas) {
  const flake = top => ({
    x: rnd(0, canvas.width), y: top ? -5 : rnd(0, canvas.height * .8),
    r: rnd(1, 3.4) * devicePixelRatio, vy: rnd(.4, 1.4), ph: rnd(0, 6.28), a: rnd(.5, .95),
  });
  const flakes = Array.from({ length: 220 }, () => flake(false));

  return function draw(ctx, dt, t, dock) {
    const dpr = devicePixelRatio;
    const floor = (dock.top - CAP) * dpr;
    ctx.fillStyle = '#fff';
    for (const p of flakes) {
      p.y += p.vy * dpr * dt * 60;
      p.x += Math.sin(t * .02 + p.ph) * .5 * dpr;
      if (p.y + p.r >= floor) Object.assign(p, flake(true));
      ctx.globalAlpha = p.a * Math.min(1, (floor - p.y - p.r) / (FADE * dpr));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.28);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };
}
