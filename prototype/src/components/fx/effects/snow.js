// Snowflakes falling over the wallpaper. Above the dock they land on the same
// line the pets walk on (the snow cap on the dock), rest there a moment and melt;
// beside the dock they keep falling to the bottom of the screen. No flake is
// ever drawn behind the dock's glass.
const rnd = (a, b) => a + Math.random() * (b - a);
const MELT = 1.8; // seconds a landed flake takes to disappear
const CAP = 7;    // the theme's snow cap rises this far above the dock: land on top of it

export function snow(canvas) {
  const flake = top => ({
    x: rnd(0, canvas.width), y: top ? -5 : rnd(0, canvas.height * .8),
    r: rnd(1, 3.4) * devicePixelRatio, vy: rnd(.4, 1.4), ph: rnd(0, 6.28), a: rnd(.5, .95),
    life: 0, // > 0 while resting on the dock
  });
  const flakes = Array.from({ length: 220 }, () => flake(false));

  return function draw(ctx, dt, t, dock) {
    const dpr = devicePixelRatio;
    const left = dock.left * dpr, right = dock.right * dpr, floor = (dock.top - CAP) * dpr;
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
        } else if (p.y > canvas.height + 5) {
          Object.assign(p, flake(true));
        }
      }
      ctx.globalAlpha = p.a * (p.life > 0 ? p.life : 1);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.28);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // debug numbers, mirrored on the canvas as data-* by fx.js (CSS px)
    return {
      floorY: Math.round(floor / dpr),
      dockLeft: Math.round(dock.left), dockRight: Math.round(dock.right),
      flakes: flakes.length, landed: flakes.filter(p => p.life > 0).length,
    };
  };
}
