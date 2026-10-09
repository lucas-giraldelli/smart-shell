// Bats flapping across the upper half of the screen.
const rnd = (a, b) => a + Math.random() * (b - a);

export function bats(canvas) {
  const bat = () => ({
    x: rnd(-200, -40), y: rnd(canvas.height * .08, canvas.height * .55),
    s: rnd(.6, 1.3) * devicePixelRatio, vx: rnd(1.6, 3.2), ph: rnd(0, 6.28), f: rnd(.25, .4),
  });
  const flock = Array.from({ length: 9 }, () => ({ ...bat(), x: rnd(0, canvas.width) }));

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
    ctx.ellipse(0, .1, .22, .32, 0, 0, 6.28);
    ctx.fill();
    ctx.restore();
  }

  return function draw(ctx, dt, t) {
    const dpr = devicePixelRatio;
    for (const b of flock) {
      b.x += b.vx * dpr * dt * 60;
      b.y += Math.sin(t * .03 + b.ph) * .8 * dpr;
      if (b.x > canvas.width + 60) Object.assign(b, bat());
      drawBat(ctx, b, t * .1);
    }
  };
}
