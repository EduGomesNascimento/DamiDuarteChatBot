(() => {
  const VIDEO_SRC = "./Gatinho_Pendurado_na_Borda_Preta.mp4";
  const FREEZE_TIME = 7.0;
  const SCROLL_SLOP = 0.02;
  const SEEK_FPS = 72;
  const SMOOTH_RESPONSE = 11;
  const VIDEO_SCALE = 0.86;
  const BLACK_BAND_START = 0.74;
  const MIN_TIME_STEP = 1 / 45;

  const intro = document.getElementById("intro");
  const canvas = document.getElementById("heroCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });

  const video = document.createElement("video");
  video.src = VIDEO_SRC;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  let vw = 0;
  let vh = 0;
  let initialized = false;
  let targetTime = 0;
  let smoothTime = 0;
  let rafId = null;
  let lastTick = 0;
  let lastSeekAt = 0;
  let lastRequestedTime = -1;
  let hasRVFC = false;

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function setReadyState(isReady) {
    document.body.classList.toggle("site-ready", isReady);
  }

  function getPageProgress() {
    const rect = intro.getBoundingClientRect();
    const total = intro.offsetHeight - window.innerHeight;
    const scrolled = clamp(-rect.top, 0, total);
    return total > 0 ? scrolled / total : 0;
  }

  function drawFrame() {
    if (!video.videoWidth || !video.videoHeight) return;
    if (video.readyState < 2) return;

    const cw = vw;
    const ch = vh;
    const iw = video.videoWidth;
    const ih = video.videoHeight;

    const bg = ctx.createLinearGradient(0, 0, 0, ch);
    bg.addColorStop(0, "#d0d0d0");
    bg.addColorStop(0.5, "#c7c7c7");
    bg.addColorStop(1, "#bdbdbd");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // Draw slightly smaller to improve perceived sharpness from this source video.
    const scale = Math.min(cw / iw, ch / ih) * VIDEO_SCALE;
    const sw = iw * scale;
    const sh = ih * scale;
    const dx = (cw - sw) / 2;
    const dy = (ch - sh) / 2;

    ctx.drawImage(video, dx, dy, sw, sh);

    // Extend the video black strip to full width for a continuous look.
    const bandY = dy + sh * BLACK_BAND_START;
    if (bandY < ch) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, Math.max(0, bandY), cw, ch - Math.max(0, bandY));
    }
  }

  function resizeCanvas() {
    vw = window.innerWidth;
    vh = window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(vw * dpr);
    canvas.height = Math.floor(vh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame();
  }

  function seekToTime(time, nowMs) {
    if (!initialized) return;

    const safeDuration = Number.isFinite(video.duration) ? video.duration : FREEZE_TIME;
    const nextTime = clamp(time, 0, Math.min(FREEZE_TIME, safeDuration));
    const minSeekInterval = 1000 / SEEK_FPS;

    if (nowMs - lastSeekAt < minSeekInterval) return;
    if (Math.abs(lastRequestedTime - nextTime) <= MIN_TIME_STEP * 0.5) return;

    if (Math.abs(video.currentTime - nextTime) <= MIN_TIME_STEP * 0.5) return;

    lastSeekAt = nowMs;
    lastRequestedTime = nextTime;
    try {
      video.currentTime = nextTime;
    } catch {}
  }

  function updateTargetFromScroll() {
    const p = getPageProgress();
    targetTime = clamp(p * FREEZE_TIME, 0, FREEZE_TIME);
  }

  function loop(nowMs) {
    if (initialized) {
      updateTargetFromScroll();

      const dt = lastTick ? Math.min((nowMs - lastTick) / 1000, 0.1) : 1 / 60;
      lastTick = nowMs;

      // Exponential smoothing for a fluid scrub in both directions.
      const alpha = 1 - Math.exp(-SMOOTH_RESPONSE * dt);
      smoothTime += (targetTime - smoothTime) * alpha;

      setReadyState(smoothTime >= FREEZE_TIME - SCROLL_SLOP);
      seekToTime(smoothTime, nowMs);
      drawFrame();
    }
    rafId = requestAnimationFrame(loop);
  }

  async function init() {
    const skipIntro = new URLSearchParams(window.location.search).get("skipIntro") === "1";
    if (skipIntro) {
      setReadyState(true);
      initialized = true;
      return;
    }

    resizeCanvas();

    try {
      await video.play();
      video.pause();
    } catch {
      // Autoplay unlock can fail; seek-driven rendering still works.
    }

    initialized = true;
    updateTargetFromScroll();
    smoothTime = targetTime;
    seekToTime(smoothTime, performance.now());

    if (rafId) cancelAnimationFrame(rafId);
    lastTick = 0;
    rafId = requestAnimationFrame(loop);
    setupVideoFrameCallback();
  }

  video.addEventListener("loadeddata", init, { once: true });

  video.addEventListener("seeked", drawFrame);
  video.addEventListener("timeupdate", drawFrame);

  video.addEventListener("error", () => {
    const code = video.error ? video.error.code : "unknown";
    console.error("Falha ao carregar video:", VIDEO_SRC, "erro:", code);
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    updateTargetFromScroll();
  });

  video.load();

  function setupVideoFrameCallback() {
    if (typeof video.requestVideoFrameCallback !== "function" || hasRVFC) return;
    hasRVFC = true;

    const onFrame = () => {
      drawFrame();
      video.requestVideoFrameCallback(onFrame);
    };

    video.requestVideoFrameCallback(onFrame);
  }
})();

(() => {
  const revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("show");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    revealItems.forEach((item) => io.observe(item));
  }

  const gate = document.querySelector(".gate");
  const gateInner = document.querySelector(".gate-inner");
  if (gate && gateInner) {
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;

    gate.addEventListener("pointermove", (e) => {
      const r = gate.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 14;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 10;
    });

    gate.addEventListener("pointerleave", () => {
      tx = 0;
      ty = 0;
    });

    function animateGate() {
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      gateInner.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      requestAnimationFrame(animateGate);
    }

    requestAnimationFrame(animateGate);
  }

})();
