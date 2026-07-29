/* ============================================
   TWINKLING STARS BACKGROUND
   Renders animated sparkling stars on a canvas
   Scoped to the #app container (phone frame)
   ============================================ */
(function () {
  const canvas = document.getElementById('stars-canvas');
  const app = document.getElementById('app');
  if (!canvas || !app) return;
  const ctx = canvas.getContext('2d');

  let stars = [];
  const STAR_COUNT = 100;
  let animId = null;

  /* ---------- helpers ---------- */
  function resize() {
    const rect = app.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = app.scrollHeight || rect.height;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  /* ---------- star factory ---------- */
  function createStar() {
    // Pick a color palette: mostly white/blue-ish, some gold, some purple
    const palette = [
      'rgba(255,255,255,',       // white
      'rgba(255,255,255,',       // white (more common)
      'rgba(212,175,55,',        // gold
      'rgba(168,130,255,',       // light purple
      'rgba(200,220,255,',       // blue-ish white
    ];
    const colorBase = palette[Math.floor(Math.random() * palette.length)];

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: randomBetween(0.4, 2.2),
      colorBase: colorBase,
      alpha: randomBetween(0.1, 1),
      // Each star has its own twinkle speed and phase
      twinkleSpeed: randomBetween(0.0008, 0.004),
      twinklePhase: randomBetween(0, Math.PI * 2),
      // Subtle drift
      dx: randomBetween(-0.05, 0.05),
      dy: randomBetween(-0.02, 0.02),
    };
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(createStar());
    }
  }

  /* ---------- draw ---------- */
  function drawStar(s, time) {
    // Compute twinkle alpha using sine wave
    const twinkle = Math.sin(time * s.twinkleSpeed + s.twinklePhase);
    const alpha = Math.max(0.05, s.alpha * (0.5 + 0.5 * twinkle));

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = s.colorBase + alpha.toFixed(3) + ')';
    ctx.fill();

    // Glow effect for brighter / larger stars
    if (s.radius > 1.2 && alpha > 0.5) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius * 3, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(
        s.x, s.y, s.radius * 0.5,
        s.x, s.y, s.radius * 3
      );
      grad.addColorStop(0, s.colorBase + (alpha * 0.35).toFixed(3) + ')');
      grad.addColorStop(1, s.colorBase + '0)');
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  function update(s) {
    s.x += s.dx;
    s.y += s.dy;

    // Wrap around edges within app bounds
    if (s.x < -5) s.x = canvas.width + 5;
    if (s.x > canvas.width + 5) s.x = -5;
    if (s.y < -5) s.y = canvas.height + 5;
    if (s.y > canvas.height + 5) s.y = -5;
  }

  /* ---------- loop ---------- */
  let startTime = null;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const time = timestamp - startTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const s of stars) {
      update(s);
      drawStar(s, time);
    }

    animId = requestAnimationFrame(animate);
  }

  /* ---------- init ---------- */
  resize();
  initStars();
  animId = requestAnimationFrame(animate);

  // Re-size canvas when window resizes
  window.addEventListener('resize', () => {
    resize();
    initStars();
  });

  // Also observe #app size changes (e.g. content loads)
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(app);
  }
})();
