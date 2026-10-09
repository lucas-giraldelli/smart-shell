// Snowflakes falling over the wallpaper. Flakes above the dock land on it
// (on the theme's snow cap) instead of falling behind the glass.
const rnd = (a, b) => a + Math.random() * (b - a);

export function snow(canvas) {
  const flake = top => ({
    x: rnd(0, canvas.width), y: top ? -5 : rnd(0, canvas.height),
    r: rnd(1, 3.4) * devicePixelRatio, vy: rnd(.4, 1.4), ph: rnd(0, 6.28), a: rnd(.5, .95),
  });
  const flakes = Array.from({ length: 220 }, () => flake(false));

  return function draw(ctx, dt, t, dock) {
    const dpr = devicePixelRatio;
    const left = dock.left * dpr, right = dock.right * dpr, top = (dock.top - 2) * dpr;
    ctx.fillStyle = '#fff';
    for (const p of flakes) {
      p.y += p.vy * dpr * dt * 60;
      p.x += Math.sin(t * .02 + p.ph) * .5 * dpr;
      const floor = p.x > left && p.x < right ? top : canvas.height + 5;
      if (p.y > floor) Object.assign(p, flake(true));
      ctx.globalAlpha = p.a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.28);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };
}
