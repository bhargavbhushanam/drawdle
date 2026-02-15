const drawCanvas = document.getElementById("drawCanvas");
const refCanvas = document.getElementById("refCanvas");
const ctx = drawCanvas.getContext("2d");
const refCtx = refCanvas.getContext("2d");
const timerValue = document.getElementById("timerValue");
const timerRingFill = document.getElementById("timerRingFill");
const submitBtnEl = document.getElementById("submitBtn");
const scoreValue = document.getElementById("scoreValue");
const shareScore = document.getElementById("shareScore");
const shareCard = document.getElementById("shareCard");
const clearBtn = document.getElementById("clearBtn");
const eraseBtn = document.getElementById("eraseBtn");
const promptTitleEl = document.getElementById("promptTitle");
const promptHintEl = document.getElementById("promptHint");
const referenceSvg = document.getElementById("referenceSvg");
const shareBtn = document.getElementById("shareBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const referencePreview = document.getElementById("referencePreview");
const comparisonCard = document.getElementById("comparisonCard");
const playArea = document.getElementById("playArea");
const devResetBtn = document.getElementById("devResetBtn");
const modal = document.getElementById("modal");
const statsModal = document.getElementById("statsModal");
const dailyBadge = document.getElementById("dailyBadge");
const streakValue = document.getElementById("streakValue");
const bestValue = document.getElementById("bestValue");
const playsValue = document.getElementById("playsValue");
const shareHeadline = document.getElementById("shareHeadline");
const shareSub = document.getElementById("shareSub");
const shareGridEl = document.getElementById("shareGrid");
const statsBadges = document.getElementById("statsBadges");
const statStreak = document.getElementById("statStreak");
const statBest = document.getElementById("statBest");
const statPlays = document.getElementById("statPlays");
const statAvg = document.getElementById("statAvg");
const scoreFeedbackEl = document.getElementById("scoreFeedback");
const readyOverlay = document.getElementById("readyOverlay");
const startDrawBtn = document.getElementById("startDrawBtn");
const readyPromptLabel = document.getElementById("readyPromptLabel");
const shareGridVisual = document.getElementById("shareGridVisual");
const maskedRefCanvas = document.getElementById("maskedRefCanvas");
const maskedRefCtx = maskedRefCanvas.getContext("2d");
const refGuideEl = document.querySelector(".ref-guide");
const timerRingEl = document.querySelector(".timer-ring");

let drawing = false;
let gameStarted = false;
let erasing = false;
let brushSize = 8;
if ("ontouchstart" in window) brushSize = 10;
let timer = 30;
const timerMax = 30;
let intervalId = null;
let roundLocked = false;
let timerStarted = false;
let hasScored = false;
const timerRingCircumference = 2 * Math.PI * 34;
const prompts = [
  { key: "bicycle", title: "Bicycle", hint: "Two wheels, infinite freedom." },
  { key: "camera", title: "Vintage Camera", hint: "Say cheese. Click." },
  { key: "headphones", title: "Headphones", hint: "Block out the world." },
  { key: "sneaker", title: "Sneaker", hint: "Lace up and go." },
  { key: "cupcake", title: "Cupcake", hint: "Frosting is mandatory." },
  { key: "cactus", title: "Cactus", hint: "Cute but prickly." },
  { key: "backpack", title: "Backpack", hint: "Pack light, draw heavy." },
  { key: "telescope", title: "Telescope", hint: "Stars are waiting." },
  { key: "lantern", title: "Lantern", hint: "Light the way." },
  { key: "globe", title: "Globe", hint: "Spin it. Pick a spot." },
  { key: "drum", title: "Drum Set", hint: "Ba dum tss." },
  { key: "paintbrush", title: "Paint Palette", hint: "Art about art." },
  { key: "teapot", title: "Teapot", hint: "Short and stout." },
  { key: "trophy", title: "Trophy", hint: "You earned this one." },
  { key: "scissors", title: "Scissors", hint: "Don't run with them." },
  { key: "binoculars", title: "Binoculars", hint: "I spy with my little eye." },
  { key: "watercan", title: "Watering Can", hint: "Garden goals." },
  { key: "skateboard", title: "Skateboard", hint: "Kickflip optional." },
  { key: "microscope", title: "Microscope", hint: "Look closer." },
  { key: "compass", title: "Compass", hint: "Find your north." },
  { key: "alarm", title: "Alarm Clock", hint: "Five more minutes." },
  { key: "mailbox", title: "Mailbox", hint: "You've got mail." },
  { key: "helicopter", title: "Helicopter", hint: "Chop chop chop." },
  { key: "whale", title: "Whale", hint: "A whale of a time." },
  { key: "pineapple", title: "Pineapple", hint: "Tropical vibes only." },
  { key: "frog", title: "Frog", hint: "Ribbit ribbit." },
  { key: "tent", title: "Camping Tent", hint: "Under the stars." },
  { key: "wrench", title: "Wrench & Bolt", hint: "Fix it up." },
  { key: "saxophone", title: "Saxophone", hint: "Smooth jazz." },
  { key: "swan", title: "Swan", hint: "Grace on water." },
];
let dailyPrompt = prompts[0];
const strokes = [];
let activeStroke = null;

ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.strokeStyle = "#151720";
ctx.lineWidth = brushSize;

const storageKey = "drawdleStats";

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate() {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getDailyPrompt() {
  const seed = getTodayKey().split("-").join("");
  const value = Number(seed);
  const index = value % prompts.length;
  return prompts[index];
}

function loadStats() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return {
      streak: 0,
      best: null,
      plays: 0,
      totalScore: 0,
      lastPlayed: null,
      lastScored: null,
      lastScore: null,
    };
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return {
      streak: 0,
      best: null,
      plays: 0,
      totalScore: 0,
      lastPlayed: null,
      lastScored: null,
      lastScore: null,
    };
  }
}

function saveStats(stats) {
  localStorage.setItem(storageKey, JSON.stringify(stats));
}

function updateStatsUI(stats) {
  if (streakValue) streakValue.textContent = stats.streak;
  if (bestValue) bestValue.textContent = stats.best ?? "—";
  if (playsValue) playsValue.textContent = stats.plays;
  shareSub.textContent = `Streak ${stats.streak} · ${stats.plays} plays`;
  statStreak.textContent = stats.streak;
  statBest.textContent = stats.best ?? "—";
  statPlays.textContent = stats.plays;
  statAvg.textContent =
    stats.plays > 0 ? Math.round(stats.totalScore / stats.plays) : "—";
  renderBadges(statsBadges, stats);
}

function renderBadges(container, stats, score) {
  container.innerHTML = "";
  const badges = [];
  if (score !== undefined) {
    if (score >= 90) badges.push("Line Legend");
    else if (score >= 75) badges.push("Clean Lines");
    else if (score >= 50) badges.push("Solid Sketch");
    else badges.push("Brave Starter");
  }
  if (stats.streak >= 7) badges.push("7-day streak");
  if (stats.streak >= 30) badges.push("30-day streak");
  if (stats.best && stats.best >= 95) badges.push("Near perfect");
  if (badges.length === 0) badges.push("First Sketch");

  badges.forEach((label) => {
    const pill = document.createElement("div");
    pill.className = "badge-pill";
    pill.textContent = label;
    container.appendChild(pill);
  });
}

function setBrush(size) {
  brushSize = size;
  ctx.lineWidth = brushSize;
  erasing = false;
  ctx.globalCompositeOperation = "source-over";
}

function updateTimerRing() {
  if (!timerRingFill) return;
  const remaining = timer / timerMax;
  timerRingFill.setAttribute("stroke-dasharray", timerRingCircumference);
  timerRingFill.setAttribute("stroke-dashoffset", (1 - remaining) * timerRingCircumference);
}

function beginGame() {
  if (gameStarted) return;
  gameStarted = true;
  if (readyOverlay) readyOverlay.classList.add("dismissed");
  startRound();
}

function startRound() {
  if (timerStarted) return;
  timerStarted = true;
  clearInterval(intervalId);
  timer = timerMax;
  timerValue.textContent = timer;
  roundLocked = false;
  hasScored = false;
  updateTimerRing();
  if (clearBtn) clearBtn.textContent = "Start over";
  intervalId = setInterval(() => {
    timer -= 1;
    timerValue.textContent = timer;
    updateTimerRing();
    if (timer <= 5 && timerRingFill) {
      timerRingFill.classList.add("warning");
    }
    if (timer <= 5 && timerRingEl) {
      timerRingEl.classList.add("pulse");
      setTimeout(() => timerRingEl.classList.remove("pulse"), 600);
    }
    if (timer <= 0) {
      clearInterval(intervalId);
      roundLocked = true;
      if (!hasScored) {
        handleScore({ auto: true });
      }
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(intervalId);
  timerStarted = false;
  gameStarted = false;
  timer = timerMax;
  timerValue.textContent = timer;
  roundLocked = false;
  hasScored = false;
  updateTimerRing();
  if (timerRingFill) timerRingFill.classList.remove("warning");
  if (clearBtn) clearBtn.classList.remove("hidden");
  if (eraseBtn) eraseBtn.classList.remove("hidden");
  if (readyOverlay) readyOverlay.classList.remove("dismissed");
  intervalId = null;
}

function getPosition(event) {
  const rect = drawCanvas.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  return {
    x: (clientX - rect.left) * (drawCanvas.width / rect.width),
    y: (clientY - rect.top) * (drawCanvas.height / rect.height),
  };
}

function startDraw(event) {
  if (timer <= 0 || roundLocked) return;
  if (!gameStarted) beginGame();
  drawing = true;
  ctx.lineWidth = brushSize;
  ctx.strokeStyle = "#151720";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
  const { x, y } = getPosition(event);
  ctx.beginPath();
  ctx.moveTo(x, y);
  activeStroke = {
    points: [{ x, y }],
    size: brushSize,
    mode: erasing ? "erase" : "draw",
  };
}

function moveDraw(event) {
  if (!drawing || timer <= 0 || roundLocked) return;
  const { x, y } = getPosition(event);
  if (erasing) {
    ctx.clearRect(x - brushSize, y - brushSize, brushSize * 2, brushSize * 2);
  } else {
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  if (activeStroke) {
    activeStroke.points.push({ x, y });
  }
}

function endDraw() {
  drawing = false;
  if (activeStroke && activeStroke.points.length > 1) {
    strokes.push(activeStroke);
  }
  activeStroke = null;
}

function clearCanvas(resetRound) {
  if (roundLocked) return;
  ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  scoreValue.textContent = "—";
  shareScore.textContent = "Score —";
  shareBtn.disabled = true;
  if (shareCard) shareCard.classList.add("hidden");
  if (shareGridEl) shareGridEl.textContent = "";
  if (shareGridVisual) shareGridVisual.innerHTML = "";
  referencePreview.classList.remove("revealed");
  if (comparisonCard) comparisonCard.classList.add("hidden");
  // single-column layout, no reference toggle needed
  if (scoreFeedbackEl) scoreFeedbackEl.textContent = "";
  strokes.length = 0;
  ctx.globalCompositeOperation = "source-over";
  if (resetRound) {
    resetTimer();
  }
}

function finishRound() {
  clearInterval(intervalId);
  roundLocked = true;
  if (clearBtn) clearBtn.classList.add("hidden");
  if (eraseBtn) eraseBtn.classList.add("hidden");
}

function handleScore({ auto = false } = {}) {
  if (hasScored) return;
  const currentStats = loadStats();
  if (currentStats.lastScored === getTodayKey()) {
    restoreTodayState(currentStats);
    lockAttemptUI();
    return;
  }

  if (!auto && strokes.length === 0) {
    submitBtnEl.textContent = "Draw something first!";
    submitBtnEl.classList.add("submit-scoring");
    setTimeout(() => {
      submitBtnEl.textContent = "Score drawing";
      submitBtnEl.classList.remove("submit-scoring");
    }, 1500);
    return;
  }

  if (submitBtnEl) {
    submitBtnEl.textContent = "Scoring...";
    submitBtnEl.classList.add("submit-scoring");
  }

  finishRound();
  hasScored = true;
  timerStarted = true;

  requestAnimationFrame(() => {
    const score = scoreDrawing();
    scoreValue.textContent = score;
    scoreValue.classList.add("revealed");
    shareScore.textContent = `Score ${score}`;
    shareBtn.disabled = false;
    if (shareCard) shareCard.classList.remove("hidden");
    if (shareGridEl) shareGridEl.textContent = buildShareGrid(score);
    renderShareGridVisual(score);
    revealFullReference();
    const stats = updateStatsOnScore(score);
    renderBadges(statsBadges, stats, score);
    if (scoreFeedbackEl) setScoreFeedback(score, stats);
    lockAttemptUI();
  });
}

function restoreTodayState(stats) {
  if (!stats || stats.lastScore === null) return;
  finishRound();
  gameStarted = true;
  timerStarted = true;
  hasScored = true;
  timer = 0;
  timerValue.textContent = "0";
  updateTimerRing();
  if (readyOverlay) readyOverlay.classList.add("dismissed");
  scoreValue.textContent = stats.lastScore;
  shareScore.textContent = `Score ${stats.lastScore}`;
  shareBtn.disabled = false;
  if (shareCard) shareCard.classList.remove("hidden");
  if (shareGridEl) shareGridEl.textContent = buildShareGrid(stats.lastScore);
  renderShareGridVisual(stats.lastScore);
  if (scoreFeedbackEl) setScoreFeedback(stats.lastScore, stats);
  revealFullReference();
}

// Shared prompt drawing functions — each draws into a 520×420 coordinate space
const promptDrawFns = {
  bicycle(c) {
    // rear wheel
    c.beginPath(); c.arc(150, 280, 65, 0, Math.PI * 2); c.stroke();
    // front wheel
    c.beginPath(); c.arc(370, 280, 65, 0, Math.PI * 2); c.stroke();
    // rear hub
    c.beginPath(); c.arc(150, 280, 5, 0, Math.PI * 2); c.stroke();
    // front hub
    c.beginPath(); c.arc(370, 280, 5, 0, Math.PI * 2); c.stroke();
    // rear spokes
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      c.beginPath(); c.moveTo(150 + 5 * Math.cos(a), 280 + 5 * Math.sin(a));
      c.lineTo(150 + 65 * Math.cos(a), 280 + 65 * Math.sin(a)); c.stroke();
    }
    // front spokes
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      c.beginPath(); c.moveTo(370 + 5 * Math.cos(a), 280 + 5 * Math.sin(a));
      c.lineTo(370 + 65 * Math.cos(a), 280 + 65 * Math.sin(a)); c.stroke();
    }
    // frame: seat tube
    c.beginPath(); c.moveTo(150, 280); c.lineTo(210, 170); c.stroke();
    // frame: top tube
    c.beginPath(); c.moveTo(210, 170); c.lineTo(330, 180); c.stroke();
    // frame: down tube
    c.beginPath(); c.moveTo(150, 280); c.lineTo(330, 180); c.stroke();
    // frame: fork
    c.beginPath(); c.moveTo(330, 180); c.lineTo(370, 280); c.stroke();
    // seat
    c.beginPath(); c.moveTo(195, 165); c.lineTo(225, 165); c.stroke();
    // handlebars
    c.beginPath(); c.moveTo(330, 180); c.lineTo(345, 155);
    c.quadraticCurveTo(355, 145, 365, 150); c.stroke();
    // pedal crank
    c.beginPath(); c.arc(230, 280, 18, 0, Math.PI * 2); c.stroke();
    // chain stay
    c.beginPath(); c.moveTo(150, 280); c.lineTo(230, 280); c.stroke();
  },
  camera(c) {
    // body
    c.beginPath();
    c.moveTo(130, 150); c.lineTo(390, 150); c.quadraticCurveTo(410, 150, 410, 170);
    c.lineTo(410, 310); c.quadraticCurveTo(410, 330, 390, 330);
    c.lineTo(130, 330); c.quadraticCurveTo(110, 330, 110, 310);
    c.lineTo(110, 170); c.quadraticCurveTo(110, 150, 130, 150); c.stroke();
    // viewfinder bump
    c.beginPath(); c.moveTo(220, 150); c.lineTo(230, 120); c.lineTo(290, 120); c.lineTo(300, 150); c.stroke();
    // lens outer
    c.beginPath(); c.arc(260, 240, 60, 0, Math.PI * 2); c.stroke();
    // lens inner
    c.beginPath(); c.arc(260, 240, 40, 0, Math.PI * 2); c.stroke();
    // lens center
    c.beginPath(); c.arc(260, 240, 15, 0, Math.PI * 2); c.stroke();
    // flash
    c.beginPath(); c.rect(340, 165, 40, 25); c.stroke();
    // viewfinder window
    c.beginPath(); c.rect(145, 170, 30, 20); c.stroke();
    // shutter button
    c.beginPath(); c.arc(350, 135, 10, 0, Math.PI * 2); c.stroke();
    // grip lines
    c.beginPath(); c.moveTo(125, 200); c.lineTo(125, 290); c.stroke();
    c.beginPath(); c.moveTo(132, 200); c.lineTo(132, 290); c.stroke();
  },
  headphones(c) {
    // headband
    c.beginPath(); c.arc(260, 180, 110, Math.PI, 0); c.stroke();
    // headband inner
    c.beginPath(); c.arc(260, 180, 90, Math.PI + 0.2, -0.2); c.stroke();
    // left connector
    c.beginPath(); c.moveTo(150, 180); c.lineTo(150, 230); c.stroke();
    // right connector
    c.beginPath(); c.moveTo(370, 180); c.lineTo(370, 230); c.stroke();
    // left ear cup outer
    c.beginPath(); c.ellipse(145, 280, 35, 50, 0, 0, Math.PI * 2); c.stroke();
    // left ear cup inner
    c.beginPath(); c.ellipse(145, 280, 20, 35, 0, 0, Math.PI * 2); c.stroke();
    // right ear cup outer
    c.beginPath(); c.ellipse(375, 280, 35, 50, 0, 0, Math.PI * 2); c.stroke();
    // right ear cup inner
    c.beginPath(); c.ellipse(375, 280, 20, 35, 0, 0, Math.PI * 2); c.stroke();
    // left padding
    c.beginPath(); c.moveTo(130, 240); c.quadraticCurveTo(115, 280, 130, 320); c.stroke();
    // right padding
    c.beginPath(); c.moveTo(390, 240); c.quadraticCurveTo(405, 280, 390, 320); c.stroke();
    // headband cushion
    c.beginPath(); c.arc(260, 175, 30, Math.PI + 0.5, -0.5); c.stroke();
  },
  sneaker(c) {
    // sole
    c.beginPath(); c.moveTo(80, 310); c.lineTo(420, 310);
    c.quadraticCurveTo(440, 310, 440, 295); c.lineTo(440, 285);
    c.lineTo(80, 285); c.quadraticCurveTo(70, 285, 70, 295);
    c.quadraticCurveTo(70, 310, 80, 310); c.stroke();
    // upper shoe
    c.beginPath(); c.moveTo(90, 285); c.lineTo(90, 230);
    c.quadraticCurveTo(90, 190, 130, 180); c.lineTo(250, 180);
    c.lineTo(250, 285); c.stroke();
    // toe cap
    c.beginPath(); c.moveTo(250, 285); c.lineTo(250, 220);
    c.quadraticCurveTo(300, 200, 380, 230);
    c.quadraticCurveTo(440, 250, 440, 285); c.stroke();
    // toe cap line
    c.beginPath(); c.moveTo(310, 285); c.quadraticCurveTo(360, 245, 420, 265); c.stroke();
    // ankle collar
    c.beginPath(); c.moveTo(90, 230); c.quadraticCurveTo(120, 175, 175, 170);
    c.quadraticCurveTo(210, 168, 240, 180); c.stroke();
    // tongue
    c.beginPath(); c.moveTo(170, 180); c.lineTo(165, 150); c.lineTo(210, 145); c.lineTo(215, 180); c.stroke();
    // lace holes
    c.beginPath(); c.arc(155, 200, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(155, 220, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(155, 240, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(225, 200, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(225, 220, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(225, 240, 4, 0, Math.PI * 2); c.stroke();
    // laces
    c.beginPath(); c.moveTo(159, 200); c.lineTo(221, 220);
    c.moveTo(159, 220); c.lineTo(221, 240);
    c.moveTo(159, 240); c.lineTo(221, 200); c.stroke();
    // sole tread
    c.beginPath(); c.moveTo(120, 300); c.lineTo(120, 310);
    c.moveTo(160, 300); c.lineTo(160, 310);
    c.moveTo(200, 300); c.lineTo(200, 310);
    c.moveTo(240, 300); c.lineTo(240, 310);
    c.moveTo(280, 300); c.lineTo(280, 310);
    c.moveTo(320, 300); c.lineTo(320, 310);
    c.moveTo(360, 300); c.lineTo(360, 310); c.stroke();
  },
  cupcake(c) {
    // wrapper bottom
    c.beginPath(); c.moveTo(170, 280); c.lineTo(190, 370); c.lineTo(330, 370); c.lineTo(350, 280); c.stroke();
    // wrapper ridges
    c.beginPath();
    c.moveTo(170, 280); c.quadraticCurveTo(185, 270, 200, 280);
    c.quadraticCurveTo(215, 290, 230, 280); c.quadraticCurveTo(245, 270, 260, 280);
    c.quadraticCurveTo(275, 290, 290, 280); c.quadraticCurveTo(305, 270, 320, 280);
    c.quadraticCurveTo(335, 290, 350, 280); c.stroke();
    // wrapper lines
    c.beginPath(); c.moveTo(185, 290); c.lineTo(195, 360); c.stroke();
    c.beginPath(); c.moveTo(220, 285); c.lineTo(215, 365); c.stroke();
    c.beginPath(); c.moveTo(260, 290); c.lineTo(260, 370); c.stroke();
    c.beginPath(); c.moveTo(300, 285); c.lineTo(305, 365); c.stroke();
    c.beginPath(); c.moveTo(335, 290); c.lineTo(325, 360); c.stroke();
    // frosting swirl
    c.beginPath(); c.moveTo(160, 280);
    c.quadraticCurveTo(150, 230, 190, 210);
    c.quadraticCurveTo(220, 195, 260, 180);
    c.quadraticCurveTo(300, 195, 330, 210);
    c.quadraticCurveTo(370, 230, 360, 280); c.stroke();
    // frosting swirl detail
    c.beginPath(); c.moveTo(200, 240); c.quadraticCurveTo(230, 220, 260, 230);
    c.quadraticCurveTo(290, 240, 320, 230); c.stroke();
    // cherry
    c.beginPath(); c.arc(260, 170, 18, 0, Math.PI * 2); c.stroke();
    // cherry stem
    c.beginPath(); c.moveTo(260, 152); c.quadraticCurveTo(270, 130, 255, 120); c.stroke();
    // sprinkles
    c.beginPath(); c.moveTo(195, 225); c.lineTo(205, 220); c.stroke();
    c.beginPath(); c.moveTo(310, 220); c.lineTo(320, 230); c.stroke();
    c.beginPath(); c.moveTo(250, 200); c.lineTo(255, 210); c.stroke();
  },
  cactus(c) {
    // pot
    c.beginPath(); c.moveTo(180, 320); c.lineTo(190, 390); c.lineTo(330, 390); c.lineTo(340, 320); c.stroke();
    // pot rim
    c.beginPath(); c.moveTo(170, 310); c.lineTo(350, 310); c.lineTo(350, 325); c.lineTo(170, 325); c.closePath(); c.stroke();
    // main body
    c.beginPath(); c.moveTo(230, 310); c.lineTo(230, 120);
    c.quadraticCurveTo(230, 80, 260, 80); c.quadraticCurveTo(290, 80, 290, 120);
    c.lineTo(290, 310); c.stroke();
    // left arm
    c.beginPath(); c.moveTo(230, 220); c.lineTo(180, 220);
    c.quadraticCurveTo(160, 220, 160, 200); c.lineTo(160, 160);
    c.quadraticCurveTo(160, 140, 180, 140); c.quadraticCurveTo(200, 140, 200, 160);
    c.lineTo(200, 220); c.stroke();
    // right arm
    c.beginPath(); c.moveTo(290, 190); c.lineTo(340, 190);
    c.quadraticCurveTo(360, 190, 360, 170); c.lineTo(360, 140);
    c.quadraticCurveTo(360, 120, 340, 120); c.quadraticCurveTo(320, 120, 320, 140);
    c.lineTo(320, 190); c.stroke();
    // ribs on body
    c.beginPath(); c.moveTo(250, 100); c.lineTo(250, 300); c.stroke();
    c.beginPath(); c.moveTo(270, 100); c.lineTo(270, 300); c.stroke();
    // spines
    c.beginPath(); c.moveTo(230, 150); c.lineTo(218, 145); c.stroke();
    c.beginPath(); c.moveTo(230, 180); c.lineTo(218, 175); c.stroke();
    c.beginPath(); c.moveTo(290, 140); c.lineTo(302, 135); c.stroke();
    c.beginPath(); c.moveTo(290, 170); c.lineTo(302, 165); c.stroke();
    c.beginPath(); c.moveTo(290, 250); c.lineTo(302, 245); c.stroke();
  },
  backpack(c) {
    // main body
    c.beginPath();
    c.moveTo(170, 120); c.quadraticCurveTo(170, 100, 200, 100);
    c.lineTo(320, 100); c.quadraticCurveTo(350, 100, 350, 120);
    c.lineTo(350, 350); c.quadraticCurveTo(350, 380, 320, 380);
    c.lineTo(200, 380); c.quadraticCurveTo(170, 380, 170, 350);
    c.closePath(); c.stroke();
    // top flap
    c.beginPath(); c.moveTo(170, 160); c.lineTo(350, 160); c.stroke();
    // front pocket
    c.beginPath();
    c.moveTo(195, 230); c.lineTo(325, 230); c.lineTo(325, 340);
    c.quadraticCurveTo(325, 355, 310, 355); c.lineTo(210, 355);
    c.quadraticCurveTo(195, 355, 195, 340); c.closePath(); c.stroke();
    // pocket zipper
    c.beginPath(); c.moveTo(195, 270); c.lineTo(325, 270); c.stroke();
    // zipper pull
    c.beginPath(); c.moveTo(260, 265); c.lineTo(260, 275); c.stroke();
    // top handle
    c.beginPath(); c.moveTo(235, 100); c.quadraticCurveTo(235, 75, 260, 75);
    c.quadraticCurveTo(285, 75, 285, 100); c.stroke();
    // left strap
    c.beginPath(); c.moveTo(190, 120); c.quadraticCurveTo(155, 200, 160, 300); c.stroke();
    // right strap
    c.beginPath(); c.moveTo(330, 120); c.quadraticCurveTo(365, 200, 360, 300); c.stroke();
    // buckle left
    c.beginPath(); c.rect(150, 280, 18, 25); c.stroke();
    // buckle right
    c.beginPath(); c.rect(352, 280, 18, 25); c.stroke();
    // top flap detail
    c.beginPath(); c.moveTo(240, 125); c.lineTo(280, 125); c.stroke();
  },
  telescope(c) {
    // main tube
    c.beginPath(); c.moveTo(120, 220); c.lineTo(350, 130);
    c.lineTo(370, 165); c.lineTo(140, 255); c.closePath(); c.stroke();
    // eyepiece
    c.beginPath(); c.moveTo(120, 220); c.lineTo(95, 230);
    c.lineTo(105, 260); c.lineTo(140, 255); c.stroke();
    // lens hood
    c.beginPath(); c.moveTo(350, 130); c.lineTo(385, 115);
    c.lineTo(400, 145); c.lineTo(370, 165); c.stroke();
    // lens
    c.beginPath(); c.moveTo(385, 115); c.lineTo(400, 145); c.stroke();
    // tube band 1
    c.beginPath(); c.moveTo(200, 195); c.lineTo(210, 165); c.stroke();
    c.beginPath(); c.moveTo(215, 230); c.lineTo(225, 200); c.stroke();
    // tube band 2
    c.beginPath(); c.moveTo(280, 170); c.lineTo(290, 140); c.stroke();
    c.beginPath(); c.moveTo(295, 205); c.lineTo(305, 175); c.stroke();
    // tripod center
    c.beginPath(); c.arc(230, 240, 6, 0, Math.PI * 2); c.stroke();
    // tripod left leg
    c.beginPath(); c.moveTo(228, 246); c.lineTo(140, 390); c.stroke();
    // tripod right leg
    c.beginPath(); c.moveTo(236, 246); c.lineTo(340, 390); c.stroke();
    // tripod back leg
    c.beginPath(); c.moveTo(230, 246); c.lineTo(250, 390); c.stroke();
    // tripod feet
    c.beginPath(); c.moveTo(130, 390); c.lineTo(150, 390); c.stroke();
    c.beginPath(); c.moveTo(330, 390); c.lineTo(350, 390); c.stroke();
    c.beginPath(); c.moveTo(240, 390); c.lineTo(260, 390); c.stroke();
  },
  lantern(c) {
    // top hook
    c.beginPath(); c.moveTo(240, 60); c.quadraticCurveTo(260, 40, 280, 60); c.stroke();
    // top cap
    c.beginPath(); c.moveTo(220, 80); c.lineTo(300, 80); c.lineTo(290, 100); c.lineTo(230, 100); c.closePath(); c.stroke();
    // top ring
    c.beginPath(); c.moveTo(260, 60); c.lineTo(260, 80); c.stroke();
    // glass body
    c.beginPath(); c.moveTo(220, 100);
    c.quadraticCurveTo(190, 190, 210, 290); c.stroke();
    c.beginPath(); c.moveTo(300, 100);
    c.quadraticCurveTo(330, 190, 310, 290); c.stroke();
    // bottom base
    c.beginPath(); c.moveTo(200, 290); c.lineTo(320, 290); c.stroke();
    c.beginPath(); c.moveTo(210, 290); c.lineTo(200, 320); c.lineTo(320, 320); c.lineTo(310, 290); c.stroke();
    // flame
    c.beginPath(); c.moveTo(260, 240);
    c.quadraticCurveTo(240, 200, 250, 170);
    c.quadraticCurveTo(260, 150, 270, 170);
    c.quadraticCurveTo(280, 200, 260, 240); c.stroke();
    // inner flame
    c.beginPath(); c.moveTo(260, 230);
    c.quadraticCurveTo(252, 210, 255, 190);
    c.quadraticCurveTo(260, 180, 265, 190);
    c.quadraticCurveTo(268, 210, 260, 230); c.stroke();
    // horizontal bars
    c.beginPath(); c.moveTo(220, 140); c.lineTo(300, 140); c.stroke();
    c.beginPath(); c.moveTo(215, 250); c.lineTo(305, 250); c.stroke();
    // wick base
    c.beginPath(); c.moveTo(245, 260); c.lineTo(275, 260); c.lineTo(275, 270); c.lineTo(245, 270); c.closePath(); c.stroke();
  },
  globe(c) {
    // sphere
    c.beginPath(); c.arc(260, 210, 110, 0, Math.PI * 2); c.stroke();
    // equator
    c.beginPath(); c.ellipse(260, 210, 110, 30, 0, 0, Math.PI * 2); c.stroke();
    // vertical meridian
    c.beginPath(); c.ellipse(260, 210, 30, 110, 0, 0, Math.PI * 2); c.stroke();
    // second meridian
    c.beginPath(); c.ellipse(260, 210, 75, 110, 0, 0, Math.PI * 2); c.stroke();
    // tropic upper
    c.beginPath(); c.ellipse(260, 165, 95, 20, 0, 0, Math.PI * 2); c.stroke();
    // tropic lower
    c.beginPath(); c.ellipse(260, 255, 95, 20, 0, 0, Math.PI * 2); c.stroke();
    // stand neck
    c.beginPath(); c.moveTo(245, 320); c.lineTo(245, 355); c.lineTo(275, 355); c.lineTo(275, 320); c.stroke();
    // stand base
    c.beginPath(); c.moveTo(200, 355); c.quadraticCurveTo(200, 380, 220, 380);
    c.lineTo(300, 380); c.quadraticCurveTo(320, 380, 320, 355); c.stroke();
    // stand arc
    c.beginPath(); c.arc(260, 210, 125, 0.3, Math.PI - 0.3); c.stroke();
  },
  drum(c) {
    // bass drum body
    c.beginPath(); c.ellipse(260, 260, 100, 70, 0, 0, Math.PI * 2); c.stroke();
    // bass drum face
    c.beginPath(); c.ellipse(260, 260, 70, 50, 0, 0, Math.PI * 2); c.stroke();
    // snare drum (top left)
    c.beginPath(); c.ellipse(150, 180, 50, 20, -0.2, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(100, 180); c.lineTo(100, 210);
    c.moveTo(200, 180); c.lineTo(200, 210); c.stroke();
    c.beginPath(); c.ellipse(150, 210, 50, 20, -0.2, Math.PI * 0.05, Math.PI * 0.95); c.stroke();
    // hi-hat (top right)
    c.beginPath(); c.ellipse(380, 160, 40, 12, 0, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.ellipse(380, 155, 40, 12, 0, 0, Math.PI * 2); c.stroke();
    // hi-hat stand
    c.beginPath(); c.moveTo(380, 172); c.lineTo(380, 350); c.stroke();
    // cymbal (right)
    c.beginPath(); c.ellipse(400, 120, 50, 12, 0.1, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(400, 132); c.lineTo(390, 260); c.stroke();
    // drumstick left
    c.beginPath(); c.moveTo(110, 140); c.lineTo(200, 210); c.stroke();
    c.beginPath(); c.arc(110, 140, 4, 0, Math.PI * 2); c.stroke();
    // drumstick right
    c.beginPath(); c.moveTo(320, 140); c.lineTo(250, 220); c.stroke();
    c.beginPath(); c.arc(320, 140, 4, 0, Math.PI * 2); c.stroke();
    // bass drum legs
    c.beginPath(); c.moveTo(170, 315); c.lineTo(160, 370); c.stroke();
    c.beginPath(); c.moveTo(350, 315); c.lineTo(360, 370); c.stroke();
  },
  paintbrush(c) {
    // palette body
    c.beginPath(); c.moveTo(260, 120);
    c.bezierCurveTo(150, 100, 90, 170, 100, 250);
    c.bezierCurveTo(110, 330, 200, 370, 280, 360);
    c.bezierCurveTo(360, 350, 410, 290, 400, 220);
    c.bezierCurveTo(390, 150, 340, 110, 260, 120); c.stroke();
    // thumb hole
    c.beginPath(); c.ellipse(300, 280, 30, 25, 0.2, 0, Math.PI * 2); c.stroke();
    // paint blob 1 (red)
    c.beginPath(); c.arc(180, 170, 20, 0, Math.PI * 2); c.stroke();
    // paint blob 2 (blue)
    c.beginPath(); c.arc(250, 155, 18, 0, Math.PI * 2); c.stroke();
    // paint blob 3 (yellow)
    c.beginPath(); c.arc(330, 170, 16, 0, Math.PI * 2); c.stroke();
    // paint blob 4 (green)
    c.beginPath(); c.arc(150, 240, 17, 0, Math.PI * 2); c.stroke();
    // paint blob 5 (purple)
    c.beginPath(); c.arc(370, 230, 15, 0, Math.PI * 2); c.stroke();
    // paint blob 6
    c.beginPath(); c.arc(200, 310, 16, 0, Math.PI * 2); c.stroke();
    // brush handle
    c.beginPath(); c.moveTo(130, 310); c.lineTo(60, 390); c.stroke();
    // brush tip
    c.beginPath(); c.moveTo(130, 310);
    c.quadraticCurveTo(120, 300, 125, 290);
    c.quadraticCurveTo(135, 295, 140, 305);
    c.quadraticCurveTo(135, 315, 130, 310); c.stroke();
    // inner paint details
    c.beginPath(); c.arc(180, 170, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(250, 155, 7, 0, Math.PI * 2); c.stroke();
  },
  teapot(c) {
    // body
    c.beginPath();
    c.moveTo(180, 180); c.quadraticCurveTo(180, 140, 220, 140);
    c.lineTo(320, 140); c.quadraticCurveTo(360, 140, 360, 180);
    c.lineTo(360, 280); c.quadraticCurveTo(360, 320, 320, 320);
    c.lineTo(220, 320); c.quadraticCurveTo(180, 320, 180, 280);
    c.closePath(); c.stroke();
    // lid
    c.beginPath(); c.moveTo(210, 140); c.lineTo(210, 125); c.lineTo(330, 125); c.lineTo(330, 140); c.stroke();
    // lid knob
    c.beginPath(); c.arc(270, 115, 12, 0, Math.PI * 2); c.stroke();
    // spout
    c.beginPath(); c.moveTo(360, 190); c.quadraticCurveTo(410, 170, 430, 150);
    c.quadraticCurveTo(445, 135, 440, 125); c.stroke();
    c.beginPath(); c.moveTo(360, 220); c.quadraticCurveTo(400, 200, 420, 170); c.stroke();
    // handle
    c.beginPath(); c.moveTo(180, 190);
    c.quadraticCurveTo(120, 190, 120, 240);
    c.quadraticCurveTo(120, 290, 180, 290); c.stroke();
    // body decoration line
    c.beginPath(); c.moveTo(195, 200); c.lineTo(345, 200); c.stroke();
    c.beginPath(); c.moveTo(195, 280); c.lineTo(345, 280); c.stroke();
    // base
    c.beginPath(); c.moveTo(210, 320); c.lineTo(200, 345); c.lineTo(340, 345); c.lineTo(330, 320); c.stroke();
    // steam
    c.beginPath(); c.moveTo(250, 110); c.quadraticCurveTo(240, 85, 250, 65); c.stroke();
    c.beginPath(); c.moveTo(275, 105); c.quadraticCurveTo(285, 80, 275, 55); c.stroke();
  },
  trophy(c) {
    // cup body
    c.beginPath(); c.moveTo(190, 100); c.lineTo(190, 200);
    c.quadraticCurveTo(190, 270, 260, 270);
    c.quadraticCurveTo(330, 270, 330, 200); c.lineTo(330, 100); c.stroke();
    // cup rim
    c.beginPath(); c.moveTo(180, 100); c.lineTo(340, 100); c.stroke();
    // left handle
    c.beginPath(); c.moveTo(190, 140);
    c.quadraticCurveTo(130, 140, 130, 180);
    c.quadraticCurveTo(130, 220, 190, 220); c.stroke();
    // right handle
    c.beginPath(); c.moveTo(330, 140);
    c.quadraticCurveTo(390, 140, 390, 180);
    c.quadraticCurveTo(390, 220, 330, 220); c.stroke();
    // stem
    c.beginPath(); c.moveTo(250, 270); c.lineTo(250, 330); c.lineTo(270, 330); c.lineTo(270, 270); c.stroke();
    // base
    c.beginPath(); c.moveTo(210, 330); c.lineTo(310, 330); c.lineTo(320, 355); c.lineTo(200, 355); c.closePath(); c.stroke();
    // base bottom
    c.beginPath(); c.moveTo(195, 355); c.lineTo(325, 355); c.stroke();
    // star on cup
    const sx = 260, sy = 170, so = 25, si = 10;
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? so : si;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) c.moveTo(sx + r * Math.cos(a), sy + r * Math.sin(a));
      else c.lineTo(sx + r * Math.cos(a), sy + r * Math.sin(a));
    }
    c.closePath(); c.stroke();
    // cup inner shine
    c.beginPath(); c.moveTo(210, 120); c.lineTo(210, 180); c.stroke();
    // #1 text
    c.beginPath(); c.moveTo(255, 220); c.lineTo(265, 220); c.stroke();
    c.beginPath(); c.moveTo(260, 210); c.lineTo(260, 250); c.stroke();
  },
  scissors(c) {
    // blade 1 (upper right)
    c.beginPath(); c.moveTo(260, 210);
    c.lineTo(380, 110); c.lineTo(395, 125); c.lineTo(270, 220); c.stroke();
    // blade 2 (lower right)
    c.beginPath(); c.moveTo(260, 210);
    c.lineTo(380, 310); c.lineTo(395, 295); c.lineTo(270, 200); c.stroke();
    // pivot screw
    c.beginPath(); c.arc(265, 210, 8, 0, Math.PI * 2); c.stroke();
    // handle 1 (upper left)
    c.beginPath(); c.ellipse(195, 175, 45, 28, -0.5, 0, Math.PI * 2); c.stroke();
    // handle 2 (lower left)
    c.beginPath(); c.ellipse(195, 245, 45, 28, 0.5, 0, Math.PI * 2); c.stroke();
    // blade edge 1
    c.beginPath(); c.moveTo(290, 200); c.lineTo(385, 115); c.stroke();
    // blade edge 2
    c.beginPath(); c.moveTo(290, 220); c.lineTo(385, 305); c.stroke();
    // finger rest 1
    c.beginPath(); c.ellipse(195, 175, 25, 14, -0.5, 0, Math.PI * 2); c.stroke();
    // finger rest 2
    c.beginPath(); c.ellipse(195, 245, 25, 14, 0.5, 0, Math.PI * 2); c.stroke();
    // handle connection upper
    c.beginPath(); c.moveTo(230, 190); c.lineTo(260, 205); c.stroke();
    // handle connection lower
    c.beginPath(); c.moveTo(230, 230); c.lineTo(260, 215); c.stroke();
  },
  binoculars(c) {
    // left barrel outer
    c.beginPath(); c.ellipse(185, 210, 55, 110, 0, 0, Math.PI * 2); c.stroke();
    // right barrel outer
    c.beginPath(); c.ellipse(335, 210, 55, 110, 0, 0, Math.PI * 2); c.stroke();
    // left lens
    c.beginPath(); c.arc(185, 310, 45, 0, Math.PI * 2); c.stroke();
    // left lens inner
    c.beginPath(); c.arc(185, 310, 30, 0, Math.PI * 2); c.stroke();
    // right lens
    c.beginPath(); c.arc(335, 310, 45, 0, Math.PI * 2); c.stroke();
    // right lens inner
    c.beginPath(); c.arc(335, 310, 30, 0, Math.PI * 2); c.stroke();
    // bridge
    c.beginPath(); c.moveTo(235, 180); c.lineTo(285, 180);
    c.lineTo(285, 220); c.lineTo(235, 220); c.closePath(); c.stroke();
    // left eyepiece
    c.beginPath(); c.moveTo(155, 105); c.lineTo(215, 105); c.lineTo(215, 120); c.lineTo(155, 120); c.closePath(); c.stroke();
    // right eyepiece
    c.beginPath(); c.moveTo(305, 105); c.lineTo(365, 105); c.lineTo(365, 120); c.lineTo(305, 120); c.closePath(); c.stroke();
    // focus wheel
    c.beginPath(); c.arc(260, 200, 15, 0, Math.PI * 2); c.stroke();
    // barrel detail left
    c.beginPath(); c.moveTo(135, 230); c.lineTo(235, 230); c.stroke();
    // barrel detail right
    c.beginPath(); c.moveTo(285, 230); c.lineTo(385, 230); c.stroke();
  },
  watercan(c) {
    // body
    c.beginPath();
    c.moveTo(140, 180); c.lineTo(340, 180); c.lineTo(340, 330);
    c.quadraticCurveTo(340, 350, 320, 350); c.lineTo(160, 350);
    c.quadraticCurveTo(140, 350, 140, 330); c.closePath(); c.stroke();
    // spout
    c.beginPath(); c.moveTo(340, 220); c.lineTo(420, 140); c.stroke();
    c.beginPath(); c.moveTo(340, 240); c.lineTo(410, 170); c.stroke();
    // spout head (rose)
    c.beginPath(); c.ellipse(430, 130, 25, 18, -0.8, 0, Math.PI * 2); c.stroke();
    // spout holes
    c.beginPath(); c.arc(425, 125, 3, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(435, 130, 3, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(430, 138, 3, 0, Math.PI * 2); c.stroke();
    // handle
    c.beginPath(); c.moveTo(160, 180);
    c.quadraticCurveTo(120, 130, 160, 100);
    c.quadraticCurveTo(200, 80, 240, 100);
    c.quadraticCurveTo(260, 120, 240, 180); c.stroke();
    // water level line
    c.beginPath(); c.moveTo(155, 260); c.lineTo(325, 260); c.stroke();
    // body band
    c.beginPath(); c.moveTo(140, 220); c.lineTo(340, 220); c.stroke();
    // base detail
    c.beginPath(); c.moveTo(155, 350); c.lineTo(155, 365); c.stroke();
    c.beginPath(); c.moveTo(325, 350); c.lineTo(325, 365); c.stroke();
  },
  skateboard(c) {
    // deck
    c.beginPath();
    c.moveTo(80, 240); c.quadraticCurveTo(60, 210, 80, 190);
    c.quadraticCurveTo(100, 175, 120, 200); c.lineTo(400, 200);
    c.quadraticCurveTo(420, 175, 440, 190);
    c.quadraticCurveTo(460, 210, 440, 240); c.lineTo(80, 240); c.stroke();
    // deck top line
    c.beginPath(); c.moveTo(120, 200); c.lineTo(400, 200); c.stroke();
    // grip tape pattern
    c.beginPath(); c.moveTo(160, 205); c.lineTo(160, 235); c.stroke();
    c.beginPath(); c.moveTo(200, 205); c.lineTo(200, 235); c.stroke();
    c.beginPath(); c.moveTo(260, 205); c.lineTo(260, 235); c.stroke();
    c.beginPath(); c.moveTo(320, 205); c.lineTo(320, 235); c.stroke();
    c.beginPath(); c.moveTo(360, 205); c.lineTo(360, 235); c.stroke();
    // front truck
    c.beginPath(); c.moveTo(350, 240); c.lineTo(350, 260); c.lineTo(410, 260); c.lineTo(410, 240); c.stroke();
    // rear truck
    c.beginPath(); c.moveTo(110, 240); c.lineTo(110, 260); c.lineTo(170, 260); c.lineTo(170, 240); c.stroke();
    // front left wheel
    c.beginPath(); c.arc(360, 290, 25, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(360, 290, 10, 0, Math.PI * 2); c.stroke();
    // front right wheel
    c.beginPath(); c.arc(400, 290, 25, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(400, 290, 10, 0, Math.PI * 2); c.stroke();
    // rear left wheel
    c.beginPath(); c.arc(120, 290, 25, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(120, 290, 10, 0, Math.PI * 2); c.stroke();
    // rear right wheel
    c.beginPath(); c.arc(160, 290, 25, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(160, 290, 10, 0, Math.PI * 2); c.stroke();
    // wheel axles
    c.beginPath(); c.moveTo(350, 260); c.lineTo(350, 270); c.stroke();
    c.beginPath(); c.moveTo(410, 260); c.lineTo(410, 270); c.stroke();
    c.beginPath(); c.moveTo(110, 260); c.lineTo(110, 270); c.stroke();
    c.beginPath(); c.moveTo(170, 260); c.lineTo(170, 270); c.stroke();
  },
  microscope(c) {
    // base
    c.beginPath(); c.moveTo(150, 370); c.lineTo(370, 370); c.lineTo(370, 350); c.lineTo(150, 350); c.closePath(); c.stroke();
    // arm (vertical)
    c.beginPath(); c.moveTo(300, 350); c.lineTo(300, 100); c.lineTo(330, 100); c.lineTo(330, 350); c.stroke();
    // head
    c.beginPath(); c.moveTo(300, 100); c.lineTo(240, 100); c.lineTo(230, 120); c.lineTo(300, 120); c.stroke();
    // eyepiece
    c.beginPath(); c.moveTo(220, 80); c.lineTo(250, 80); c.lineTo(250, 100); c.lineTo(220, 100); c.closePath(); c.stroke();
    // objective lenses
    c.beginPath(); c.moveTo(250, 120); c.lineTo(250, 160); c.stroke();
    c.beginPath(); c.moveTo(240, 120); c.lineTo(235, 150); c.stroke();
    c.beginPath(); c.moveTo(270, 120); c.lineTo(265, 145); c.stroke();
    // stage
    c.beginPath(); c.moveTo(200, 200); c.lineTo(360, 200); c.lineTo(360, 215); c.lineTo(200, 215); c.closePath(); c.stroke();
    // stage clips
    c.beginPath(); c.moveTo(230, 195); c.lineTo(220, 185); c.stroke();
    c.beginPath(); c.moveTo(330, 195); c.lineTo(340, 185); c.stroke();
    // coarse focus knob
    c.beginPath(); c.ellipse(340, 170, 18, 12, 0, 0, Math.PI * 2); c.stroke();
    // fine focus knob
    c.beginPath(); c.ellipse(340, 250, 14, 10, 0, 0, Math.PI * 2); c.stroke();
    // pillar
    c.beginPath(); c.moveTo(280, 215); c.lineTo(280, 350); c.stroke();
    // slide on stage
    c.beginPath(); c.rect(240, 190, 50, 10); c.stroke();
    // base detail
    c.beginPath(); c.moveTo(190, 350); c.lineTo(190, 370); c.stroke();
    c.beginPath(); c.moveTo(340, 350); c.lineTo(340, 370); c.stroke();
  },
  compass(c) {
    // outer circle
    c.beginPath(); c.arc(260, 210, 120, 0, Math.PI * 2); c.stroke();
    // inner circle
    c.beginPath(); c.arc(260, 210, 105, 0, Math.PI * 2); c.stroke();
    // compass rose center
    c.beginPath(); c.arc(260, 210, 8, 0, Math.PI * 2); c.stroke();
    // north pointer
    c.beginPath(); c.moveTo(260, 210); c.lineTo(245, 130); c.lineTo(260, 115); c.lineTo(275, 130); c.closePath(); c.stroke();
    // south pointer
    c.beginPath(); c.moveTo(260, 210); c.lineTo(245, 290); c.lineTo(260, 305); c.lineTo(275, 290); c.closePath(); c.stroke();
    // east pointer
    c.beginPath(); c.moveTo(260, 210); c.lineTo(340, 195); c.lineTo(355, 210); c.lineTo(340, 225); c.closePath(); c.stroke();
    // west pointer
    c.beginPath(); c.moveTo(260, 210); c.lineTo(180, 195); c.lineTo(165, 210); c.lineTo(180, 225); c.closePath(); c.stroke();
    // N label tick
    c.beginPath(); c.moveTo(260, 95); c.lineTo(260, 105); c.stroke();
    // S label tick
    c.beginPath(); c.moveTo(260, 315); c.lineTo(260, 325); c.stroke();
    // E label tick
    c.beginPath(); c.moveTo(370, 210); c.lineTo(380, 210); c.stroke();
    // W label tick
    c.beginPath(); c.moveTo(140, 210); c.lineTo(150, 210); c.stroke();
    // degree marks
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      c.beginPath();
      c.moveTo(260 + 100 * Math.cos(a), 210 + 100 * Math.sin(a));
      c.lineTo(260 + 108 * Math.cos(a), 210 + 108 * Math.sin(a));
      c.stroke();
    }
    // outer ring detail
    c.beginPath(); c.arc(260, 210, 130, 0, Math.PI * 2); c.stroke();
  },
  alarm(c) {
    // clock body
    c.beginPath(); c.arc(260, 220, 100, 0, Math.PI * 2); c.stroke();
    // inner ring
    c.beginPath(); c.arc(260, 220, 88, 0, Math.PI * 2); c.stroke();
    // hour hand
    c.beginPath(); c.moveTo(260, 220); c.lineTo(260, 165); c.stroke();
    // minute hand
    c.beginPath(); c.moveTo(260, 220); c.lineTo(310, 190); c.stroke();
    // center dot
    c.beginPath(); c.arc(260, 220, 5, 0, Math.PI * 2); c.stroke();
    // hour markers
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6 - Math.PI / 2;
      c.beginPath();
      c.moveTo(260 + 78 * Math.cos(a), 220 + 78 * Math.sin(a));
      c.lineTo(260 + 88 * Math.cos(a), 220 + 88 * Math.sin(a));
      c.stroke();
    }
    // left bell
    c.beginPath(); c.arc(185, 135, 28, Math.PI, 0); c.stroke();
    // right bell
    c.beginPath(); c.arc(335, 135, 28, Math.PI, 0); c.stroke();
    // bell connector left
    c.beginPath(); c.moveTo(200, 145); c.lineTo(215, 155); c.stroke();
    // bell connector right
    c.beginPath(); c.moveTo(320, 145); c.lineTo(305, 155); c.stroke();
    // hammer between bells
    c.beginPath(); c.moveTo(240, 125); c.lineTo(260, 110); c.lineTo(280, 125); c.stroke();
    // left foot
    c.beginPath(); c.moveTo(195, 310); c.lineTo(180, 340); c.lineTo(200, 340); c.stroke();
    // right foot
    c.beginPath(); c.moveTo(325, 310); c.lineTo(340, 340); c.lineTo(320, 340); c.stroke();
  },
  mailbox(c) {
    // body
    c.beginPath();
    c.moveTo(160, 180); c.lineTo(160, 340); c.lineTo(360, 340); c.lineTo(360, 180); c.stroke();
    // rounded top
    c.beginPath(); c.arc(260, 180, 100, Math.PI, 0); c.stroke();
    // flag pole
    c.beginPath(); c.moveTo(360, 200); c.lineTo(395, 200); c.lineTo(395, 160); c.stroke();
    // flag
    c.beginPath(); c.moveTo(395, 160); c.lineTo(395, 190); c.lineTo(375, 175); c.closePath(); c.stroke();
    // mail slot
    c.beginPath(); c.moveTo(200, 180); c.lineTo(320, 180); c.stroke();
    // door outline
    c.beginPath(); c.arc(260, 180, 70, Math.PI, 0); c.stroke();
    // post
    c.beginPath(); c.moveTo(245, 340); c.lineTo(245, 400); c.lineTo(275, 400); c.lineTo(275, 340); c.stroke();
    // base
    c.beginPath(); c.moveTo(220, 400); c.lineTo(300, 400); c.stroke();
    // body lines
    c.beginPath(); c.moveTo(160, 260); c.lineTo(360, 260); c.stroke();
    // handle
    c.beginPath(); c.moveTo(240, 290); c.lineTo(280, 290); c.stroke();
    // rivets
    c.beginPath(); c.arc(175, 195, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(345, 195, 4, 0, Math.PI * 2); c.stroke();
    // mail peeking out
    c.beginPath(); c.moveTo(220, 175); c.lineTo(230, 155); c.lineTo(290, 155); c.lineTo(300, 175); c.stroke();
  },
  helicopter(c) {
    // body
    c.beginPath();
    c.moveTo(150, 220); c.quadraticCurveTo(100, 220, 100, 250);
    c.quadraticCurveTo(100, 290, 150, 290); c.lineTo(300, 290);
    c.quadraticCurveTo(340, 290, 340, 260);
    c.quadraticCurveTo(340, 220, 300, 220); c.closePath(); c.stroke();
    // cockpit window
    c.beginPath(); c.moveTo(130, 230); c.quadraticCurveTo(110, 255, 130, 280); c.stroke();
    c.beginPath(); c.arc(135, 255, 25, -1.2, 1.2); c.stroke();
    // tail boom
    c.beginPath(); c.moveTo(300, 240); c.lineTo(430, 200); c.lineTo(430, 230); c.lineTo(300, 265); c.stroke();
    // tail fin vertical
    c.beginPath(); c.moveTo(420, 200); c.lineTo(440, 160); c.lineTo(455, 165); c.lineTo(440, 200); c.stroke();
    // tail rotor
    c.beginPath(); c.moveTo(440, 160); c.lineTo(435, 135); c.stroke();
    c.beginPath(); c.moveTo(440, 160); c.lineTo(455, 140); c.stroke();
    // main rotor mast
    c.beginPath(); c.moveTo(230, 220); c.lineTo(230, 190); c.stroke();
    // main rotor blades
    c.beginPath(); c.moveTo(80, 185); c.lineTo(380, 185); c.stroke();
    c.beginPath(); c.moveTo(80, 185); c.quadraticCurveTo(80, 180, 85, 180); c.stroke();
    c.beginPath(); c.moveTo(380, 185); c.quadraticCurveTo(380, 180, 375, 180); c.stroke();
    // rotor hub
    c.beginPath(); c.arc(230, 188, 6, 0, Math.PI * 2); c.stroke();
    // landing skid left
    c.beginPath(); c.moveTo(160, 290); c.lineTo(160, 310); c.stroke();
    c.beginPath(); c.moveTo(280, 290); c.lineTo(280, 310); c.stroke();
    // landing skid bar
    c.beginPath(); c.moveTo(130, 315); c.lineTo(310, 315); c.stroke();
    // door line
    c.beginPath(); c.moveTo(210, 225); c.lineTo(210, 285); c.stroke();
  },
  whale(c) {
    // body
    c.beginPath(); c.moveTo(110, 230);
    c.bezierCurveTo(110, 150, 200, 120, 280, 140);
    c.bezierCurveTo(360, 160, 380, 200, 370, 230); c.stroke();
    c.beginPath(); c.moveTo(110, 230);
    c.bezierCurveTo(110, 300, 200, 330, 280, 310);
    c.bezierCurveTo(360, 290, 380, 260, 370, 230); c.stroke();
    // tail connection
    c.beginPath(); c.moveTo(370, 220); c.quadraticCurveTo(400, 210, 420, 180); c.stroke();
    c.beginPath(); c.moveTo(370, 240); c.quadraticCurveTo(400, 250, 420, 280); c.stroke();
    // tail flukes upper
    c.beginPath(); c.moveTo(420, 180);
    c.quadraticCurveTo(450, 150, 440, 170);
    c.quadraticCurveTo(430, 190, 420, 180); c.stroke();
    // tail flukes lower
    c.beginPath(); c.moveTo(420, 280);
    c.quadraticCurveTo(450, 310, 440, 290);
    c.quadraticCurveTo(430, 270, 420, 280); c.stroke();
    // eye
    c.beginPath(); c.arc(170, 210, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(170, 210, 3, 0, Math.PI * 2); c.stroke();
    // mouth
    c.beginPath(); c.moveTo(120, 245); c.quadraticCurveTo(200, 260, 300, 245); c.stroke();
    // belly lines
    c.beginPath(); c.moveTo(150, 260); c.quadraticCurveTo(200, 280, 280, 265); c.stroke();
    c.beginPath(); c.moveTo(160, 280); c.quadraticCurveTo(210, 300, 270, 285); c.stroke();
    c.beginPath(); c.moveTo(170, 295); c.quadraticCurveTo(215, 310, 260, 300); c.stroke();
    // fin
    c.beginPath(); c.moveTo(220, 270);
    c.quadraticCurveTo(200, 320, 230, 340);
    c.quadraticCurveTo(260, 330, 250, 290); c.stroke();
    // water spout
    c.beginPath(); c.moveTo(200, 140); c.quadraticCurveTo(190, 100, 180, 80); c.stroke();
    c.beginPath(); c.moveTo(200, 140); c.quadraticCurveTo(210, 100, 220, 80); c.stroke();
    c.beginPath(); c.moveTo(175, 75); c.quadraticCurveTo(200, 65, 225, 75); c.stroke();
  },
  pineapple(c) {
    // body
    c.beginPath(); c.ellipse(260, 250, 80, 120, 0, 0, Math.PI * 2); c.stroke();
    // cross-hatch pattern (diagonal lines)
    c.beginPath(); c.moveTo(195, 180); c.lineTo(245, 360); c.stroke();
    c.beginPath(); c.moveTo(230, 155); c.lineTo(280, 345); c.stroke();
    c.beginPath(); c.moveTo(270, 150); c.lineTo(310, 340); c.stroke();
    c.beginPath(); c.moveTo(305, 170); c.lineTo(325, 320); c.stroke();
    // cross-hatch other direction
    c.beginPath(); c.moveTo(305, 180); c.lineTo(255, 360); c.stroke();
    c.beginPath(); c.moveTo(285, 155); c.lineTo(235, 345); c.stroke();
    c.beginPath(); c.moveTo(245, 150); c.lineTo(205, 340); c.stroke();
    c.beginPath(); c.moveTo(210, 170); c.lineTo(195, 320); c.stroke();
    // crown (leaves)
    c.beginPath(); c.moveTo(260, 135); c.quadraticCurveTo(260, 80, 230, 50); c.stroke();
    c.beginPath(); c.moveTo(260, 135); c.quadraticCurveTo(265, 75, 290, 45); c.stroke();
    c.beginPath(); c.moveTo(250, 140); c.quadraticCurveTo(220, 90, 195, 70); c.stroke();
    c.beginPath(); c.moveTo(270, 140); c.quadraticCurveTo(300, 90, 325, 70); c.stroke();
    c.beginPath(); c.moveTo(245, 145); c.quadraticCurveTo(200, 110, 175, 100); c.stroke();
    c.beginPath(); c.moveTo(275, 145); c.quadraticCurveTo(320, 110, 345, 100); c.stroke();
    // center leaf
    c.beginPath(); c.moveTo(260, 135); c.lineTo(260, 55); c.stroke();
  },
  frog(c) {
    // body
    c.beginPath(); c.ellipse(260, 270, 100, 70, 0, 0, Math.PI * 2); c.stroke();
    // head
    c.beginPath(); c.arc(260, 190, 60, 0, Math.PI * 2); c.stroke();
    // left eye bump
    c.beginPath(); c.arc(220, 155, 22, 0, Math.PI * 2); c.stroke();
    // right eye bump
    c.beginPath(); c.arc(300, 155, 22, 0, Math.PI * 2); c.stroke();
    // left pupil
    c.beginPath(); c.arc(220, 152, 8, 0, Math.PI * 2); c.stroke();
    // right pupil
    c.beginPath(); c.arc(300, 152, 8, 0, Math.PI * 2); c.stroke();
    // mouth
    c.beginPath(); c.moveTo(210, 215); c.quadraticCurveTo(260, 240, 310, 215); c.stroke();
    // smile line
    c.beginPath(); c.moveTo(230, 210); c.quadraticCurveTo(260, 225, 290, 210); c.stroke();
    // left front leg
    c.beginPath(); c.moveTo(175, 280); c.quadraticCurveTo(120, 310, 110, 340);
    c.lineTo(130, 340); c.lineTo(140, 330); c.lineTo(150, 340); c.stroke();
    // right front leg
    c.beginPath(); c.moveTo(345, 280); c.quadraticCurveTo(400, 310, 410, 340);
    c.lineTo(390, 340); c.lineTo(380, 330); c.lineTo(370, 340); c.stroke();
    // left back leg
    c.beginPath(); c.moveTo(180, 300); c.quadraticCurveTo(130, 340, 120, 370);
    c.lineTo(140, 370); c.lineTo(155, 360); c.lineTo(170, 370); c.stroke();
    // right back leg
    c.beginPath(); c.moveTo(340, 300); c.quadraticCurveTo(390, 340, 400, 370);
    c.lineTo(380, 370); c.lineTo(365, 360); c.lineTo(350, 370); c.stroke();
    // nostril dots
    c.beginPath(); c.arc(245, 190, 3, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(275, 190, 3, 0, Math.PI * 2); c.stroke();
  },
  tent(c) {
    // main triangle
    c.beginPath(); c.moveTo(260, 80); c.lineTo(100, 340); c.lineTo(420, 340); c.closePath(); c.stroke();
    // door flap left
    c.beginPath(); c.moveTo(260, 80); c.lineTo(220, 340); c.stroke();
    // door flap right
    c.beginPath(); c.moveTo(260, 80); c.lineTo(300, 340); c.stroke();
    // door opening
    c.beginPath(); c.moveTo(220, 340); c.quadraticCurveTo(260, 280, 300, 340); c.stroke();
    // ridge pole extending
    c.beginPath(); c.moveTo(260, 80); c.lineTo(270, 70); c.stroke();
    // guy rope left
    c.beginPath(); c.moveTo(180, 210); c.lineTo(80, 340); c.stroke();
    // guy rope right
    c.beginPath(); c.moveTo(340, 210); c.lineTo(440, 340); c.stroke();
    // peg left
    c.beginPath(); c.moveTo(75, 340); c.lineTo(85, 355); c.stroke();
    // peg right
    c.beginPath(); c.moveTo(435, 340); c.lineTo(445, 355); c.stroke();
    // ground line
    c.beginPath(); c.moveTo(70, 340); c.lineTo(450, 340); c.stroke();
    // tent fold lines
    c.beginPath(); c.moveTo(180, 210); c.lineTo(100, 340); c.stroke();
    c.beginPath(); c.moveTo(340, 210); c.lineTo(420, 340); c.stroke();
    // flag on top
    c.beginPath(); c.moveTo(270, 70); c.lineTo(290, 60); c.lineTo(270, 50); c.stroke();
    // texture lines on tent
    c.beginPath(); c.moveTo(150, 260); c.lineTo(170, 260); c.stroke();
    c.beginPath(); c.moveTo(350, 260); c.lineTo(370, 260); c.stroke();
  },
  wrench(c) {
    // wrench handle
    c.beginPath(); c.moveTo(170, 310); c.lineTo(310, 170);
    c.lineTo(320, 180); c.lineTo(180, 320); c.closePath(); c.stroke();
    // wrench head (jaw)
    c.beginPath(); c.moveTo(310, 170); c.lineTo(300, 130);
    c.quadraticCurveTo(310, 90, 350, 90);
    c.quadraticCurveTo(390, 90, 400, 120);
    c.quadraticCurveTo(400, 150, 370, 160);
    c.lineTo(320, 180); c.stroke();
    // jaw opening
    c.beginPath(); c.moveTo(340, 110); c.lineTo(370, 140); c.stroke();
    // handle end
    c.beginPath(); c.moveTo(170, 310);
    c.quadraticCurveTo(150, 330, 160, 345);
    c.quadraticCurveTo(170, 360, 190, 340);
    c.lineTo(180, 320); c.stroke();
    // handle grip lines
    c.beginPath(); c.moveTo(210, 290); c.lineTo(220, 280); c.stroke();
    c.beginPath(); c.moveTo(230, 270); c.lineTo(240, 260); c.stroke();
    c.beginPath(); c.moveTo(250, 250); c.lineTo(260, 240); c.stroke();
    // bolt (hexagon)
    const bx = 420, by = 290;
    c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x = bx + 30 * Math.cos(a);
      const y = by + 30 * Math.sin(a);
      if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.closePath(); c.stroke();
    // bolt inner hexagon
    c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x = bx + 18 * Math.cos(a);
      const y = by + 18 * Math.sin(a);
      if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.closePath(); c.stroke();
    // bolt thread lines
    c.beginPath(); c.moveTo(bx, by - 30); c.lineTo(bx, by - 50); c.stroke();
    c.beginPath(); c.moveTo(bx - 8, by - 35); c.lineTo(bx - 8, by - 50); c.stroke();
    c.beginPath(); c.moveTo(bx + 8, by - 35); c.lineTo(bx + 8, by - 50); c.stroke();
  },
  saxophone(c) {
    // bell
    c.beginPath(); c.arc(230, 340, 55, Math.PI * 0.6, Math.PI * 1.8); c.stroke();
    c.beginPath(); c.arc(230, 340, 40, Math.PI * 0.6, Math.PI * 1.8); c.stroke();
    // body curve from bell
    c.beginPath(); c.moveTo(270, 310);
    c.quadraticCurveTo(320, 260, 320, 200);
    c.quadraticCurveTo(320, 140, 300, 100); c.stroke();
    c.beginPath(); c.moveTo(280, 320);
    c.quadraticCurveTo(340, 260, 340, 200);
    c.quadraticCurveTo(340, 140, 320, 100); c.stroke();
    // neck/crook
    c.beginPath(); c.moveTo(300, 100);
    c.quadraticCurveTo(280, 70, 250, 80); c.stroke();
    c.beginPath(); c.moveTo(320, 100);
    c.quadraticCurveTo(300, 65, 265, 75); c.stroke();
    // mouthpiece
    c.beginPath(); c.moveTo(250, 80); c.lineTo(235, 60); c.stroke();
    c.beginPath(); c.moveTo(265, 75); c.lineTo(245, 55); c.stroke();
    c.beginPath(); c.moveTo(235, 60); c.lineTo(245, 55); c.stroke();
    // keys (dots along body)
    c.beginPath(); c.arc(305, 150, 7, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(310, 180, 7, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(315, 210, 7, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(310, 240, 7, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(300, 270, 7, 0, Math.PI * 2); c.stroke();
    // key arms
    c.beginPath(); c.moveTo(312, 150); c.lineTo(330, 145); c.stroke();
    c.beginPath(); c.moveTo(317, 180); c.lineTo(340, 178); c.stroke();
    c.beginPath(); c.moveTo(322, 210); c.lineTo(345, 212); c.stroke();
    // bell rim detail
    c.beginPath(); c.arc(230, 340, 48, Math.PI * 0.7, Math.PI * 1.7); c.stroke();
  },
  swan(c) {
    // body
    c.beginPath(); c.moveTo(180, 250);
    c.bezierCurveTo(150, 220, 180, 180, 210, 200);
    c.bezierCurveTo(250, 220, 350, 210, 380, 240);
    c.bezierCurveTo(410, 270, 380, 310, 330, 310);
    c.bezierCurveTo(280, 310, 200, 300, 180, 250); c.stroke();
    // neck
    c.beginPath(); c.moveTo(210, 200);
    c.bezierCurveTo(190, 170, 170, 130, 165, 100);
    c.quadraticCurveTo(160, 80, 175, 75); c.stroke();
    c.beginPath(); c.moveTo(220, 210);
    c.bezierCurveTo(210, 185, 195, 145, 185, 110);
    c.quadraticCurveTo(180, 90, 190, 82); c.stroke();
    // head
    c.beginPath(); c.arc(180, 78, 15, 0, Math.PI * 2); c.stroke();
    // beak
    c.beginPath(); c.moveTo(165, 75); c.lineTo(140, 70); c.lineTo(140, 82); c.lineTo(165, 80); c.stroke();
    // eye
    c.beginPath(); c.arc(175, 74, 3, 0, Math.PI * 2); c.stroke();
    // wing
    c.beginPath(); c.moveTo(280, 230);
    c.bezierCurveTo(300, 210, 340, 220, 360, 240);
    c.bezierCurveTo(370, 250, 360, 270, 340, 270);
    c.bezierCurveTo(320, 270, 290, 260, 280, 250); c.stroke();
    // wing feather details
    c.beginPath(); c.moveTo(310, 230); c.quadraticCurveTo(330, 230, 350, 245); c.stroke();
    c.beginPath(); c.moveTo(300, 240); c.quadraticCurveTo(325, 240, 345, 255); c.stroke();
    // tail feathers
    c.beginPath(); c.moveTo(380, 240); c.quadraticCurveTo(400, 225, 410, 210); c.stroke();
    c.beginPath(); c.moveTo(385, 245); c.quadraticCurveTo(405, 235, 415, 225); c.stroke();
    // water ripples
    c.beginPath(); c.moveTo(140, 310); c.quadraticCurveTo(180, 320, 220, 310); c.stroke();
    c.beginPath(); c.moveTo(280, 315); c.quadraticCurveTo(320, 325, 360, 315); c.stroke();
    c.beginPath(); c.moveTo(120, 330); c.quadraticCurveTo(200, 345, 280, 330); c.stroke();
  },
};

function drawReference(ctxRef, promptKey = dailyPrompt.key) {
  ctxRef.clearRect(0, 0, refCanvas.width, refCanvas.height);
  ctxRef.save();
  ctxRef.lineWidth = 16;
  ctxRef.lineCap = "round";
  ctxRef.lineJoin = "round";
  ctxRef.strokeStyle = "#000";
  if (promptDrawFns[promptKey]) promptDrawFns[promptKey](ctxRef);
  ctxRef.restore();
}

function generateDailyMask(cols, rows, revealRatio) {
  const seed = getTodayKey().split("-").join("");
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  // Simple seeded PRNG (mulberry32)
  let s = Math.abs(hash) >>> 0;
  function nextRand() {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const total = cols * rows;
  const revealCount = Math.round(total * revealRatio);
  const indices = Array.from({ length: total }, (_, i) => i);
  // Fisher-Yates shuffle with seeded random
  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const mask = new Array(total).fill(false);
  for (let i = 0; i < revealCount; i++) {
    mask[indices[i]] = true;
  }
  return mask;
}

function renderMaskedReference() {
  if (!maskedRefCanvas || !maskedRefCtx) return;
  const c = maskedRefCtx;
  const w = maskedRefCanvas.width;
  const h = maskedRefCanvas.height;
  const cols = 8;
  const rows = 6;
  const cellW = w / cols;
  const cellH = h / rows;

  // White background
  c.clearRect(0, 0, w, h);
  c.fillStyle = "#ffffff";
  c.fillRect(0, 0, w, h);

  // Draw full reference with thick visible strokes
  c.save();
  c.lineWidth = 16;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.strokeStyle = "#000";
  if (promptDrawFns[dailyPrompt.key]) {
    promptDrawFns[dailyPrompt.key](c);
  }
  c.restore();

  // Generate mask
  const mask = generateDailyMask(cols, rows, 0.5);

  // Cover masked cells with solid gray + diagonal stripes
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;
      if (!mask[idx]) {
        const x = col * cellW;
        const y = row * cellH;
        // Solid gray base
        c.fillStyle = "#e2e4ea";
        c.fillRect(x, y, cellW, cellH);
        // Diagonal stripes
        c.save();
        c.beginPath();
        c.rect(x, y, cellW, cellH);
        c.clip();
        c.strokeStyle = "#cdd0d9";
        c.lineWidth = 1.5;
        const step = 10;
        for (let d = -cellH; d < cellW + cellH; d += step) {
          c.beginPath();
          c.moveTo(x + d, y);
          c.lineTo(x + d - cellH, y + cellH);
          c.stroke();
        }
        c.restore();
      }
    }
  }

  // Draw grid lines for visual structure
  c.strokeStyle = "rgba(0, 0, 0, 0.1)";
  c.lineWidth = 1;
  for (let col = 1; col < cols; col++) {
    c.beginPath();
    c.moveTo(col * cellW, 0);
    c.lineTo(col * cellW, h);
    c.stroke();
  }
  for (let row = 1; row < rows; row++) {
    c.beginPath();
    c.moveTo(0, row * cellH);
    c.lineTo(w, row * cellH);
    c.stroke();
  }
}

function revealFullReference() {
  if (!maskedRefCanvas || !maskedRefCtx) return;
  const c = maskedRefCtx;
  const w = maskedRefCanvas.width;
  const h = maskedRefCanvas.height;

  c.clearRect(0, 0, w, h);
  c.fillStyle = "#ffffff";
  c.fillRect(0, 0, w, h);

  c.save();
  c.lineWidth = 16;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.strokeStyle = "#000";
  if (promptDrawFns[dailyPrompt.key]) {
    promptDrawFns[dailyPrompt.key](c);
  }
  c.restore();

  // Update the label
  const label = document.querySelector(".ref-guide-label");
  if (label) label.textContent = "Full reference revealed";
}

function scoreDrawing() {
  drawReference(refCtx);

  const userData = ctx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
  const refData = refCtx.getImageData(0, 0, refCanvas.width, refCanvas.height);

  const cell = 6;
  const cols = Math.floor(drawCanvas.width / cell);
  const rows = Math.floor(drawCanvas.height / cell);
  const userMask = new Uint8Array(cols * rows);
  const refMask = new Uint8Array(cols * rows);

  const markMask = (data, mask) => {
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        let inked = false;
        const startX = x * cell;
        const startY = y * cell;
        for (let cy = 0; cy < cell && !inked; cy += 1) {
          for (let cx = 0; cx < cell; cx += 1) {
            const px = startX + cx;
            const py = startY + cy;
            const idx = (py * drawCanvas.width + px) * 4;
            const r = data.data[idx];
            const g = data.data[idx + 1];
            const b = data.data[idx + 2];
            const alpha = data.data[idx + 3];
            const dark = r + g + b < 700;
            if (alpha > 20 && dark) {
              inked = true;
              break;
            }
          }
        }
        if (inked) {
          mask[y * cols + x] = 1;
        }
      }
    }
  };

  markMask(userData, userMask);
  markMask(refData, refMask);

  const countMask = (mask) =>
    mask.reduce((sum, val) => sum + (val ? 1 : 0), 0);

  const getBbox = (mask) => {
    let minX = cols, minY = rows, maxX = 0, maxY = 0;
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        if (mask[y * cols + x]) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (minX > maxX) return null;
    return { minX, minY, maxX, maxY };
  };

  const scaleUserMaskToRef = (uMask, rMask) => {
    const refBox = getBbox(rMask);
    const userBox = getBbox(uMask);
    if (!refBox || !userBox) return uMask;
    const refW = refBox.maxX - refBox.minX + 1;
    const refH = refBox.maxY - refBox.minY + 1;
    const userW = userBox.maxX - userBox.minX + 1;
    const userH = userBox.maxY - userBox.minY + 1;
    const out = new Uint8Array(cols * rows);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const normX = refW > 0 ? (x - refBox.minX) / refW : 0;
        const normY = refH > 0 ? (y - refBox.minY) / refH : 0;
        const ux = Math.round(userBox.minX + normX * (userW - 1));
        const uy = Math.round(userBox.minY + normY * (userH - 1));
        if (ux >= 0 && ux < cols && uy >= 0 && uy < rows && uMask[uy * cols + ux]) {
          out[y * cols + x] = 1;
        }
      }
    }
    return out;
  };

  const getCentroid = (mask) => {
    let count = 0;
    let sumX = 0;
    let sumY = 0;
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        if (mask[y * cols + x]) {
          count += 1;
          sumX += x;
          sumY += y;
        }
      }
    }
    if (count === 0) return { x: cols / 2, y: rows / 2, count: 0 };
    return { x: sumX / count, y: sumY / count, count };
  };

  const shiftMask = (mask, dx, dy) => {
    const shifted = new Uint8Array(cols * rows);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        if (!mask[y * cols + x]) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
          shifted[ny * cols + nx] = 1;
        }
      }
    }
    return shifted;
  };

  const dilateMask = (mask, radius) => {
    const out = new Uint8Array(cols * rows);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        if (!mask[y * cols + x]) continue;
        for (let dy = -radius; dy <= radius; dy += 1) {
          for (let dx = -radius; dx <= radius; dx += 1) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
              out[ny * cols + nx] = 1;
            }
          }
        }
      }
    }
    return out;
  };

  const normalizedUser = scaleUserMaskToRef(userMask, refMask);
  const userCenter = getCentroid(normalizedUser);
  const refCenter = getCentroid(refMask);

  if (userCenter.count === 0) return 0;

  const dx = Math.round(refCenter.x - userCenter.x);
  const dy = Math.round(refCenter.y - userCenter.y);
  const alignedUser = shiftMask(normalizedUser, dx, dy);
  const refExpanded = dilateMask(refMask, 2);

  let refPixels = 0;
  let overlap = 0;
  let userPixels = 0;

  for (let i = 0; i < refMask.length; i += 1) {
    if (refMask[i]) refPixels += 1;
    if (alignedUser[i]) userPixels += 1;
    if (alignedUser[i] && refExpanded[i]) overlap += 1;
  }

  if (refPixels === 0 || userPixels === 0) return 0;

  const recall = overlap / refPixels;
  const precision = overlap / userPixels;
  const rawScore = Math.max(0, 0.6 * recall + 0.4 * precision);
  const finalScore = Math.round(rawScore * 100);

  return finalScore;
}


function drawReferenceStatic(ctxRef, offsetX, offsetY, scale, promptKey = dailyPrompt.key) {
  ctxRef.save();
  ctxRef.translate(offsetX, offsetY);
  ctxRef.scale(scale, scale);
  ctxRef.lineWidth = 10 / scale;
  ctxRef.lineCap = "round";
  ctxRef.lineJoin = "round";
  ctxRef.strokeStyle = "#e7ebf2";
  if (promptDrawFns[promptKey]) promptDrawFns[promptKey](ctxRef);
  ctxRef.restore();
}

function buildReplayFrames() {
  const frames = [];
  strokes.forEach((stroke) => {
    stroke.points.forEach((point) => {
      frames.push({ stroke, point });
    });
  });
  return frames;
}

const promptSvgMarkup = {
  get bicycle() {
    let spokes = "";
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const rx = Math.cos(a), ry = Math.sin(a);
      spokes += `<line x1="${150 + 5 * rx}" y1="${280 + 5 * ry}" x2="${150 + 65 * rx}" y2="${280 + 65 * ry}"/>`;
      spokes += `<line x1="${370 + 5 * rx}" y1="${280 + 5 * ry}" x2="${370 + 65 * rx}" y2="${280 + 65 * ry}"/>`;
    }
    return `<circle cx="150" cy="280" r="65"/><circle cx="370" cy="280" r="65"/>
      <circle cx="150" cy="280" r="5"/><circle cx="370" cy="280" r="5"/>
      ${spokes}
      <line x1="150" y1="280" x2="210" y2="170"/>
      <line x1="210" y1="170" x2="330" y2="180"/>
      <line x1="150" y1="280" x2="330" y2="180"/>
      <line x1="330" y1="180" x2="370" y2="280"/>
      <line x1="195" y1="165" x2="225" y2="165"/>
      <path d="M330 180 L345 155 Q355 145 365 150"/>
      <circle cx="230" cy="280" r="18"/>
      <line x1="150" y1="280" x2="230" y2="280"/>`;
  },
  camera: `<rect x="110" y="150" width="300" height="180" rx="20"/>
    <path d="M220 150 L230 120 L290 120 L300 150"/>
    <circle cx="260" cy="240" r="60"/>
    <circle cx="260" cy="240" r="40"/>
    <circle cx="260" cy="240" r="15"/>
    <rect x="340" y="165" width="40" height="25"/>
    <rect x="145" y="170" width="30" height="20"/>
    <circle cx="350" cy="135" r="10"/>
    <line x1="125" y1="200" x2="125" y2="290"/>
    <line x1="132" y1="200" x2="132" y2="290"/>`,
  headphones: `<path d="M150 180 A110 110 0 0 1 370 180"/>
    <path d="M170 180 A90 90 0 0 1 350 180"/>
    <line x1="150" y1="180" x2="150" y2="230"/>
    <line x1="370" y1="180" x2="370" y2="230"/>
    <ellipse cx="145" cy="280" rx="35" ry="50"/>
    <ellipse cx="145" cy="280" rx="20" ry="35"/>
    <ellipse cx="375" cy="280" rx="35" ry="50"/>
    <ellipse cx="375" cy="280" rx="20" ry="35"/>
    <path d="M130 240 Q115 280 130 320"/>
    <path d="M390 240 Q405 280 390 320"/>
    <path d="M230 175 A30 30 0 0 1 290 175"/>`,
  sneaker: `<path d="M80 310 L420 310 Q440 310 440 295 L440 285 L80 285 Q70 285 70 295 Q70 310 80 310"/>
    <path d="M90 285 L90 230 Q90 190 130 180 L250 180 L250 285"/>
    <path d="M250 285 L250 220 Q300 200 380 230 Q440 250 440 285"/>
    <path d="M310 285 Q360 245 420 265"/>
    <path d="M90 230 Q120 175 175 170 Q210 168 240 180"/>
    <path d="M170 180 L165 150 L210 145 L215 180"/>
    <circle cx="155" cy="200" r="4"/><circle cx="155" cy="220" r="4"/><circle cx="155" cy="240" r="4"/>
    <circle cx="225" cy="200" r="4"/><circle cx="225" cy="220" r="4"/><circle cx="225" cy="240" r="4"/>
    <line x1="159" y1="200" x2="221" y2="220"/><line x1="159" y1="220" x2="221" y2="240"/><line x1="159" y1="240" x2="221" y2="200"/>
    <line x1="120" y1="300" x2="120" y2="310"/><line x1="160" y1="300" x2="160" y2="310"/><line x1="200" y1="300" x2="200" y2="310"/><line x1="240" y1="300" x2="240" y2="310"/><line x1="280" y1="300" x2="280" y2="310"/><line x1="320" y1="300" x2="320" y2="310"/><line x1="360" y1="300" x2="360" y2="310"/>`,
  cupcake: `<path d="M170 280 L190 370 L330 370 L350 280"/>
    <path d="M170 280 Q185 270 200 280 Q215 290 230 280 Q245 270 260 280 Q275 290 290 280 Q305 270 320 280 Q335 290 350 280"/>
    <line x1="185" y1="290" x2="195" y2="360"/><line x1="220" y1="285" x2="215" y2="365"/><line x1="260" y1="290" x2="260" y2="370"/><line x1="300" y1="285" x2="305" y2="365"/><line x1="335" y1="290" x2="325" y2="360"/>
    <path d="M160 280 Q150 230 190 210 Q220 195 260 180 Q300 195 330 210 Q370 230 360 280"/>
    <path d="M200 240 Q230 220 260 230 Q290 240 320 230"/>
    <circle cx="260" cy="170" r="18"/>
    <path d="M260 152 Q270 130 255 120"/>
    <line x1="195" y1="225" x2="205" y2="220"/><line x1="310" y1="220" x2="320" y2="230"/><line x1="250" y1="200" x2="255" y2="210"/>`,
  cactus: `<path d="M180 320 L190 390 L330 390 L340 320"/>
    <path d="M170 310 L350 310 L350 325 L170 325 Z"/>
    <path d="M230 310 L230 120 Q230 80 260 80 Q290 80 290 120 L290 310"/>
    <path d="M230 220 L180 220 Q160 220 160 200 L160 160 Q160 140 180 140 Q200 140 200 160 L200 220"/>
    <path d="M290 190 L340 190 Q360 190 360 170 L360 140 Q360 120 340 120 Q320 120 320 140 L320 190"/>
    <line x1="250" y1="100" x2="250" y2="300"/><line x1="270" y1="100" x2="270" y2="300"/>
    <line x1="230" y1="150" x2="218" y2="145"/><line x1="230" y1="180" x2="218" y2="175"/>
    <line x1="290" y1="140" x2="302" y2="135"/><line x1="290" y1="170" x2="302" y2="165"/><line x1="290" y1="250" x2="302" y2="245"/>`,
  backpack: `<path d="M170 120 Q170 100 200 100 L320 100 Q350 100 350 120 L350 350 Q350 380 320 380 L200 380 Q170 380 170 350 Z"/>
    <line x1="170" y1="160" x2="350" y2="160"/>
    <path d="M195 230 L325 230 L325 340 Q325 355 310 355 L210 355 Q195 355 195 340 Z"/>
    <line x1="195" y1="270" x2="325" y2="270"/>
    <line x1="260" y1="265" x2="260" y2="275"/>
    <path d="M235 100 Q235 75 260 75 Q285 75 285 100"/>
    <path d="M190 120 Q155 200 160 300"/>
    <path d="M330 120 Q365 200 360 300"/>
    <rect x="150" y="280" width="18" height="25"/>
    <rect x="352" y="280" width="18" height="25"/>
    <line x1="240" y1="125" x2="280" y2="125"/>`,
  telescope: `<path d="M120 220 L350 130 L370 165 L140 255 Z"/>
    <path d="M120 220 L95 230 L105 260 L140 255"/>
    <path d="M350 130 L385 115 L400 145 L370 165"/>
    <line x1="385" y1="115" x2="400" y2="145"/>
    <line x1="200" y1="195" x2="210" y2="165"/><line x1="215" y1="230" x2="225" y2="200"/>
    <line x1="280" y1="170" x2="290" y2="140"/><line x1="295" y1="205" x2="305" y2="175"/>
    <circle cx="230" cy="240" r="6"/>
    <line x1="228" y1="246" x2="140" y2="390"/>
    <line x1="236" y1="246" x2="340" y2="390"/>
    <line x1="230" y1="246" x2="250" y2="390"/>
    <line x1="130" y1="390" x2="150" y2="390"/>
    <line x1="330" y1="390" x2="350" y2="390"/>
    <line x1="240" y1="390" x2="260" y2="390"/>`,
  lantern: `<path d="M240 60 Q260 40 280 60"/>
    <path d="M220 80 L300 80 L290 100 L230 100 Z"/>
    <line x1="260" y1="60" x2="260" y2="80"/>
    <path d="M220 100 Q190 190 210 290"/>
    <path d="M300 100 Q330 190 310 290"/>
    <line x1="200" y1="290" x2="320" y2="290"/>
    <path d="M210 290 L200 320 L320 320 L310 290"/>
    <path d="M260 240 Q240 200 250 170 Q260 150 270 170 Q280 200 260 240"/>
    <path d="M260 230 Q252 210 255 190 Q260 180 265 190 Q268 210 260 230"/>
    <line x1="220" y1="140" x2="300" y2="140"/>
    <line x1="215" y1="250" x2="305" y2="250"/>
    <rect x="245" y="260" width="30" height="10"/>`,
  globe: `<circle cx="260" cy="210" r="110"/>
    <ellipse cx="260" cy="210" rx="110" ry="30"/>
    <ellipse cx="260" cy="210" rx="30" ry="110"/>
    <ellipse cx="260" cy="210" rx="75" ry="110"/>
    <ellipse cx="260" cy="165" rx="95" ry="20"/>
    <ellipse cx="260" cy="255" rx="95" ry="20"/>
    <path d="M245 320 L245 355 L275 355 L275 320"/>
    <path d="M200 355 Q200 380 220 380 L300 380 Q320 380 320 355"/>
    <path d="M135 210 A125 125 0 0 0 385 210"/>`,
  drum: `<ellipse cx="260" cy="260" rx="100" ry="70"/>
    <ellipse cx="260" cy="260" rx="70" ry="50"/>
    <ellipse cx="150" cy="180" rx="50" ry="20"/>
    <line x1="100" y1="180" x2="100" y2="210"/><line x1="200" y1="180" x2="200" y2="210"/>
    <path d="M100 210 A50 20 0 0 0 200 210"/>
    <ellipse cx="380" cy="160" rx="40" ry="12"/>
    <ellipse cx="380" cy="155" rx="40" ry="12"/>
    <line x1="380" y1="172" x2="380" y2="350"/>
    <ellipse cx="400" cy="120" rx="50" ry="12"/>
    <line x1="400" y1="132" x2="390" y2="260"/>
    <line x1="110" y1="140" x2="200" y2="210"/>
    <circle cx="110" cy="140" r="4"/>
    <line x1="320" y1="140" x2="250" y2="220"/>
    <circle cx="320" cy="140" r="4"/>
    <line x1="170" y1="315" x2="160" y2="370"/>
    <line x1="350" y1="315" x2="360" y2="370"/>`,
  paintbrush: `<path d="M260 120 C150 100 90 170 100 250 C110 330 200 370 280 360 C360 350 410 290 400 220 C390 150 340 110 260 120"/>
    <ellipse cx="300" cy="280" rx="30" ry="25"/>
    <circle cx="180" cy="170" r="20"/><circle cx="250" cy="155" r="18"/>
    <circle cx="330" cy="170" r="16"/><circle cx="150" cy="240" r="17"/>
    <circle cx="370" cy="230" r="15"/><circle cx="200" cy="310" r="16"/>
    <line x1="130" y1="310" x2="60" y2="390"/>
    <path d="M130 310 Q120 300 125 290 Q135 295 140 305 Q135 315 130 310"/>
    <circle cx="180" cy="170" r="8"/><circle cx="250" cy="155" r="7"/>`,
  teapot: `<path d="M180 180 Q180 140 220 140 L320 140 Q360 140 360 180 L360 280 Q360 320 320 320 L220 320 Q180 320 180 280 Z"/>
    <path d="M210 140 L210 125 L330 125 L330 140"/>
    <circle cx="270" cy="115" r="12"/>
    <path d="M360 190 Q410 170 430 150 Q445 135 440 125"/>
    <path d="M360 220 Q400 200 420 170"/>
    <path d="M180 190 Q120 190 120 240 Q120 290 180 290"/>
    <line x1="195" y1="200" x2="345" y2="200"/>
    <line x1="195" y1="280" x2="345" y2="280"/>
    <path d="M210 320 L200 345 L340 345 L330 320"/>
    <path d="M250 110 Q240 85 250 65"/>
    <path d="M275 105 Q285 80 275 55"/>`,
  trophy: `<path d="M190 100 L190 200 Q190 270 260 270 Q330 270 330 200 L330 100"/>
    <line x1="180" y1="100" x2="340" y2="100"/>
    <path d="M190 140 Q130 140 130 180 Q130 220 190 220"/>
    <path d="M330 140 Q390 140 390 180 Q390 220 330 220"/>
    <path d="M250 270 L250 330 L270 330 L270 270"/>
    <path d="M210 330 L310 330 L320 355 L200 355 Z"/>
    <line x1="195" y1="355" x2="325" y2="355"/>
    ${(() => { const sx=260,sy=170,so=25,si=10; let d=""; for(let i=0;i<10;i++){const r=i%2===0?so:si;const a=(i*Math.PI)/5-Math.PI/2;d+=(i===0?"M":"L")+`${sx+r*Math.cos(a)} ${sy+r*Math.sin(a)} `;}return `<path d="${d}Z"/>`; })()}
    <line x1="210" y1="120" x2="210" y2="180"/>
    <line x1="255" y1="220" x2="265" y2="220"/>
    <line x1="260" y1="210" x2="260" y2="250"/>`,
  scissors: `<path d="M260 210 L380 110 L395 125 L270 220"/>
    <path d="M260 210 L380 310 L395 295 L270 200"/>
    <circle cx="265" cy="210" r="8"/>
    <ellipse cx="195" cy="175" rx="45" ry="28" transform="rotate(-27 195 175)"/>
    <ellipse cx="195" cy="245" rx="45" ry="28" transform="rotate(27 195 245)"/>
    <line x1="290" y1="200" x2="385" y2="115"/>
    <line x1="290" y1="220" x2="385" y2="305"/>
    <ellipse cx="195" cy="175" rx="25" ry="14" transform="rotate(-27 195 175)"/>
    <ellipse cx="195" cy="245" rx="25" ry="14" transform="rotate(27 195 245)"/>
    <line x1="230" y1="190" x2="260" y2="205"/>
    <line x1="230" y1="230" x2="260" y2="215"/>`,
  binoculars: `<ellipse cx="185" cy="210" rx="55" ry="110"/>
    <ellipse cx="335" cy="210" rx="55" ry="110"/>
    <circle cx="185" cy="310" r="45"/><circle cx="185" cy="310" r="30"/>
    <circle cx="335" cy="310" r="45"/><circle cx="335" cy="310" r="30"/>
    <rect x="235" y="180" width="50" height="40"/>
    <rect x="155" y="105" width="60" height="15"/>
    <rect x="305" y="105" width="60" height="15"/>
    <circle cx="260" cy="200" r="15"/>
    <line x1="135" y1="230" x2="235" y2="230"/>
    <line x1="285" y1="230" x2="385" y2="230"/>`,
  watercan: `<path d="M140 180 L340 180 L340 330 Q340 350 320 350 L160 350 Q140 350 140 330 Z"/>
    <line x1="340" y1="220" x2="420" y2="140"/><line x1="340" y1="240" x2="410" y2="170"/>
    <ellipse cx="430" cy="130" rx="25" ry="18" transform="rotate(-40 430 130)"/>
    <circle cx="425" cy="125" r="3"/><circle cx="435" cy="130" r="3"/><circle cx="430" cy="138" r="3"/>
    <path d="M160 180 Q120 130 160 100 Q200 80 240 100 Q260 120 240 180"/>
    <line x1="155" y1="260" x2="325" y2="260"/>
    <line x1="140" y1="220" x2="340" y2="220"/>
    <line x1="155" y1="350" x2="155" y2="365"/>
    <line x1="325" y1="350" x2="325" y2="365"/>`,
  skateboard: `<path d="M80 240 Q60 210 80 190 Q100 175 120 200 L400 200 Q420 175 440 190 Q460 210 440 240 Z"/>
    <line x1="120" y1="200" x2="400" y2="200"/>
    <line x1="160" y1="205" x2="160" y2="235"/><line x1="200" y1="205" x2="200" y2="235"/>
    <line x1="260" y1="205" x2="260" y2="235"/><line x1="320" y1="205" x2="320" y2="235"/><line x1="360" y1="205" x2="360" y2="235"/>
    <rect x="350" y="240" width="60" height="20"/><rect x="110" y="240" width="60" height="20"/>
    <circle cx="360" cy="290" r="25"/><circle cx="360" cy="290" r="10"/>
    <circle cx="400" cy="290" r="25"/><circle cx="400" cy="290" r="10"/>
    <circle cx="120" cy="290" r="25"/><circle cx="120" cy="290" r="10"/>
    <circle cx="160" cy="290" r="25"/><circle cx="160" cy="290" r="10"/>
    <line x1="350" y1="260" x2="350" y2="270"/><line x1="410" y1="260" x2="410" y2="270"/>
    <line x1="110" y1="260" x2="110" y2="270"/><line x1="170" y1="260" x2="170" y2="270"/>`,
  microscope: `<rect x="150" y="350" width="220" height="20"/>
    <path d="M300 350 L300 100 L330 100 L330 350"/>
    <path d="M300 100 L240 100 L230 120 L300 120"/>
    <rect x="220" y="80" width="30" height="20"/>
    <line x1="250" y1="120" x2="250" y2="160"/>
    <line x1="240" y1="120" x2="235" y2="150"/>
    <line x1="270" y1="120" x2="265" y2="145"/>
    <rect x="200" y="200" width="160" height="15"/>
    <line x1="230" y1="195" x2="220" y2="185"/><line x1="330" y1="195" x2="340" y2="185"/>
    <ellipse cx="340" cy="170" rx="18" ry="12"/>
    <ellipse cx="340" cy="250" rx="14" ry="10"/>
    <line x1="280" y1="215" x2="280" y2="350"/>
    <rect x="240" y="190" width="50" height="10"/>
    <line x1="190" y1="350" x2="190" y2="370"/><line x1="340" y1="350" x2="340" y2="370"/>`,
  get compass() {
    let marks = "";
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      marks += `<line x1="${260 + 100 * Math.cos(a)}" y1="${210 + 100 * Math.sin(a)}" x2="${260 + 108 * Math.cos(a)}" y2="${210 + 108 * Math.sin(a)}"/>`;
    }
    return `<circle cx="260" cy="210" r="120"/>
      <circle cx="260" cy="210" r="105"/>
      <circle cx="260" cy="210" r="8"/>
      <path d="M260 210 L245 130 L260 115 L275 130 Z"/>
      <path d="M260 210 L245 290 L260 305 L275 290 Z"/>
      <path d="M260 210 L340 195 L355 210 L340 225 Z"/>
      <path d="M260 210 L180 195 L165 210 L180 225 Z"/>
      <line x1="260" y1="95" x2="260" y2="105"/>
      <line x1="260" y1="315" x2="260" y2="325"/>
      <line x1="370" y1="210" x2="380" y2="210"/>
      <line x1="140" y1="210" x2="150" y2="210"/>
      ${marks}
      <circle cx="260" cy="210" r="130"/>`;
  },
  get alarm() {
    let marks = "";
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6 - Math.PI / 2;
      marks += `<line x1="${260 + 78 * Math.cos(a)}" y1="${220 + 78 * Math.sin(a)}" x2="${260 + 88 * Math.cos(a)}" y2="${220 + 88 * Math.sin(a)}"/>`;
    }
    return `<circle cx="260" cy="220" r="100"/>
      <circle cx="260" cy="220" r="88"/>
      <line x1="260" y1="220" x2="260" y2="165"/>
      <line x1="260" y1="220" x2="310" y2="190"/>
      <circle cx="260" cy="220" r="5"/>
      ${marks}
      <path d="M157 135 A28 28 0 0 1 213 135"/>
      <path d="M307 135 A28 28 0 0 1 363 135"/>
      <line x1="200" y1="145" x2="215" y2="155"/>
      <line x1="320" y1="145" x2="305" y2="155"/>
      <path d="M240 125 L260 110 L280 125"/>
      <path d="M195 310 L180 340 L200 340"/>
      <path d="M325 310 L340 340 L320 340"/>`;
  },
  mailbox: `<path d="M160 180 L160 340 L360 340 L360 180"/>
    <path d="M160 180 A100 100 0 0 1 360 180"/>
    <path d="M360 200 L395 200 L395 160"/>
    <path d="M395 160 L395 190 L375 175 Z"/>
    <line x1="200" y1="180" x2="320" y2="180"/>
    <path d="M190 180 A70 70 0 0 1 330 180"/>
    <path d="M245 340 L245 400 L275 400 L275 340"/>
    <line x1="220" y1="400" x2="300" y2="400"/>
    <line x1="160" y1="260" x2="360" y2="260"/>
    <line x1="240" y1="290" x2="280" y2="290"/>
    <circle cx="175" cy="195" r="4"/><circle cx="345" cy="195" r="4"/>
    <path d="M220 175 L230 155 L290 155 L300 175"/>`,
  helicopter: `<path d="M150 220 Q100 220 100 250 Q100 290 150 290 L300 290 Q340 290 340 260 Q340 220 300 220 Z"/>
    <path d="M130 230 Q110 255 130 280"/>
    <path d="M110 255 A25 25 0 0 1 160 255"/>
    <path d="M300 240 L430 200 L430 230 L300 265"/>
    <path d="M420 200 L440 160 L455 165 L440 200"/>
    <line x1="440" y1="160" x2="435" y2="135"/><line x1="440" y1="160" x2="455" y2="140"/>
    <line x1="230" y1="220" x2="230" y2="190"/>
    <line x1="80" y1="185" x2="380" y2="185"/>
    <path d="M80 185 Q80 180 85 180"/><path d="M380 185 Q380 180 375 180"/>
    <circle cx="230" cy="188" r="6"/>
    <line x1="160" y1="290" x2="160" y2="310"/><line x1="280" y1="290" x2="280" y2="310"/>
    <line x1="130" y1="315" x2="310" y2="315"/>
    <line x1="210" y1="225" x2="210" y2="285"/>`,
  whale: `<path d="M110 230 C110 150 200 120 280 140 C360 160 380 200 370 230"/>
    <path d="M110 230 C110 300 200 330 280 310 C360 290 380 260 370 230"/>
    <path d="M370 220 Q400 210 420 180"/><path d="M370 240 Q400 250 420 280"/>
    <path d="M420 180 Q450 150 440 170 Q430 190 420 180"/>
    <path d="M420 280 Q450 310 440 290 Q430 270 420 280"/>
    <circle cx="170" cy="210" r="8"/><circle cx="170" cy="210" r="3"/>
    <path d="M120 245 Q200 260 300 245"/>
    <path d="M150 260 Q200 280 280 265"/>
    <path d="M160 280 Q210 300 270 285"/>
    <path d="M170 295 Q215 310 260 300"/>
    <path d="M220 270 Q200 320 230 340 Q260 330 250 290"/>
    <path d="M200 140 Q190 100 180 80"/><path d="M200 140 Q210 100 220 80"/>
    <path d="M175 75 Q200 65 225 75"/>`,
  pineapple: `<ellipse cx="260" cy="250" rx="80" ry="120"/>
    <line x1="195" y1="180" x2="245" y2="360"/><line x1="230" y1="155" x2="280" y2="345"/>
    <line x1="270" y1="150" x2="310" y2="340"/><line x1="305" y1="170" x2="325" y2="320"/>
    <line x1="305" y1="180" x2="255" y2="360"/><line x1="285" y1="155" x2="235" y2="345"/>
    <line x1="245" y1="150" x2="205" y2="340"/><line x1="210" y1="170" x2="195" y2="320"/>
    <path d="M260 135 Q260 80 230 50"/><path d="M260 135 Q265 75 290 45"/>
    <path d="M250 140 Q220 90 195 70"/><path d="M270 140 Q300 90 325 70"/>
    <path d="M245 145 Q200 110 175 100"/><path d="M275 145 Q320 110 345 100"/>
    <line x1="260" y1="135" x2="260" y2="55"/>`,
  frog: `<ellipse cx="260" cy="270" rx="100" ry="70"/>
    <circle cx="260" cy="190" r="60"/>
    <circle cx="220" cy="155" r="22"/><circle cx="300" cy="155" r="22"/>
    <circle cx="220" cy="152" r="8"/><circle cx="300" cy="152" r="8"/>
    <path d="M210 215 Q260 240 310 215"/>
    <path d="M230 210 Q260 225 290 210"/>
    <path d="M175 280 Q120 310 110 340 L130 340 L140 330 L150 340"/>
    <path d="M345 280 Q400 310 410 340 L390 340 L380 330 L370 340"/>
    <path d="M180 300 Q130 340 120 370 L140 370 L155 360 L170 370"/>
    <path d="M340 300 Q390 340 400 370 L380 370 L365 360 L350 370"/>
    <circle cx="245" cy="190" r="3"/><circle cx="275" cy="190" r="3"/>`,
  tent: `<path d="M260 80 L100 340 L420 340 Z"/>
    <line x1="260" y1="80" x2="220" y2="340"/>
    <line x1="260" y1="80" x2="300" y2="340"/>
    <path d="M220 340 Q260 280 300 340"/>
    <line x1="260" y1="80" x2="270" y2="70"/>
    <line x1="180" y1="210" x2="80" y2="340"/>
    <line x1="340" y1="210" x2="440" y2="340"/>
    <line x1="75" y1="340" x2="85" y2="355"/>
    <line x1="435" y1="340" x2="445" y2="355"/>
    <line x1="70" y1="340" x2="450" y2="340"/>
    <line x1="180" y1="210" x2="100" y2="340"/>
    <line x1="340" y1="210" x2="420" y2="340"/>
    <path d="M270 70 L290 60 L270 50"/>
    <line x1="150" y1="260" x2="170" y2="260"/>
    <line x1="350" y1="260" x2="370" y2="260"/>`,
  get wrench() {
    let bolt = "", boltInner = "";
    const bx = 420, by = 290;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      bolt += (i === 0 ? "M" : "L") + `${bx + 30 * Math.cos(a)} ${by + 30 * Math.sin(a)} `;
      boltInner += (i === 0 ? "M" : "L") + `${bx + 18 * Math.cos(a)} ${by + 18 * Math.sin(a)} `;
    }
    return `<path d="M170 310 L310 170 L320 180 L180 320 Z"/>
      <path d="M310 170 L300 130 Q310 90 350 90 Q390 90 400 120 Q400 150 370 160 L320 180"/>
      <line x1="340" y1="110" x2="370" y2="140"/>
      <path d="M170 310 Q150 330 160 345 Q170 360 190 340 L180 320"/>
      <line x1="210" y1="290" x2="220" y2="280"/>
      <line x1="230" y1="270" x2="240" y2="260"/>
      <line x1="250" y1="250" x2="260" y2="240"/>
      <path d="${bolt}Z"/>
      <path d="${boltInner}Z"/>
      <line x1="${bx}" y1="${by - 30}" x2="${bx}" y2="${by - 50}"/>
      <line x1="${bx - 8}" y1="${by - 35}" x2="${bx - 8}" y2="${by - 50}"/>
      <line x1="${bx + 8}" y1="${by - 35}" x2="${bx + 8}" y2="${by - 50}"/>`;
  },
  saxophone: `<path d="M175 340 A55 55 0 1 1 285 340"/>
    <path d="M185 340 A40 40 0 1 1 275 340"/>
    <path d="M270 310 Q320 260 320 200 Q320 140 300 100"/>
    <path d="M280 320 Q340 260 340 200 Q340 140 320 100"/>
    <path d="M300 100 Q280 70 250 80"/><path d="M320 100 Q300 65 265 75"/>
    <line x1="250" y1="80" x2="235" y2="60"/><line x1="265" y1="75" x2="245" y2="55"/>
    <line x1="235" y1="60" x2="245" y2="55"/>
    <circle cx="305" cy="150" r="7"/><circle cx="310" cy="180" r="7"/>
    <circle cx="315" cy="210" r="7"/><circle cx="310" cy="240" r="7"/><circle cx="300" cy="270" r="7"/>
    <line x1="312" y1="150" x2="330" y2="145"/>
    <line x1="317" y1="180" x2="340" y2="178"/>
    <line x1="322" y1="210" x2="345" y2="212"/>
    <path d="M182 340 A48 48 0 1 1 278 340"/>`,
  swan: `<path d="M180 250 C150 220 180 180 210 200 C250 220 350 210 380 240 C410 270 380 310 330 310 C280 310 200 300 180 250"/>
    <path d="M210 200 C190 170 170 130 165 100 Q160 80 175 75"/>
    <path d="M220 210 C210 185 195 145 185 110 Q180 90 190 82"/>
    <circle cx="180" cy="78" r="15"/>
    <path d="M165 75 L140 70 L140 82 L165 80"/>
    <circle cx="175" cy="74" r="3"/>
    <path d="M280 230 C300 210 340 220 360 240 C370 250 360 270 340 270 C320 270 290 260 280 250"/>
    <path d="M310 230 Q330 230 350 245"/>
    <path d="M300 240 Q325 240 345 255"/>
    <path d="M380 240 Q400 225 410 210"/>
    <path d="M385 245 Q405 235 415 225"/>
    <path d="M140 310 Q180 320 220 310"/>
    <path d="M280 315 Q320 325 360 315"/>
    <path d="M120 330 Q200 345 280 330"/>`,
};

function setReferenceSvg(promptKey = dailyPrompt.key) {
  if (!referenceSvg) return;
  const markup = promptSvgMarkup[promptKey] || "";
  referenceSvg.innerHTML = markup.trim();
}

async function createShareGif(score) {
  if (!strokes.length) {
    return null;
  }

  const width = 900;
  const height = 520;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctxClip = canvas.getContext("2d");

  const totalPoints = strokes.reduce(
    (sum, stroke) => sum + stroke.points.length,
    0
  );

  const frameCount = Math.min(36, Math.max(18, Math.round(totalPoints / 25)));
  const holdFrames = 8;
  const frames = [];

  const renderFrame = (progress) => {
    ctxClip.clearRect(0, 0, width, height);
    ctxClip.fillStyle = "#121521";
    ctxClip.fillRect(0, 0, width, height);

    ctxClip.fillStyle = "#7bff93";
    ctxClip.font = "700 28px Space Grotesk, sans-serif";
    ctxClip.fillText("Drawdle", 32, 48);
    ctxClip.fillStyle = "#f4f4f6";
    ctxClip.font = "600 18px Space Grotesk, sans-serif";
    ctxClip.fillText(dailyPrompt.title, 32, 76);
    ctxClip.fillStyle = "#9ca6bf";
    ctxClip.font = "500 14px Space Grotesk, sans-serif";
    ctxClip.fillText(`Score ${score}`, 32, 98);

    const left = { x: 32, y: 130, w: 400, h: 340 };
    const right = { x: 468, y: 130, w: 400, h: 340 };

    ctxClip.fillStyle = "#f8f9fc";
    ctxClip.fillRect(left.x, left.y, left.w, left.h);
    ctxClip.fillStyle = "#2a2f3f";
    ctxClip.fillRect(right.x, right.y, right.w, right.h);

    ctxClip.save();
    ctxClip.beginPath();
    ctxClip.rect(left.x, left.y, left.w, left.h);
    ctxClip.clip();
    ctxClip.translate(left.x, left.y);
    ctxClip.scale(left.w / drawCanvas.width, left.h / drawCanvas.height);
    ctxClip.lineCap = "round";
    ctxClip.lineJoin = "round";
    ctxClip.strokeStyle = "#121521";
    ctxClip.globalCompositeOperation = "source-over";

    const target = Math.floor(progress * totalPoints);
    let count = 0;
    for (let i = 0; i < strokes.length; i += 1) {
      const stroke = strokes[i];
      if (!stroke.points.length) continue;
      ctxClip.lineWidth = stroke.size;
      ctxClip.globalCompositeOperation =
        stroke.mode === "erase" ? "destination-out" : "source-over";
      ctxClip.beginPath();
      ctxClip.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let p = 1; p < stroke.points.length; p += 1) {
        if (count >= target) break;
        ctxClip.lineTo(stroke.points[p].x, stroke.points[p].y);
        count += 1;
      }
      ctxClip.stroke();
      if (count >= target) break;
    }
    ctxClip.restore();

    ctxClip.save();
    ctxClip.beginPath();
    ctxClip.rect(right.x, right.y, right.w, right.h);
    ctxClip.clip();
    const scale = right.w / drawCanvas.width;
    drawReferenceStatic(ctxClip, right.x, right.y, scale);
    ctxClip.restore();

    ctxClip.fillStyle = "#9ca6bf";
    ctxClip.font = "500 13px Space Grotesk, sans-serif";
    ctxClip.fillText("Your drawing", left.x, left.y - 8);
    ctxClip.fillText("Reference", right.x, right.y - 8);
  };

  for (let i = 0; i < frameCount; i += 1) {
    const progress = frameCount === 1 ? 1 : i / (frameCount - 1);
    renderFrame(progress);
    const imageData = ctxClip.getImageData(0, 0, width, height);
    frames.push(
      window.drawdleGif.imageDataToIndexed(imageData, width, height)
    );
  }

  renderFrame(1);
  for (let i = 0; i < holdFrames; i += 1) {
    const imageData = ctxClip.getImageData(0, 0, width, height);
    frames.push(
      window.drawdleGif.imageDataToIndexed(imageData, width, height)
    );
  }

  const delayCs = 6;
  return window.drawdleGif.encodeGif(frames, width, height, delayCs);
}

async function shareGif(score) {
  const originalText = shareBtn.textContent;
  shareBtn.disabled = true;
  shareBtn.textContent = "Rendering...";
  try {
    const blob = await createShareGif(score);
    shareBtn.textContent = originalText;
    shareBtn.disabled = false;

    if (!blob) {
      downloadCard();
      return;
    }

    const file = new File([blob], "drawdle-share.gif", {
      type: "image/gif",
    });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: "Drawdle",
        files: [file],
        text: `Drawdle · ${dailyPrompt.title} · Score ${score}`,
      });
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "drawdle-share.gif";
      link.click();
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    shareBtn.textContent = originalText;
    shareBtn.disabled = false;
    downloadCard();
  }
}

function roundRect(ctxR, x, y, w, h, r) {
  ctxR.beginPath();
  ctxR.moveTo(x + r, y);
  ctxR.lineTo(x + w - r, y);
  ctxR.quadraticCurveTo(x + w, y, x + w, y + r);
  ctxR.lineTo(x + w, y + h - r);
  ctxR.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctxR.lineTo(x + r, y + h);
  ctxR.quadraticCurveTo(x, y + h, x, y + h - r);
  ctxR.lineTo(x, y + r);
  ctxR.quadraticCurveTo(x, y, x + r, y);
  ctxR.closePath();
}

function createShareCanvas(score) {
  // Wide horizontal layout — score | drawing | reference in one row
  const width = 1200;
  const height = 630;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const c = canvas.getContext("2d");

  const bg = "#0c0f1a";
  const green = "#34d399";
  const greenDim = "#1a3a2e";
  const white = "#f0f2f8";
  const muted = "#6b7394";
  const panelBg = "#1c2035";
  const panelBorder = "#2a2f4a";

  // Background
  c.fillStyle = bg;
  c.fillRect(0, 0, width, height);

  // Layout: 3 columns with gaps
  const pad = 36;
  const gap = 20;
  const colW = Math.floor((width - pad * 2 - gap * 2) / 3);
  const colH = height - pad * 2;
  const col1X = pad;
  const col2X = pad + colW + gap;
  const col3X = pad + (colW + gap) * 2;
  const colY = pad;

  // ── Column 1: Score section ──
  // Subtle glow behind score column
  const glow = c.createRadialGradient(col1X + colW / 2, colY + colH / 2, 0, col1X + colW / 2, colY + colH / 2, colW);
  glow.addColorStop(0, "rgba(52, 211, 153, 0.07)");
  glow.addColorStop(1, "transparent");
  c.fillStyle = glow;
  c.fillRect(col1X, colY, colW, colH);

  // Brand
  c.fillStyle = green;
  c.font = "700 26px system-ui, -apple-system, sans-serif";
  c.fillText("Drawdle", col1X + 8, colY + 36);

  // Date
  c.fillStyle = muted;
  c.font = "500 14px system-ui, -apple-system, sans-serif";
  c.fillText(formatDate(), col1X + 8, colY + 60);

  // Prompt title
  c.fillStyle = white;
  c.font = "700 30px system-ui, -apple-system, sans-serif";
  c.fillText(dailyPrompt.title, col1X + 8, colY + 110);

  // Big score
  c.fillStyle = green;
  c.font = "800 110px system-ui, -apple-system, sans-serif";
  c.fillText(String(score), col1X + 8, colY + 240);

  // /100 label
  const sw = c.measureText(String(score)).width;
  c.fillStyle = muted;
  c.font = "600 24px system-ui, -apple-system, sans-serif";
  c.fillText("/ 100", col1X + 8 + sw + 8, colY + 234);

  // Grid blocks — compact
  const blockSize = 24;
  const blockGap = 6;
  const blockY = colY + 270;
  const filled = Math.min(shareGridLength, Math.max(0, Math.round((score / 100) * shareGridLength)));
  for (let i = 0; i < shareGridLength; i += 1) {
    const bx = col1X + 8 + i * (blockSize + blockGap);
    roundRect(c, bx, blockY, blockSize, blockSize, 5);
    c.fillStyle = i < filled ? green : greenDim;
    c.fill();
  }

  // Streak / plays
  const stats = loadStats();
  c.fillStyle = muted;
  c.font = "500 15px system-ui, -apple-system, sans-serif";
  c.fillText(`Streak ${stats.streak}  ·  ${stats.plays} plays`, col1X + 8, blockY + blockSize + 30);

  // Footer in score column
  c.fillStyle = muted;
  c.font = "500 13px system-ui, -apple-system, sans-serif";
  c.fillText("drawdle.app", col1X + 8, colY + colH - 8);

  // ── Helper to draw a drawing panel ──
  const drawPanel = (px, label, drawFn) => {
    // Panel bg
    roundRect(c, px, colY, colW, colH, 18);
    c.fillStyle = panelBg;
    c.fill();
    c.strokeStyle = panelBorder;
    c.lineWidth = 1.5;
    c.stroke();

    // Label
    c.fillStyle = muted;
    c.font = "600 13px system-ui, -apple-system, sans-serif";
    c.fillText(label.toUpperCase(), px + 18, colY + 30);

    // Art area
    const inset = 14;
    const top = 44;
    const ax = px + inset;
    const ay = colY + top;
    const aw = colW - inset * 2;
    const ah = colH - top - inset;

    c.save();
    roundRect(c, ax, ay, aw, ah, 12);
    drawFn(ax, ay, aw, ah);
    c.restore();
  };

  // ── Column 2: User drawing ──
  drawPanel(col2X, "Your drawing", (ax, ay, aw, ah) => {
    c.fillStyle = "#ffffff";
    c.fill();
    c.clip();
    const s = Math.min(aw / drawCanvas.width, ah / drawCanvas.height);
    const ox = ax + (aw - drawCanvas.width * s) / 2;
    const oy = ay + (ah - drawCanvas.height * s) / 2;
    c.drawImage(drawCanvas, ox, oy, drawCanvas.width * s, drawCanvas.height * s);
  });

  // ── Column 3: Reference ──
  drawPanel(col3X, "Reference", (ax, ay, aw, ah) => {
    c.fillStyle = "#1a1e30";
    c.fill();
    c.clip();
    const s = Math.min(aw / drawCanvas.width, ah / drawCanvas.height);
    const ox = ax + (aw - drawCanvas.width * s) / 2;
    const oy = ay + (ah - drawCanvas.height * s) / 2;
    drawReferenceStatic(c, ox, oy, s);
  });

  return canvas;
}

async function createShareImage(score) {
  const canvas = createShareCanvas(score);
  // toBlob is preferred but can fail on file:// in some browsers
  if (canvas.toBlob) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          // Fallback: convert dataURL to blob
          resolve(dataURLtoBlob(canvas.toDataURL("image/png")));
        }
      }, "image/png");
    });
  }
  return dataURLtoBlob(canvas.toDataURL("image/png"));
}

function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(",");
  const mime = parts[0].match(/:(.*?);/)[1];
  const binary = atob(parts[1]);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

async function shareResultUnified() {
  const score = parseInt(scoreValue.textContent, 10);
  if (Number.isNaN(score)) return;

  const siteUrl = `${window.location.origin}${window.location.pathname}`;
  const shareText = `Drawdle · ${dailyPrompt.title}\nScore: ${score}\n${buildShareGrid(score)}\nTry it: ${siteUrl}`;
  const originalText = shareBtn.textContent;
  shareBtn.disabled = true;
  shareBtn.textContent = "Preparing...";

  let shareCanvas;
  try {
    shareCanvas = createShareCanvas(score);
  } catch (err) {
    console.error("Drawdle: createShareCanvas failed", err);
    shareBtn.textContent = originalText;
    shareBtn.disabled = false;
    return;
  }

  // Convert to blob
  let blob;
  try {
    blob = await new Promise((resolve, reject) => {
      shareCanvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("toBlob returned null"));
      }, "image/png");
    });
  } catch (err) {
    console.error("Drawdle: toBlob failed", err);
    // Fallback: use toDataURL download
    downloadCanvasDirectly(shareCanvas);
    shareBtn.textContent = originalText;
    shareBtn.disabled = false;
    return;
  }

  try {
    const file = new File([blob], "drawdle-share.png", { type: "image/png" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ text: shareText, files: [file] });
    } else if (navigator.share) {
      await navigator.share({ title: "Drawdle", text: shareText });
    } else {
      downloadAsFile(blob);
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      downloadAsFile(blob);
    }
  } finally {
    shareBtn.textContent = originalText;
    shareBtn.disabled = false;
  }
}

function downloadAsFile(blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "drawdle-share.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function downloadCanvasDirectly(cvs) {
  const a = document.createElement("a");
  a.download = "drawdle-share.png";
  a.href = cvs.toDataURL("image/png");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const shareGridLength = 5;

function buildShareGrid(score) {
  const blocks = Math.min(shareGridLength, Math.max(0, Math.round((score / 100) * shareGridLength)));
  const row = "🟩".repeat(blocks) + "⬜".repeat(shareGridLength - blocks);
  return row;
}

function renderShareGridVisual(score) {
  if (!shareGridVisual) return;
  shareGridVisual.innerHTML = "";
  const filled = Math.min(shareGridLength, Math.max(0, Math.round((score / 100) * shareGridLength)));
  for (let i = 0; i < shareGridLength; i += 1) {
    const block = document.createElement("div");
    block.className = `share-block ${i < filled ? "filled" : "empty"}`;
    shareGridVisual.appendChild(block);
  }
}

function updateStatsOnScore(score) {
  const stats = loadStats();
  const todayKey = getTodayKey();

  if (stats.lastScored !== todayKey) {
    stats.plays += 1;
    stats.totalScore += score;

    if (stats.lastPlayed) {
      const last = new Date(stats.lastPlayed);
      const today = new Date(todayKey);
      const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        stats.streak += 1;
      } else if (diffDays > 1) {
        stats.streak = 1;
      }
    } else {
      stats.streak = 1;
    }

    stats.lastPlayed = todayKey;
    stats.lastScored = todayKey;
  }

  if (stats.best === null || score > stats.best) {
    stats.best = score;
  }
  stats.lastScore = score;

  saveStats(stats);
  updateStatsUI(stats);
  return stats;
}

function lockAttemptUI() {
  if (submitBtnEl) {
    submitBtnEl.disabled = true;
    submitBtnEl.textContent = "Come back tomorrow";
  }
}

function setScoreFeedback(score, stats) {
  if (!scoreFeedbackEl) return;
  if (score >= 90) scoreFeedbackEl.textContent = "Great overlap—you nailed it.";
  else if (score >= 70) scoreFeedbackEl.textContent = "Nice shape—try matching the size next time.";
  else if (score >= 50) scoreFeedbackEl.textContent = "Good start—reference was a bit more centered.";
  else scoreFeedbackEl.textContent = "Keep practicing—draw bold and fill the canvas.";
}


let modalPreviousFocus = null;

function getFocusables(container) {
  const sel = "button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])";
  return Array.from(container.querySelectorAll(sel));
}

function openModal(el) {
  modalPreviousFocus = document.activeElement;
  el.style.display = "flex";
  el.setAttribute("aria-hidden", "false");
  const focusables = getFocusables(el);
  if (focusables.length) focusables[0].focus();
}

function closeModal(el) {
  el.style.display = "none";
  el.setAttribute("aria-hidden", "true");
  if (modalPreviousFocus && typeof modalPreviousFocus.focus === "function") {
    modalPreviousFocus.focus();
  }
  modalPreviousFocus = null;
}

function trapModalFocus(e, modalEl) {
  if (e.key !== "Tab") return;
  const focusables = getFocusables(modalEl);
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

function downloadCard() {
  const score = scoreValue.textContent === "—" ? 0 : parseInt(scoreValue.textContent, 10);
  const canvas = createShareCanvas(score);
  const link = document.createElement("a");
  link.download = "drawdle-score.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

document.getElementById("clearBtn").addEventListener("click", () => {
  if (timerStarted && !roundLocked) {
    clearCanvas(true);
    clearBtn.textContent = "Clear";
  } else {
    clearCanvas(false);
  }
});

document.getElementById("submitBtn").addEventListener("click", () => {
  handleScore({ auto: false });
});

shareBtn.addEventListener("click", () => {
  shareResultUnified();
});

copyBtn.addEventListener("click", () => {
  const score = scoreValue.textContent;
  const siteUrl = `${window.location.origin}${window.location.pathname}`;
  const text = `Drawdle · ${dailyPrompt.title}\nScore: ${score}\n${buildShareGrid(score)}\nTry it: ${siteUrl}`;
  navigator.clipboard.writeText(text);
  copyBtn.textContent = "Copied!";
  setTimeout(() => {
    copyBtn.textContent = "Copy";
  }, 1500);
});

downloadBtn.addEventListener("click", downloadCard);

document.getElementById("eraseBtn").addEventListener("click", () => {
  if (roundLocked) return;
  erasing = !erasing;
  ctx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
  document.getElementById("eraseBtn").textContent = erasing ? "Ink" : "Erase";
});

drawCanvas.addEventListener("mousedown", startDraw);

drawCanvas.addEventListener("mousemove", moveDraw);

drawCanvas.addEventListener("mouseup", endDraw);

drawCanvas.addEventListener("mouseleave", endDraw);

drawCanvas.addEventListener("touchstart", (event) => {
  event.preventDefault();
  startDraw(event);
});

drawCanvas.addEventListener("touchmove", (event) => {
  event.preventDefault();
  moveDraw(event);
});

drawCanvas.addEventListener("touchend", endDraw);

if (startDrawBtn) {
  startDrawBtn.addEventListener("click", () => {
    beginGame();
  });
}

const howBtn = document.getElementById("howBtn");
const closeHowBtn = document.getElementById("closeModal");
const statsBtn = document.getElementById("statsBtn");
const closeStatsBtn = document.getElementById("closeStats");
// challengeBtn removed — URL included in share text
const profileBtn = document.getElementById("profileBtn");

howBtn.addEventListener("click", () => {
  openModal(modal);
});

closeHowBtn.addEventListener("click", () => {
  closeModal(modal);
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal(modal);
  }
});

modal.addEventListener("keydown", (e) => {
  trapModalFocus(e, modal);
  if (e.key === "Escape") closeModal(modal);
});

statsBtn.addEventListener("click", () => {
  openModal(statsModal);
});

closeStatsBtn.addEventListener("click", () => {
  closeModal(statsModal);
});

statsModal.addEventListener("keydown", (e) => {
  trapModalFocus(e, statsModal);
  if (e.key === "Escape") closeModal(statsModal);
});


// Challenge button removed — site URL is included in share/copy text

if (profileBtn) {
  profileBtn.addEventListener("click", () => {
    profileBtn.textContent = "Profiles soon";
    setTimeout(() => {
      profileBtn.textContent = "Create profile";
    }, 1500);
  });
}

if (devResetBtn) {
  const isDev =
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  if (isDev) {
    devResetBtn.classList.remove("hidden");
    devResetBtn.addEventListener("click", () => {
      localStorage.removeItem(storageKey);
      window.location.reload();
    });
  }
}

statsModal.addEventListener("click", (event) => {
  if (event.target === statsModal) {
    closeModal(statsModal);
  }
});


timer = timerMax;
timerValue.textContent = timer;
updateTimerRing();
dailyBadge.textContent = `Daily sketch · ${formatDate()}`;
dailyPrompt = getDailyPrompt();
promptTitleEl.textContent = dailyPrompt.title;
promptHintEl.textContent = dailyPrompt.hint;
if (readyPromptLabel) readyPromptLabel.textContent = dailyPrompt.title;
shareHeadline.textContent = `Drawdle · ${dailyPrompt.title}`;
referencePreview.classList.remove("revealed");
if (comparisonCard) comparisonCard.classList.add("hidden");
setReferenceSvg(dailyPrompt.key);
renderMaskedReference();
const stats = loadStats();
if (stats.lastScored === getTodayKey() && (stats.lastScore === null || stats.lastScore === undefined)) {
  stats.lastScored = null;
  saveStats(stats);
}
updateStatsUI(stats);
if (stats.lastScored === getTodayKey()) {
  restoreTodayState(stats);
  lockAttemptUI();
}
