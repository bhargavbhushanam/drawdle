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
  { key: "mug", title: "Coffee Mug", hint: "Handle on the right. Steam optional." },
  { key: "leaf", title: "Leaf", hint: "One vein changes everything." },
  { key: "house", title: "Tiny House", hint: "Yours or your dream one." },
  { key: "balloon", title: "Balloon", hint: "Don't let it float away." },
  { key: "fish", title: "Fish", hint: "Blub blub." },
  { key: "star", title: "Star", hint: "Make a wish." },
  { key: "lightbulb", title: "Lightbulb", hint: "Bright idea incoming." },
  { key: "cat", title: "Cat Face", hint: "The internet's favorite." },
  { key: "umbrella", title: "Umbrella", hint: "Rainy day essential." },
  { key: "key", title: "Key", hint: "Unlock something." },
  { key: "pizza", title: "Pizza Slice", hint: "Extra cheese." },
  { key: "rocket", title: "Rocket", hint: "3... 2... 1..." },
  { key: "crown", title: "Crown", hint: "Royalty in 30 seconds." },
  { key: "anchor", title: "Anchor", hint: "Heavy metal." },
  { key: "tree", title: "Tree", hint: "Branch out." },
  { key: "flower", title: "Flower", hint: "Stop and draw the roses." },
  { key: "sun", title: "Sun", hint: "Rays make it." },
  { key: "moon", title: "Crescent Moon", hint: "Nighttime vibes." },
  { key: "mushroom", title: "Mushroom", hint: "Toad approved." },
  { key: "heart", title: "Heart", hint: "Feel the love." },
  { key: "diamond", title: "Diamond", hint: "Shine bright." },
  { key: "ghost", title: "Ghost", hint: "Boo." },
  { key: "guitar", title: "Guitar", hint: "Rock on." },
  { key: "sailboat", title: "Sailboat", hint: "Smooth sailing." },
  { key: "skull", title: "Skull", hint: "Bone-chilling." },
  { key: "icecream", title: "Ice Cream", hint: "Two scoops minimum." },
  { key: "pencil", title: "Pencil", hint: "Draw what you draw with." },
  { key: "cloud", title: "Cloud", hint: "Fluffy and free." },
  { key: "bird", title: "Bird", hint: "Tweet tweet." },
  { key: "snowman", title: "Snowman", hint: "Three circles. Go." },
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
  mug(c) {
    const x = 150, y = 120, w = 200, h = 200, r = 18;
    c.beginPath();
    c.moveTo(x + r, y); c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y); c.stroke();
    c.beginPath(); c.moveTo(350, 170); c.quadraticCurveTo(410, 170, 410, 220);
    c.quadraticCurveTo(410, 270, 350, 270); c.stroke();
    c.beginPath(); c.moveTo(190, 140); c.quadraticCurveTo(210, 100, 260, 100);
    c.quadraticCurveTo(310, 100, 330, 140); c.stroke();
    c.beginPath(); c.moveTo(180, 170); c.lineTo(320, 170); c.stroke();
  },
  leaf(c) {
    c.beginPath(); c.moveTo(260, 90);
    c.quadraticCurveTo(140, 140, 160, 270); c.quadraticCurveTo(260, 350, 360, 270);
    c.quadraticCurveTo(380, 140, 260, 90); c.stroke();
    c.beginPath(); c.moveTo(260, 110); c.lineTo(260, 330); c.stroke();
  },
  house(c) {
    c.beginPath(); c.rect(170, 170, 180, 150); c.stroke();
    c.beginPath(); c.moveTo(160, 170); c.lineTo(260, 100); c.lineTo(360, 170); c.stroke();
    c.beginPath(); c.rect(240, 230, 40, 90); c.stroke();
  },
  balloon(c) {
    c.beginPath(); c.ellipse(260, 170, 80, 100, 0, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(260, 270); c.lineTo(260, 330); c.stroke();
    c.beginPath(); c.moveTo(260, 330); c.quadraticCurveTo(230, 360, 250, 390); c.stroke();
  },
  fish(c) {
    c.beginPath(); c.ellipse(240, 220, 90, 60, 0, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(330, 220); c.lineTo(390, 180); c.lineTo(390, 260); c.closePath(); c.stroke();
    c.beginPath(); c.arc(210, 210, 6, 0, Math.PI * 2); c.stroke();
  },
  star(c) {
    const cx = 260, cy = 210, outer = 100, inner = 40;
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) c.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      else c.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    c.closePath(); c.stroke();
  },
  lightbulb(c) {
    c.beginPath(); c.ellipse(260, 180, 70, 90, 0, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(220, 270); c.lineTo(230, 310); c.lineTo(260, 330);
    c.lineTo(290, 310); c.lineTo(300, 270); c.stroke();
    c.beginPath(); c.rect(245, 330, 30, 20); c.stroke();
  },
  cat(c) {
    c.beginPath(); c.arc(260, 220, 90, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(200, 150); c.lineTo(180, 80); c.lineTo(220, 130);
    c.moveTo(320, 150); c.lineTo(340, 80); c.lineTo(300, 130); c.stroke();
    c.beginPath(); c.ellipse(230, 210, 12, 16, 0, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.ellipse(290, 210, 12, 16, 0, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(240, 250); c.quadraticCurveTo(260, 260, 280, 250); c.stroke();
  },
  umbrella(c) {
    c.beginPath(); c.arc(260, 180, 100, Math.PI, 0); c.stroke();
    c.beginPath(); c.moveTo(260, 180); c.lineTo(260, 330); c.stroke();
    c.beginPath(); c.moveTo(260, 330); c.quadraticCurveTo(260, 360, 240, 360);
    c.quadraticCurveTo(220, 360, 220, 340); c.stroke();
  },
  key(c) {
    c.beginPath(); c.arc(200, 210, 40, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(240, 210); c.lineTo(370, 210); c.stroke();
    c.beginPath();
    c.moveTo(330, 210); c.lineTo(330, 240);
    c.moveTo(350, 210); c.lineTo(350, 240);
    c.moveTo(370, 210); c.lineTo(370, 240); c.stroke();
  },
  pizza(c) {
    c.beginPath(); c.moveTo(260, 100); c.lineTo(160, 320); c.lineTo(360, 320); c.closePath(); c.stroke();
    c.beginPath(); c.arc(260, 320, 100, Math.PI + 0.35, -0.35); c.stroke();
    c.beginPath(); c.arc(245, 220, 8, 0, Math.PI * 2);
    c.moveTo(288, 260); c.arc(280, 260, 8, 0, Math.PI * 2);
    c.moveTo(248, 280); c.arc(240, 280, 8, 0, Math.PI * 2); c.stroke();
  },
  rocket(c) {
    c.beginPath(); c.moveTo(230, 280); c.lineTo(230, 160);
    c.quadraticCurveTo(230, 100, 260, 80); c.quadraticCurveTo(290, 100, 290, 160);
    c.lineTo(290, 280); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(230, 260); c.lineTo(200, 300); c.lineTo(230, 280); c.stroke();
    c.beginPath(); c.moveTo(290, 260); c.lineTo(320, 300); c.lineTo(290, 280); c.stroke();
    c.beginPath(); c.moveTo(240, 280); c.quadraticCurveTo(250, 330, 260, 340);
    c.quadraticCurveTo(270, 330, 280, 280); c.stroke();
    c.beginPath(); c.arc(260, 180, 15, 0, Math.PI * 2); c.stroke();
  },
  crown(c) {
    c.beginPath(); c.moveTo(170, 260); c.lineTo(170, 170); c.lineTo(210, 220);
    c.lineTo(260, 140); c.lineTo(310, 220); c.lineTo(350, 170);
    c.lineTo(350, 260); c.closePath(); c.stroke();
  },
  anchor(c) {
    c.beginPath(); c.arc(260, 110, 22, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(260, 132); c.lineTo(260, 310); c.stroke();
    c.beginPath(); c.moveTo(200, 190); c.lineTo(320, 190); c.stroke();
    c.beginPath(); c.moveTo(260, 310); c.quadraticCurveTo(180, 310, 190, 270); c.stroke();
    c.beginPath(); c.moveTo(260, 310); c.quadraticCurveTo(340, 310, 330, 270); c.stroke();
  },
  tree(c) {
    c.beginPath(); c.rect(245, 250, 30, 100); c.stroke();
    c.beginPath(); c.arc(260, 190, 80, 0, Math.PI * 2); c.stroke();
  },
  flower(c) {
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      c.beginPath(); c.arc(260 + 38 * Math.cos(a), 170 + 38 * Math.sin(a), 22, 0, Math.PI * 2); c.stroke();
    }
    c.beginPath(); c.arc(260, 170, 16, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(260, 192); c.lineTo(260, 340); c.stroke();
    c.beginPath(); c.moveTo(260, 280); c.quadraticCurveTo(310, 260, 300, 290); c.stroke();
  },
  sun(c) {
    c.beginPath(); c.arc(260, 200, 50, 0, Math.PI * 2); c.stroke();
    c.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      c.moveTo(260 + 62 * Math.cos(a), 200 + 62 * Math.sin(a));
      c.lineTo(260 + 95 * Math.cos(a), 200 + 95 * Math.sin(a));
    }
    c.stroke();
  },
  moon(c) {
    c.beginPath(); c.moveTo(290, 100);
    c.bezierCurveTo(180, 120, 180, 300, 290, 320);
    c.bezierCurveTo(230, 280, 230, 140, 290, 100); c.stroke();
  },
  mushroom(c) {
    c.beginPath(); c.arc(260, 200, 90, Math.PI, 0); c.lineTo(170, 200); c.stroke();
    c.beginPath(); c.moveTo(230, 200); c.lineTo(230, 320); c.lineTo(290, 320); c.lineTo(290, 200); c.stroke();
    c.beginPath(); c.arc(230, 160, 12, 0, Math.PI * 2);
    c.moveTo(292, 145); c.arc(280, 145, 12, 0, Math.PI * 2); c.stroke();
  },
  heart(c) {
    c.beginPath(); c.moveTo(260, 300);
    c.bezierCurveTo(260, 260, 170, 230, 170, 180);
    c.bezierCurveTo(170, 120, 260, 120, 260, 180);
    c.bezierCurveTo(260, 120, 350, 120, 350, 180);
    c.bezierCurveTo(350, 230, 260, 260, 260, 300); c.stroke();
  },
  diamond(c) {
    c.beginPath(); c.moveTo(260, 90); c.lineTo(360, 200); c.lineTo(260, 340);
    c.lineTo(160, 200); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(160, 200); c.lineTo(360, 200); c.stroke();
    c.beginPath(); c.moveTo(260, 90); c.lineTo(220, 200);
    c.moveTo(260, 90); c.lineTo(300, 200); c.stroke();
  },
  ghost(c) {
    c.beginPath(); c.arc(260, 180, 80, Math.PI, 0);
    c.lineTo(340, 300); c.quadraticCurveTo(320, 270, 300, 300);
    c.quadraticCurveTo(280, 330, 260, 300); c.quadraticCurveTo(240, 270, 220, 300);
    c.lineTo(180, 300); c.lineTo(180, 180); c.stroke();
    c.beginPath(); c.arc(235, 185, 10, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(285, 185, 10, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.ellipse(260, 225, 10, 14, 0, 0, Math.PI * 2); c.stroke();
  },
  guitar(c) {
    c.beginPath(); c.moveTo(248, 150);
    c.quadraticCurveTo(190, 165, 195, 210); c.quadraticCurveTo(200, 240, 195, 260);
    c.quadraticCurveTo(180, 310, 220, 340); c.quadraticCurveTo(260, 360, 300, 340);
    c.quadraticCurveTo(340, 310, 325, 260); c.quadraticCurveTo(320, 240, 325, 210);
    c.quadraticCurveTo(330, 165, 272, 150); c.stroke();
    c.beginPath(); c.moveTo(248, 150); c.lineTo(248, 80); c.lineTo(272, 80); c.lineTo(272, 150); c.stroke();
    c.beginPath(); c.rect(244, 60, 32, 22); c.stroke();
    c.beginPath(); c.arc(260, 270, 18, 0, Math.PI * 2); c.stroke();
  },
  sailboat(c) {
    c.beginPath(); c.moveTo(150, 260); c.lineTo(170, 300); c.lineTo(350, 300); c.lineTo(370, 260); c.stroke();
    c.beginPath(); c.moveTo(260, 260); c.lineTo(260, 100); c.stroke();
    c.beginPath(); c.moveTo(260, 110); c.lineTo(340, 250); c.lineTo(260, 250); c.stroke();
    c.beginPath(); c.moveTo(260, 120); c.lineTo(210, 220); c.lineTo(260, 220); c.stroke();
  },
  skull(c) {
    c.beginPath(); c.arc(260, 180, 80, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(210, 250);
    c.quadraticCurveTo(210, 300, 260, 300); c.quadraticCurveTo(310, 300, 310, 250); c.stroke();
    c.beginPath(); c.ellipse(235, 175, 16, 20, 0, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.ellipse(285, 175, 16, 20, 0, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(255, 215); c.lineTo(260, 230); c.lineTo(265, 215); c.stroke();
    c.beginPath(); c.moveTo(230, 260); c.lineTo(290, 260); c.stroke();
    c.beginPath(); c.moveTo(250, 250); c.lineTo(250, 270);
    c.moveTo(260, 250); c.lineTo(260, 270);
    c.moveTo(270, 250); c.lineTo(270, 270); c.stroke();
  },
  icecream(c) {
    c.beginPath(); c.moveTo(210, 210); c.lineTo(260, 350); c.lineTo(310, 210); c.stroke();
    c.beginPath(); c.arc(260, 190, 52, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 130, 40, 0, Math.PI * 2); c.stroke();
  },
  pencil(c) {
    c.beginPath(); c.rect(240, 100, 40, 200); c.stroke();
    c.beginPath(); c.moveTo(240, 300); c.lineTo(260, 340); c.lineTo(280, 300); c.stroke();
    c.beginPath(); c.rect(240, 80, 40, 20); c.stroke();
  },
  cloud(c) {
    c.beginPath(); c.arc(220, 220, 45, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(270, 195, 50, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(320, 220, 40, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(270, 240, 38, 0, Math.PI * 2); c.stroke();
  },
  bird(c) {
    c.beginPath(); c.ellipse(250, 220, 60, 40, -0.1, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(320, 190, 25, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(345, 185); c.lineTo(370, 190); c.lineTo(345, 198); c.stroke();
    c.beginPath(); c.arc(330, 185, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(190, 210); c.lineTo(160, 190);
    c.moveTo(190, 220); c.lineTo(155, 210); c.stroke();
    c.beginPath(); c.ellipse(240, 210, 30, 15, -0.3, 0, Math.PI * 2); c.stroke();
  },
  snowman(c) {
    c.beginPath(); c.arc(260, 300, 60, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 210, 45, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 140, 30, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(250, 135, 4, 0, Math.PI * 2);
    c.moveTo(274, 135); c.arc(270, 135, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(260, 142); c.lineTo(280, 148); c.lineTo(260, 150); c.stroke();
    c.beginPath(); c.arc(260, 195, 4, 0, Math.PI * 2);
    c.moveTo(264, 215); c.arc(260, 215, 4, 0, Math.PI * 2);
    c.moveTo(264, 235); c.arc(260, 235, 4, 0, Math.PI * 2); c.stroke();
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
  mug: `<rect x="150" y="120" width="200" height="200" rx="18" ry="18"/>
    <path d="M350 170 Q410 170 410 220 Q410 270 350 270"/>
    <path d="M190 140 Q210 100 260 100 Q310 100 330 140"/>
    <path d="M180 170 H320"/>`,
  leaf: `<path d="M260 90 Q140 140 160 270 Q260 350 360 270 Q380 140 260 90"/>
    <path d="M260 110 L260 330"/>`,
  house: `<rect x="170" y="170" width="180" height="150"/>
    <path d="M160 170 L260 100 L360 170"/>
    <rect x="240" y="230" width="40" height="90"/>`,
  balloon: `<ellipse cx="260" cy="170" rx="80" ry="100"/>
    <path d="M260 270 L260 330"/>
    <path d="M260 330 Q230 360 250 390"/>`,
  fish: `<ellipse cx="240" cy="220" rx="90" ry="60"/>
    <path d="M330 220 L390 180 L390 260 Z"/>
    <circle cx="210" cy="210" r="6"/>`,
  get star() {
    const cx = 260, cy = 210, outer = 100, inner = 40, pts = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      pts.push(`${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`);
    }
    return `<polygon points="${pts.join(",")}"/>`;
  },
  lightbulb: `<ellipse cx="260" cy="180" rx="70" ry="90"/>
    <path d="M220 270 L230 310 L260 330 L290 310 L300 270"/>
    <rect x="245" y="330" width="30" height="20"/>`,
  cat: `<circle cx="260" cy="220" r="90"/>
    <path d="M200 150 L180 80 L220 130 M320 150 L340 80 L300 130"/>
    <ellipse cx="230" cy="210" rx="12" ry="16"/>
    <ellipse cx="290" cy="210" rx="12" ry="16"/>
    <path d="M240 250 Q260 260 280 250"/>`,
  umbrella: `<path d="M160 180 A100 100 0 0 1 360 180"/>
    <path d="M260 180 L260 330"/>
    <path d="M260 330 Q260 360 240 360 Q220 360 220 340"/>`,
  key: `<circle cx="200" cy="210" r="40"/>
    <path d="M240 210 L370 210"/>
    <path d="M330 210 L330 240 M350 210 L350 240 M370 210 L370 240"/>`,
  pizza: `<path d="M260 100 L160 320 L360 320 Z"/>
    <circle cx="245" cy="220" r="8"/><circle cx="280" cy="260" r="8"/><circle cx="240" cy="280" r="8"/>`,
  rocket: `<path d="M230 280 L230 160 Q230 100 260 80 Q290 100 290 160 L290 280 Z"/>
    <path d="M230 260 L200 300 L230 280"/><path d="M290 260 L320 300 L290 280"/>
    <path d="M240 280 Q250 330 260 340 Q270 330 280 280"/>
    <circle cx="260" cy="180" r="15"/>`,
  crown: `<path d="M170 260 L170 170 L210 220 L260 140 L310 220 L350 170 L350 260 Z"/>`,
  anchor: `<circle cx="260" cy="110" r="22"/>
    <path d="M260 132 L260 310"/><path d="M200 190 L320 190"/>
    <path d="M260 310 Q180 310 190 270"/><path d="M260 310 Q340 310 330 270"/>`,
  tree: `<rect x="245" y="250" width="30" height="100"/>
    <circle cx="260" cy="190" r="80"/>`,
  get flower() {
    let p = "";
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      p += `<circle cx="${260 + 38 * Math.cos(a)}" cy="${170 + 38 * Math.sin(a)}" r="22"/>`;
    }
    return p + `<circle cx="260" cy="170" r="16"/>
      <path d="M260 192 L260 340"/>
      <path d="M260 280 Q310 260 300 290"/>`;
  },
  get sun() {
    let rays = "";
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      rays += `<line x1="${260 + 62 * Math.cos(a)}" y1="${200 + 62 * Math.sin(a)}" x2="${260 + 95 * Math.cos(a)}" y2="${200 + 95 * Math.sin(a)}"/>`;
    }
    return `<circle cx="260" cy="200" r="50"/>${rays}`;
  },
  moon: `<path d="M290 100 C180 120 180 300 290 320 C230 280 230 140 290 100"/>`,
  mushroom: `<path d="M170 200 A90 90 0 0 1 350 200 L170 200"/>
    <path d="M230 200 L230 320 L290 320 L290 200"/>
    <circle cx="230" cy="160" r="12"/><circle cx="280" cy="145" r="12"/>`,
  heart: `<path d="M260 300 C260 260 170 230 170 180 C170 120 260 120 260 180 C260 120 350 120 350 180 C350 230 260 260 260 300"/>`,
  diamond: `<path d="M260 90 L360 200 L260 340 L160 200 Z"/>
    <path d="M160 200 L360 200"/>
    <path d="M260 90 L220 200 M260 90 L300 200"/>`,
  ghost: `<path d="M180 180 A80 80 0 0 1 340 180 L340 300 Q320 270 300 300 Q280 330 260 300 Q240 270 220 300 L180 300 Z"/>
    <circle cx="235" cy="185" r="10"/><circle cx="285" cy="185" r="10"/>
    <ellipse cx="260" cy="225" rx="10" ry="14"/>`,
  guitar: `<path d="M248 150 Q190 165 195 210 Q200 240 195 260 Q180 310 220 340 Q260 360 300 340 Q340 310 325 260 Q320 240 325 210 Q330 165 272 150"/>
    <path d="M248 150 L248 80 L272 80 L272 150"/>
    <rect x="244" y="60" width="32" height="22"/>
    <circle cx="260" cy="270" r="18"/>`,
  sailboat: `<path d="M150 260 L170 300 L350 300 L370 260"/>
    <path d="M260 260 L260 100"/>
    <path d="M260 110 L340 250 L260 250"/>
    <path d="M260 120 L210 220 L260 220"/>`,
  skull: `<circle cx="260" cy="180" r="80"/>
    <path d="M210 250 Q210 300 260 300 Q310 300 310 250"/>
    <ellipse cx="235" cy="175" rx="16" ry="20"/>
    <ellipse cx="285" cy="175" rx="16" ry="20"/>
    <path d="M255 215 L260 230 L265 215"/>
    <path d="M230 260 L290 260"/>
    <path d="M250 250 L250 270 M260 250 L260 270 M270 250 L270 270"/>`,
  icecream: `<path d="M210 210 L260 350 L310 210"/>
    <circle cx="260" cy="190" r="52"/>
    <circle cx="260" cy="130" r="40"/>`,
  pencil: `<rect x="240" y="100" width="40" height="200"/>
    <path d="M240 300 L260 340 L280 300"/>
    <rect x="240" y="80" width="40" height="20"/>`,
  cloud: `<circle cx="220" cy="220" r="45"/>
    <circle cx="270" cy="195" r="50"/>
    <circle cx="320" cy="220" r="40"/>
    <circle cx="270" cy="240" r="38"/>`,
  bird: `<ellipse cx="250" cy="220" rx="60" ry="40"/>
    <circle cx="320" cy="190" r="25"/>
    <path d="M345 185 L370 190 L345 198"/>
    <circle cx="330" cy="185" r="4"/>
    <path d="M190 210 L160 190 M190 220 L155 210"/>
    <ellipse cx="240" cy="210" rx="30" ry="15"/>`,
  snowman: `<circle cx="260" cy="300" r="60"/>
    <circle cx="260" cy="210" r="45"/>
    <circle cx="260" cy="140" r="30"/>
    <circle cx="250" cy="135" r="4"/><circle cx="270" cy="135" r="4"/>
    <path d="M260 142 L280 148 L260 150"/>
    <circle cx="260" cy="195" r="4"/><circle cx="260" cy="215" r="4"/><circle cx="260" cy="235" r="4"/>`,
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
