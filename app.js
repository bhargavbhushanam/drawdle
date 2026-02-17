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
const resultsModal = document.getElementById("resultsModal");
const resultsScoreBig = document.getElementById("resultsScoreBig");
const resultsPrompt = document.getElementById("resultsPrompt");
const resultsFeedback = document.getElementById("resultsFeedback");
const resultsGridVisual = document.getElementById("resultsGridVisual");
const resultsBadges = document.getElementById("resultsBadges");
const resultsShareBtn = document.getElementById("resultsShareBtn");
const resultsCopyBtn = document.getElementById("resultsCopyBtn");
const resultsDownloadBtn = document.getElementById("resultsDownloadBtn");
const closeResultsBtn = document.getElementById("closeResults");
const resultsUserCanvas = document.getElementById("resultsUserCanvas");
const resultsRefCanvas = document.getElementById("resultsRefCanvas");

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
  { key: "rocket", title: "Rocket Ship", hint: "3... 2... 1... Liftoff!" },
  { key: "octopus", title: "Octopus", hint: "Eight arms, zero worries." },
  { key: "pizza", title: "Pizza Slice", hint: "The perfect triangle." },
  { key: "dragon", title: "Dragon", hint: "Here be dragons." },
  { key: "penguin", title: "Penguin", hint: "Tuxedo required." },
  { key: "ufo", title: "UFO", hint: "We come in peace." },
  { key: "skull", title: "Skull", hint: "Spooky but cool." },
  { key: "palmtree", title: "Palm Tree", hint: "Island vibes." },
  { key: "robot", title: "Robot", hint: "Beep boop beep." },
  { key: "flamingo", title: "Flamingo", hint: "Tickled pink." },
  { key: "volcano", title: "Volcano", hint: "Lava have a good time." },
  { key: "sword", title: "Sword", hint: "En garde!" },
  { key: "mushroom", title: "Mushroom", hint: "Fun guy alert." },
  { key: "icecream", title: "Ice Cream Cone", hint: "Two scoops, no regrets." },
  { key: "castle", title: "Castle", hint: "Build your kingdom." },
  { key: "cat", title: "Cat", hint: "Purrfection." },
  { key: "anchor", title: "Anchor", hint: "Drop it like it's hot." },
  { key: "lightning", title: "Lightning Bolt", hint: "Shocking, really." },
  { key: "crown", title: "Crown", hint: "Royal vibes only." },
  { key: "ghost", title: "Ghost", hint: "Boo! Did I scare you?" },
  { key: "hotdog", title: "Hot Dog", hint: "The ultimate masterpiece." },
  { key: "dinosaur", title: "T-Rex", hint: "Tiny arms, big dreams." },
  { key: "sailboat", title: "Sailboat", hint: "Smooth sailing." },
  { key: "owl", title: "Owl", hint: "Who? Who?" },
  { key: "diamond", title: "Diamond", hint: "Shine bright." },
  { key: "butterfly", title: "Butterfly", hint: "Spread your wings." },
  { key: "guitar", title: "Guitar", hint: "Strum it." },
  { key: "jellyfish", title: "Jellyfish", hint: "Go with the flow." },
  { key: "sunflower", title: "Sunflower", hint: "Turn to the light." },
  { key: "pirateship", title: "Pirate Ship", hint: "Arrr matey!" },
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
    try { localStorage.setItem("drawdleLastDrawing", drawCanvas.toDataURL("image/png")); } catch (e) {}
    populateResultsModal(score, stats);
    openModal(resultsModal);
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
  populateResultsModal(stats.lastScore, stats);
  openModal(resultsModal);
}

// Shared prompt drawing functions — each draws into a 520×420 coordinate space
const promptDrawFns = {
  rocket(c) {
    // body
    c.beginPath(); c.moveTo(230, 320); c.lineTo(230, 140);
    c.quadraticCurveTo(230, 80, 260, 50);
    c.quadraticCurveTo(290, 80, 290, 140); c.lineTo(290, 320); c.stroke();
    // nose cone tip
    c.beginPath(); c.moveTo(260, 50); c.lineTo(250, 70); c.stroke();
    c.beginPath(); c.moveTo(260, 50); c.lineTo(270, 70); c.stroke();
    // left fin
    c.beginPath(); c.moveTo(230, 280); c.lineTo(190, 340);
    c.lineTo(230, 320); c.stroke();
    // right fin
    c.beginPath(); c.moveTo(290, 280); c.lineTo(330, 340);
    c.lineTo(290, 320); c.stroke();
    // window
    c.beginPath(); c.arc(260, 180, 22, 0, Math.PI * 2); c.stroke();
    // window inner
    c.beginPath(); c.arc(260, 180, 14, 0, Math.PI * 2); c.stroke();
    // body stripe
    c.beginPath(); c.moveTo(230, 250); c.lineTo(290, 250); c.stroke();
    c.beginPath(); c.moveTo(230, 265); c.lineTo(290, 265); c.stroke();
    // exhaust flames
    c.beginPath(); c.moveTo(240, 320); c.quadraticCurveTo(245, 360, 260, 390); c.stroke();
    c.beginPath(); c.moveTo(280, 320); c.quadraticCurveTo(275, 360, 260, 390); c.stroke();
    c.beginPath(); c.moveTo(250, 320); c.quadraticCurveTo(255, 350, 260, 370); c.stroke();
    c.beginPath(); c.moveTo(270, 320); c.quadraticCurveTo(265, 350, 260, 370); c.stroke();
    // stars
    c.beginPath(); c.arc(160, 100, 3, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(370, 150, 3, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(150, 250, 3, 0, Math.PI * 2); c.stroke();
  },
  octopus(c) {
    // head
    c.beginPath(); c.ellipse(260, 150, 80, 70, 0, 0, Math.PI * 2); c.stroke();
    // eyes
    c.beginPath(); c.arc(230, 140, 15, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(290, 140, 15, 0, Math.PI * 2); c.stroke();
    // pupils
    c.beginPath(); c.arc(233, 138, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(293, 138, 6, 0, Math.PI * 2); c.stroke();
    // mouth
    c.beginPath(); c.arc(260, 170, 10, 0.2, Math.PI - 0.2); c.stroke();
    // tentacle 1
    c.beginPath(); c.moveTo(195, 200); c.bezierCurveTo(150, 250, 120, 300, 140, 350);
    c.quadraticCurveTo(150, 370, 165, 355); c.stroke();
    // tentacle 2
    c.beginPath(); c.moveTo(210, 210); c.bezierCurveTo(180, 270, 160, 330, 190, 370);
    c.quadraticCurveTo(200, 385, 210, 370); c.stroke();
    // tentacle 3
    c.beginPath(); c.moveTo(235, 215); c.bezierCurveTo(220, 280, 210, 340, 230, 380);
    c.quadraticCurveTo(240, 395, 250, 380); c.stroke();
    // tentacle 4
    c.beginPath(); c.moveTo(255, 218); c.bezierCurveTo(250, 280, 245, 350, 265, 390);
    c.quadraticCurveTo(275, 400, 280, 385); c.stroke();
    // tentacle 5
    c.beginPath(); c.moveTo(275, 218); c.bezierCurveTo(285, 280, 295, 350, 305, 385);
    c.quadraticCurveTo(315, 400, 320, 380); c.stroke();
    // tentacle 6
    c.beginPath(); c.moveTo(295, 215); c.bezierCurveTo(320, 270, 340, 330, 330, 370);
    c.quadraticCurveTo(325, 385, 315, 365); c.stroke();
    // tentacle 7
    c.beginPath(); c.moveTo(310, 210); c.bezierCurveTo(340, 260, 370, 310, 365, 355);
    c.quadraticCurveTo(362, 375, 350, 355); c.stroke();
    // tentacle 8
    c.beginPath(); c.moveTo(325, 200); c.bezierCurveTo(370, 240, 400, 290, 385, 340);
    c.quadraticCurveTo(380, 360, 370, 340); c.stroke();
    // suction cups on tentacle 1
    c.beginPath(); c.arc(145, 310, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(138, 335, 4, 0, Math.PI * 2); c.stroke();
  },
  pizza(c) {
    // outer crust arc
    c.beginPath(); c.moveTo(140, 100); c.lineTo(260, 380); c.lineTo(380, 100); c.stroke();
    // crust top
    c.beginPath(); c.arc(260, 100, 120, Math.PI, 0); c.stroke();
    // inner crust line
    c.beginPath(); c.arc(260, 108, 108, Math.PI + 0.1, -0.1); c.stroke();
    // pepperoni 1
    c.beginPath(); c.arc(240, 180, 16, 0, Math.PI * 2); c.stroke();
    // pepperoni 2
    c.beginPath(); c.arc(290, 220, 14, 0, Math.PI * 2); c.stroke();
    // pepperoni 3
    c.beginPath(); c.arc(220, 260, 15, 0, Math.PI * 2); c.stroke();
    // pepperoni 4
    c.beginPath(); c.arc(270, 300, 13, 0, Math.PI * 2); c.stroke();
    // mushroom
    c.beginPath(); c.arc(310, 160, 12, Math.PI, 0); c.stroke();
    c.beginPath(); c.moveTo(304, 160); c.lineTo(306, 175); c.stroke();
    c.beginPath(); c.moveTo(316, 160); c.lineTo(314, 175); c.stroke();
    // olive
    c.beginPath(); c.arc(200, 190, 10, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(200, 190, 4, 0, Math.PI * 2); c.stroke();
    // cheese drip
    c.beginPath(); c.moveTo(260, 375); c.quadraticCurveTo(255, 395, 260, 400); c.stroke();
  },
  dragon(c) {
    // head
    c.beginPath(); c.ellipse(160, 130, 45, 35, -0.2, 0, Math.PI * 2); c.stroke();
    // snout
    c.beginPath(); c.moveTo(118, 120); c.lineTo(95, 115); c.lineTo(95, 135); c.lineTo(118, 138); c.stroke();
    // eye
    c.beginPath(); c.arc(150, 120, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(152, 119, 3, 0, Math.PI * 2); c.stroke();
    // horn left
    c.beginPath(); c.moveTo(150, 100); c.lineTo(135, 65); c.lineTo(155, 90); c.stroke();
    // horn right
    c.beginPath(); c.moveTo(175, 98); c.lineTo(185, 60); c.lineTo(180, 92); c.stroke();
    // nostril flame
    c.beginPath(); c.moveTo(95, 120); c.quadraticCurveTo(70, 110, 60, 125);
    c.quadraticCurveTo(55, 140, 75, 140); c.stroke();
    // neck
    c.beginPath(); c.moveTo(190, 150); c.quadraticCurveTo(220, 180, 240, 200); c.stroke();
    c.beginPath(); c.moveTo(175, 160); c.quadraticCurveTo(210, 195, 230, 215); c.stroke();
    // body
    c.beginPath(); c.moveTo(240, 200);
    c.bezierCurveTo(300, 190, 350, 210, 370, 250);
    c.quadraticCurveTo(385, 285, 370, 310); c.stroke();
    c.beginPath(); c.moveTo(230, 215);
    c.bezierCurveTo(280, 220, 340, 240, 360, 280);
    c.quadraticCurveTo(370, 310, 355, 325); c.stroke();
    // wing
    c.beginPath(); c.moveTo(270, 200); c.lineTo(310, 110); c.lineTo(360, 130);
    c.lineTo(400, 100); c.lineTo(380, 180); c.lineTo(350, 210); c.stroke();
    // wing membrane lines
    c.beginPath(); c.moveTo(310, 110); c.lineTo(330, 190); c.stroke();
    c.beginPath(); c.moveTo(360, 130); c.lineTo(360, 200); c.stroke();
    // belly
    c.beginPath(); c.moveTo(260, 225); c.lineTo(260, 255); c.stroke();
    c.beginPath(); c.moveTo(280, 230); c.lineTo(280, 265); c.stroke();
    c.beginPath(); c.moveTo(300, 235); c.lineTo(300, 275); c.stroke();
    // front leg
    c.beginPath(); c.moveTo(270, 250); c.lineTo(260, 320); c.lineTo(240, 330);
    c.moveTo(260, 320); c.lineTo(270, 335); c.stroke();
    // back leg
    c.beginPath(); c.moveTo(340, 280); c.lineTo(350, 340); c.lineTo(335, 350);
    c.moveTo(350, 340); c.lineTo(365, 350); c.stroke();
    // tail
    c.beginPath(); c.moveTo(370, 310);
    c.bezierCurveTo(390, 340, 420, 350, 440, 330);
    c.quadraticCurveTo(460, 310, 450, 295); c.stroke();
    // tail spike
    c.beginPath(); c.moveTo(450, 295); c.lineTo(465, 280); c.lineTo(445, 290); c.stroke();
    // neck spines
    c.beginPath(); c.moveTo(200, 160); c.lineTo(195, 148); c.stroke();
    c.beginPath(); c.moveTo(215, 175); c.lineTo(208, 163); c.stroke();
  },
  penguin(c) {
    // body
    c.beginPath(); c.ellipse(260, 250, 70, 110, 0, 0, Math.PI * 2); c.stroke();
    // belly
    c.beginPath(); c.ellipse(260, 265, 45, 85, 0, 0, Math.PI * 2); c.stroke();
    // head
    c.beginPath(); c.arc(260, 140, 45, 0, Math.PI * 2); c.stroke();
    // left eye
    c.beginPath(); c.arc(242, 132, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(244, 131, 3, 0, Math.PI * 2); c.stroke();
    // right eye
    c.beginPath(); c.arc(278, 132, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(280, 131, 3, 0, Math.PI * 2); c.stroke();
    // beak
    c.beginPath(); c.moveTo(252, 148); c.lineTo(260, 168); c.lineTo(268, 148); c.stroke();
    // left wing
    c.beginPath(); c.moveTo(192, 200);
    c.quadraticCurveTo(155, 260, 170, 320); c.stroke();
    // right wing
    c.beginPath(); c.moveTo(328, 200);
    c.quadraticCurveTo(365, 260, 350, 320); c.stroke();
    // left foot
    c.beginPath(); c.moveTo(230, 355); c.lineTo(210, 375); c.lineTo(240, 375); c.lineTo(250, 358); c.stroke();
    // right foot
    c.beginPath(); c.moveTo(290, 355); c.lineTo(280, 375); c.lineTo(310, 375); c.lineTo(290, 358); c.stroke();
    // bow tie
    c.beginPath(); c.moveTo(260, 185); c.lineTo(245, 175); c.lineTo(245, 195);
    c.lineTo(260, 185); c.lineTo(275, 175); c.lineTo(275, 195); c.closePath(); c.stroke();
  },
  ufo(c) {
    // dome
    c.beginPath(); c.arc(260, 190, 60, Math.PI, 0); c.stroke();
    // dome inner
    c.beginPath(); c.arc(260, 190, 45, Math.PI + 0.2, -0.2); c.stroke();
    // main saucer body
    c.beginPath(); c.ellipse(260, 200, 140, 35, 0, 0, Math.PI * 2); c.stroke();
    // bottom rim
    c.beginPath(); c.ellipse(260, 210, 120, 25, 0, 0.1, Math.PI - 0.1); c.stroke();
    // windows on dome
    c.beginPath(); c.arc(230, 175, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 170, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(290, 175, 8, 0, Math.PI * 2); c.stroke();
    // lights on rim
    c.beginPath(); c.arc(170, 200, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(215, 207, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 210, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(305, 207, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(350, 200, 6, 0, Math.PI * 2); c.stroke();
    // beam
    c.beginPath(); c.moveTo(220, 230); c.lineTo(180, 380); c.stroke();
    c.beginPath(); c.moveTo(300, 230); c.lineTo(340, 380); c.stroke();
    // beam bottom
    c.beginPath(); c.moveTo(180, 380); c.lineTo(340, 380); c.stroke();
    // beam lines
    c.beginPath(); c.moveTo(235, 260); c.lineTo(285, 260); c.stroke();
    c.beginPath(); c.moveTo(215, 320); c.lineTo(305, 320); c.stroke();
    // antenna
    c.beginPath(); c.moveTo(260, 130); c.lineTo(260, 110); c.stroke();
    c.beginPath(); c.arc(260, 106, 5, 0, Math.PI * 2); c.stroke();
  },
  skull(c) {
    // cranium
    c.beginPath(); c.arc(260, 180, 90, Math.PI, 0); c.stroke();
    // sides of skull
    c.beginPath(); c.moveTo(170, 180); c.lineTo(170, 240);
    c.quadraticCurveTo(170, 270, 190, 280); c.stroke();
    c.beginPath(); c.moveTo(350, 180); c.lineTo(350, 240);
    c.quadraticCurveTo(350, 270, 330, 280); c.stroke();
    // cheekbones
    c.beginPath(); c.moveTo(190, 280); c.lineTo(195, 270); c.lineTo(220, 280); c.stroke();
    c.beginPath(); c.moveTo(330, 280); c.lineTo(325, 270); c.lineTo(300, 280); c.stroke();
    // jaw
    c.beginPath(); c.moveTo(220, 280); c.lineTo(210, 310);
    c.quadraticCurveTo(210, 340, 230, 340); c.lineTo(290, 340);
    c.quadraticCurveTo(310, 340, 310, 310); c.lineTo(300, 280); c.stroke();
    // left eye socket
    c.beginPath(); c.ellipse(225, 200, 28, 30, 0, 0, Math.PI * 2); c.stroke();
    // right eye socket
    c.beginPath(); c.ellipse(295, 200, 28, 30, 0, 0, Math.PI * 2); c.stroke();
    // nose
    c.beginPath(); c.moveTo(252, 240); c.lineTo(248, 265); c.lineTo(260, 270); c.lineTo(272, 265); c.lineTo(268, 240); c.stroke();
    // teeth
    c.beginPath(); c.moveTo(220, 300); c.lineTo(300, 300); c.stroke();
    c.beginPath(); c.moveTo(235, 300); c.lineTo(235, 340); c.stroke();
    c.beginPath(); c.moveTo(252, 300); c.lineTo(252, 340); c.stroke();
    c.beginPath(); c.moveTo(268, 300); c.lineTo(268, 340); c.stroke();
    c.beginPath(); c.moveTo(285, 300); c.lineTo(285, 340); c.stroke();
    // temple detail
    c.beginPath(); c.moveTo(175, 160); c.quadraticCurveTo(180, 170, 178, 185); c.stroke();
    c.beginPath(); c.moveTo(345, 160); c.quadraticCurveTo(340, 170, 342, 185); c.stroke();
  },
  palmtree(c) {
    // trunk
    c.beginPath(); c.moveTo(245, 390); c.quadraticCurveTo(240, 300, 255, 200);
    c.quadraticCurveTo(265, 160, 260, 140); c.stroke();
    c.beginPath(); c.moveTo(275, 390); c.quadraticCurveTo(270, 300, 275, 200);
    c.quadraticCurveTo(280, 160, 270, 140); c.stroke();
    // trunk segments
    c.beginPath(); c.moveTo(247, 350); c.lineTo(273, 350); c.stroke();
    c.beginPath(); c.moveTo(248, 310); c.lineTo(274, 310); c.stroke();
    c.beginPath(); c.moveTo(252, 270); c.lineTo(276, 270); c.stroke();
    c.beginPath(); c.moveTo(256, 230); c.lineTo(276, 230); c.stroke();
    c.beginPath(); c.moveTo(259, 195); c.lineTo(275, 195); c.stroke();
    // frond 1 (right)
    c.beginPath(); c.moveTo(265, 140);
    c.bezierCurveTo(320, 110, 390, 100, 430, 130); c.stroke();
    c.beginPath(); c.moveTo(330, 105); c.lineTo(340, 120); c.stroke();
    c.beginPath(); c.moveTo(370, 100); c.lineTo(375, 118); c.stroke();
    c.beginPath(); c.moveTo(405, 108); c.lineTo(405, 126); c.stroke();
    // frond 2 (left)
    c.beginPath(); c.moveTo(265, 140);
    c.bezierCurveTo(200, 110, 130, 105, 90, 140); c.stroke();
    c.beginPath(); c.moveTo(190, 108); c.lineTo(185, 125); c.stroke();
    c.beginPath(); c.moveTo(150, 105); c.lineTo(148, 122); c.stroke();
    c.beginPath(); c.moveTo(115, 115); c.lineTo(115, 132); c.stroke();
    // frond 3 (right drooping)
    c.beginPath(); c.moveTo(265, 140);
    c.bezierCurveTo(310, 140, 380, 160, 410, 200); c.stroke();
    c.beginPath(); c.moveTo(340, 148); c.lineTo(345, 165); c.stroke();
    c.beginPath(); c.moveTo(375, 162); c.lineTo(378, 180); c.stroke();
    // frond 4 (left drooping)
    c.beginPath(); c.moveTo(265, 140);
    c.bezierCurveTo(220, 140, 150, 165, 120, 205); c.stroke();
    c.beginPath(); c.moveTo(180, 155); c.lineTo(177, 172); c.stroke();
    c.beginPath(); c.moveTo(145, 172); c.lineTo(143, 190); c.stroke();
    // coconuts
    c.beginPath(); c.arc(255, 150, 10, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(275, 148, 10, 0, Math.PI * 2); c.stroke();
  },
  robot(c) {
    // head
    c.beginPath(); c.rect(210, 80, 100, 80); c.stroke();
    // antenna
    c.beginPath(); c.moveTo(260, 80); c.lineTo(260, 55); c.stroke();
    c.beginPath(); c.arc(260, 48, 7, 0, Math.PI * 2); c.stroke();
    // eyes
    c.beginPath(); c.rect(228, 105, 20, 20); c.stroke();
    c.beginPath(); c.rect(272, 105, 20, 20); c.stroke();
    // pupils
    c.beginPath(); c.arc(238, 115, 5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(282, 115, 5, 0, Math.PI * 2); c.stroke();
    // mouth
    c.beginPath(); c.moveTo(235, 140); c.lineTo(285, 140); c.stroke();
    c.beginPath(); c.moveTo(245, 140); c.lineTo(245, 148); c.stroke();
    c.beginPath(); c.moveTo(260, 140); c.lineTo(260, 148); c.stroke();
    c.beginPath(); c.moveTo(275, 140); c.lineTo(275, 148); c.stroke();
    // neck
    c.beginPath(); c.moveTo(245, 160); c.lineTo(245, 180); c.lineTo(275, 180); c.lineTo(275, 160); c.stroke();
    // body
    c.beginPath(); c.rect(195, 180, 130, 130); c.stroke();
    // chest panel
    c.beginPath(); c.rect(220, 200, 80, 60); c.stroke();
    // chest buttons
    c.beginPath(); c.arc(240, 220, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(270, 220, 8, 0, Math.PI * 2); c.stroke();
    // chest meter
    c.beginPath(); c.moveTo(230, 245); c.lineTo(290, 245); c.stroke();
    c.beginPath(); c.moveTo(260, 240); c.lineTo(260, 250); c.stroke();
    // left arm
    c.beginPath(); c.moveTo(195, 195); c.lineTo(155, 195); c.lineTo(155, 280); c.lineTo(175, 280); c.lineTo(175, 210); c.lineTo(195, 210); c.stroke();
    // left claw
    c.beginPath(); c.moveTo(145, 280); c.lineTo(145, 300); c.stroke();
    c.beginPath(); c.moveTo(175, 280); c.lineTo(175, 300); c.stroke();
    // right arm
    c.beginPath(); c.moveTo(325, 195); c.lineTo(365, 195); c.lineTo(365, 280); c.lineTo(345, 280); c.lineTo(345, 210); c.lineTo(325, 210); c.stroke();
    // right claw
    c.beginPath(); c.moveTo(345, 280); c.lineTo(345, 300); c.stroke();
    c.beginPath(); c.moveTo(375, 280); c.lineTo(375, 300); c.stroke();
    // left leg
    c.beginPath(); c.moveTo(220, 310); c.lineTo(220, 370); c.lineTo(200, 370); c.lineTo(200, 380); c.lineTo(245, 380); c.lineTo(245, 370); c.lineTo(240, 370); c.lineTo(240, 310); c.stroke();
    // right leg
    c.beginPath(); c.moveTo(280, 310); c.lineTo(280, 370); c.lineTo(275, 370); c.lineTo(275, 380); c.lineTo(320, 380); c.lineTo(320, 370); c.lineTo(300, 370); c.lineTo(300, 310); c.stroke();
    // bolt on head
    c.beginPath(); c.moveTo(205, 115); c.lineTo(215, 115); c.stroke();
    c.beginPath(); c.moveTo(210, 110); c.lineTo(210, 120); c.stroke();
  },
  flamingo(c) {
    // body
    c.beginPath(); c.ellipse(280, 240, 60, 40, 0.3, 0, Math.PI * 2); c.stroke();
    // tail feathers
    c.beginPath(); c.moveTo(335, 225); c.quadraticCurveTo(370, 210, 380, 220); c.stroke();
    c.beginPath(); c.moveTo(335, 235); c.quadraticCurveTo(375, 225, 385, 235); c.stroke();
    // neck
    c.beginPath(); c.moveTo(235, 215);
    c.bezierCurveTo(210, 190, 190, 150, 195, 110);
    c.quadraticCurveTo(198, 85, 215, 80); c.stroke();
    c.beginPath(); c.moveTo(245, 220);
    c.bezierCurveTo(225, 195, 210, 155, 215, 115);
    c.quadraticCurveTo(218, 92, 230, 87); c.stroke();
    // head
    c.beginPath(); c.arc(222, 78, 18, 0, Math.PI * 2); c.stroke();
    // eye
    c.beginPath(); c.arc(215, 74, 4, 0, Math.PI * 2); c.stroke();
    // beak
    c.beginPath(); c.moveTo(206, 82); c.lineTo(178, 90); c.lineTo(178, 85);
    c.lineTo(200, 78); c.stroke();
    // beak bend
    c.beginPath(); c.moveTo(178, 85); c.quadraticCurveTo(172, 88, 170, 92); c.stroke();
    // front leg
    c.beginPath(); c.moveTo(270, 275); c.lineTo(265, 340);
    c.quadraticCurveTo(260, 355, 265, 360); c.stroke();
    c.beginPath(); c.moveTo(255, 360); c.lineTo(280, 360); c.stroke();
    // back leg (bent)
    c.beginPath(); c.moveTo(290, 275); c.lineTo(300, 320);
    c.lineTo(290, 360); c.stroke();
    c.beginPath(); c.moveTo(280, 360); c.lineTo(305, 360); c.stroke();
    // wing detail
    c.beginPath(); c.moveTo(250, 225); c.quadraticCurveTo(280, 215, 320, 225); c.stroke();
    c.beginPath(); c.moveTo(255, 235); c.quadraticCurveTo(285, 228, 325, 238); c.stroke();
  },
  volcano(c) {
    // mountain left slope
    c.beginPath(); c.moveTo(60, 370); c.lineTo(200, 140); c.stroke();
    // mountain right slope
    c.beginPath(); c.moveTo(460, 370); c.lineTo(320, 140); c.stroke();
    // crater rim
    c.beginPath(); c.moveTo(200, 140); c.quadraticCurveTo(260, 160, 320, 140); c.stroke();
    // ground line
    c.beginPath(); c.moveTo(40, 370); c.lineTo(480, 370); c.stroke();
    // lava flow left
    c.beginPath(); c.moveTo(230, 145);
    c.bezierCurveTo(220, 180, 200, 220, 180, 270);
    c.quadraticCurveTo(170, 300, 175, 320); c.stroke();
    // lava flow right
    c.beginPath(); c.moveTo(280, 148);
    c.bezierCurveTo(290, 190, 310, 240, 320, 290);
    c.quadraticCurveTo(325, 320, 320, 340); c.stroke();
    // eruption rocks
    c.beginPath(); c.arc(240, 90, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(275, 70, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(300, 95, 7, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(220, 60, 5, 0, Math.PI * 2); c.stroke();
    // smoke clouds
    c.beginPath(); c.arc(250, 45, 18, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(275, 35, 22, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(300, 50, 16, 0, Math.PI * 2); c.stroke();
    // mountain texture lines
    c.beginPath(); c.moveTo(140, 280); c.lineTo(165, 280); c.stroke();
    c.beginPath(); c.moveTo(350, 290); c.lineTo(380, 290); c.stroke();
    c.beginPath(); c.moveTo(120, 330); c.lineTo(155, 330); c.stroke();
    c.beginPath(); c.moveTo(370, 340); c.lineTo(400, 340); c.stroke();
  },
  sword(c) {
    // blade
    c.beginPath(); c.moveTo(260, 60); c.lineTo(245, 240); c.stroke();
    c.beginPath(); c.moveTo(260, 60); c.lineTo(275, 240); c.stroke();
    // blade tip
    c.beginPath(); c.moveTo(260, 60); c.lineTo(260, 45); c.stroke();
    // blade center line
    c.beginPath(); c.moveTo(260, 70); c.lineTo(260, 235); c.stroke();
    // cross guard
    c.beginPath(); c.moveTo(200, 240); c.lineTo(320, 240); c.stroke();
    c.beginPath(); c.moveTo(200, 240); c.quadraticCurveTo(195, 250, 200, 255); c.stroke();
    c.beginPath(); c.moveTo(320, 240); c.quadraticCurveTo(325, 250, 320, 255); c.stroke();
    c.beginPath(); c.moveTo(200, 255); c.lineTo(320, 255); c.stroke();
    // grip
    c.beginPath(); c.moveTo(248, 255); c.lineTo(248, 340); c.stroke();
    c.beginPath(); c.moveTo(272, 255); c.lineTo(272, 340); c.stroke();
    // grip wrapping
    c.beginPath(); c.moveTo(248, 275); c.lineTo(272, 285); c.stroke();
    c.beginPath(); c.moveTo(248, 295); c.lineTo(272, 305); c.stroke();
    c.beginPath(); c.moveTo(248, 315); c.lineTo(272, 325); c.stroke();
    // pommel
    c.beginPath(); c.arc(260, 350, 15, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 350, 6, 0, Math.PI * 2); c.stroke();
    // blade shine
    c.beginPath(); c.moveTo(252, 100); c.lineTo(250, 150); c.stroke();
  },
  mushroom(c) {
    // cap
    c.beginPath(); c.arc(260, 190, 100, Math.PI, 0); c.stroke();
    // cap underside
    c.beginPath(); c.moveTo(160, 190); c.quadraticCurveTo(260, 220, 360, 190); c.stroke();
    // stem
    c.beginPath(); c.moveTo(225, 200); c.quadraticCurveTo(220, 300, 225, 370); c.stroke();
    c.beginPath(); c.moveTo(295, 200); c.quadraticCurveTo(300, 300, 295, 370); c.stroke();
    // stem base
    c.beginPath(); c.moveTo(225, 370); c.quadraticCurveTo(210, 380, 210, 390); c.stroke();
    c.beginPath(); c.moveTo(295, 370); c.quadraticCurveTo(310, 380, 310, 390); c.stroke();
    c.beginPath(); c.moveTo(210, 390); c.lineTo(310, 390); c.stroke();
    // cap spots
    c.beginPath(); c.arc(220, 150, 18, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(300, 145, 15, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 120, 20, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(190, 170, 12, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(330, 168, 13, 0, Math.PI * 2); c.stroke();
    // gills under cap
    c.beginPath(); c.moveTo(240, 198); c.lineTo(240, 210); c.stroke();
    c.beginPath(); c.moveTo(260, 200); c.lineTo(260, 215); c.stroke();
    c.beginPath(); c.moveTo(280, 198); c.lineTo(280, 210); c.stroke();
  },
  icecream(c) {
    // cone
    c.beginPath(); c.moveTo(210, 230); c.lineTo(260, 390); c.lineTo(310, 230); c.stroke();
    // cone cross pattern
    c.beginPath(); c.moveTo(220, 245); c.lineTo(280, 335); c.stroke();
    c.beginPath(); c.moveTo(240, 240); c.lineTo(290, 310); c.stroke();
    c.beginPath(); c.moveTo(300, 245); c.lineTo(240, 335); c.stroke();
    c.beginPath(); c.moveTo(280, 240); c.lineTo(230, 310); c.stroke();
    // bottom scoop
    c.beginPath(); c.arc(260, 200, 55, 0, Math.PI * 2); c.stroke();
    // top scoop
    c.beginPath(); c.arc(260, 130, 50, 0, Math.PI * 2); c.stroke();
    // cherry
    c.beginPath(); c.arc(260, 75, 14, 0, Math.PI * 2); c.stroke();
    // cherry stem
    c.beginPath(); c.moveTo(260, 61); c.quadraticCurveTo(270, 45, 265, 38); c.stroke();
    // drip left
    c.beginPath(); c.moveTo(215, 195); c.quadraticCurveTo(210, 215, 215, 225); c.stroke();
    // drip right
    c.beginPath(); c.moveTo(305, 195); c.quadraticCurveTo(310, 215, 305, 225); c.stroke();
    // scoop texture
    c.beginPath(); c.arc(240, 195, 5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(280, 200, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(250, 125, 5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(275, 135, 4, 0, Math.PI * 2); c.stroke();
  },
  castle(c) {
    // main wall
    c.beginPath(); c.rect(160, 180, 200, 200); c.stroke();
    // left tower
    c.beginPath(); c.rect(130, 120, 60, 260); c.stroke();
    // right tower
    c.beginPath(); c.rect(330, 120, 60, 260); c.stroke();
    // left tower battlement
    c.beginPath(); c.moveTo(125, 120); c.lineTo(125, 100); c.lineTo(142, 100); c.lineTo(142, 120); c.stroke();
    c.beginPath(); c.moveTo(152, 120); c.lineTo(152, 100); c.lineTo(168, 100); c.lineTo(168, 120); c.stroke();
    c.beginPath(); c.moveTo(178, 120); c.lineTo(178, 100); c.lineTo(195, 100); c.lineTo(195, 120); c.stroke();
    // right tower battlement
    c.beginPath(); c.moveTo(325, 120); c.lineTo(325, 100); c.lineTo(342, 100); c.lineTo(342, 120); c.stroke();
    c.beginPath(); c.moveTo(352, 120); c.lineTo(352, 100); c.lineTo(368, 100); c.lineTo(368, 120); c.stroke();
    c.beginPath(); c.moveTo(378, 120); c.lineTo(378, 100); c.lineTo(395, 100); c.lineTo(395, 120); c.stroke();
    // center battlements
    c.beginPath(); c.moveTo(175, 180); c.lineTo(175, 162); c.lineTo(195, 162); c.lineTo(195, 180); c.stroke();
    c.beginPath(); c.moveTo(210, 180); c.lineTo(210, 162); c.lineTo(230, 162); c.lineTo(230, 180); c.stroke();
    c.beginPath(); c.moveTo(245, 180); c.lineTo(245, 162); c.lineTo(265, 162); c.lineTo(265, 180); c.stroke();
    c.beginPath(); c.moveTo(280, 180); c.lineTo(280, 162); c.lineTo(300, 162); c.lineTo(300, 180); c.stroke();
    c.beginPath(); c.moveTo(315, 180); c.lineTo(315, 162); c.lineTo(335, 162); c.lineTo(335, 180); c.stroke();
    // gate
    c.beginPath(); c.moveTo(230, 380); c.lineTo(230, 310);
    c.arc(260, 310, 30, Math.PI, 0); c.lineTo(290, 380); c.stroke();
    // gate bars
    c.beginPath(); c.moveTo(250, 310); c.lineTo(250, 380); c.stroke();
    c.beginPath(); c.moveTo(270, 310); c.lineTo(270, 380); c.stroke();
    // tower windows
    c.beginPath(); c.arc(160, 200, 12, Math.PI, 0); c.lineTo(172, 225); c.lineTo(148, 225); c.closePath(); c.stroke();
    c.beginPath(); c.arc(360, 200, 12, Math.PI, 0); c.lineTo(372, 225); c.lineTo(348, 225); c.closePath(); c.stroke();
    // flag
    c.beginPath(); c.moveTo(260, 162); c.lineTo(260, 125); c.stroke();
    c.beginPath(); c.moveTo(260, 125); c.lineTo(285, 135); c.lineTo(260, 145); c.stroke();
  },
  cat(c) {
    // head
    c.beginPath(); c.arc(260, 160, 60, 0, Math.PI * 2); c.stroke();
    // left ear
    c.beginPath(); c.moveTo(215, 115); c.lineTo(200, 70); c.lineTo(235, 100); c.stroke();
    // right ear
    c.beginPath(); c.moveTo(305, 115); c.lineTo(320, 70); c.lineTo(285, 100); c.stroke();
    // inner ear left
    c.beginPath(); c.moveTo(218, 110); c.lineTo(210, 82); c.lineTo(230, 103); c.stroke();
    // inner ear right
    c.beginPath(); c.moveTo(302, 110); c.lineTo(310, 82); c.lineTo(290, 103); c.stroke();
    // left eye
    c.beginPath(); c.ellipse(238, 150, 12, 14, 0, 0, Math.PI * 2); c.stroke();
    // right eye
    c.beginPath(); c.ellipse(282, 150, 12, 14, 0, 0, Math.PI * 2); c.stroke();
    // pupils (slits)
    c.beginPath(); c.moveTo(238, 142); c.lineTo(238, 158); c.stroke();
    c.beginPath(); c.moveTo(282, 142); c.lineTo(282, 158); c.stroke();
    // nose
    c.beginPath(); c.moveTo(254, 172); c.lineTo(260, 180); c.lineTo(266, 172); c.closePath(); c.stroke();
    // mouth
    c.beginPath(); c.moveTo(260, 180); c.lineTo(260, 188); c.stroke();
    c.beginPath(); c.moveTo(260, 188); c.quadraticCurveTo(248, 195, 242, 188); c.stroke();
    c.beginPath(); c.moveTo(260, 188); c.quadraticCurveTo(272, 195, 278, 188); c.stroke();
    // whiskers left
    c.beginPath(); c.moveTo(220, 170); c.lineTo(175, 162); c.stroke();
    c.beginPath(); c.moveTo(220, 177); c.lineTo(175, 177); c.stroke();
    c.beginPath(); c.moveTo(220, 184); c.lineTo(175, 192); c.stroke();
    // whiskers right
    c.beginPath(); c.moveTo(300, 170); c.lineTo(345, 162); c.stroke();
    c.beginPath(); c.moveTo(300, 177); c.lineTo(345, 177); c.stroke();
    c.beginPath(); c.moveTo(300, 184); c.lineTo(345, 192); c.stroke();
    // body
    c.beginPath(); c.ellipse(260, 290, 55, 70, 0, 0, Math.PI * 2); c.stroke();
    // front paws
    c.beginPath(); c.arc(230, 355, 15, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(290, 355, 15, 0, Math.PI * 2); c.stroke();
    // tail
    c.beginPath(); c.moveTo(310, 300);
    c.bezierCurveTo(360, 290, 390, 260, 380, 230);
    c.quadraticCurveTo(375, 215, 365, 220); c.stroke();
  },
  anchor(c) {
    // ring at top
    c.beginPath(); c.arc(260, 85, 25, 0, Math.PI * 2); c.stroke();
    // vertical shaft
    c.beginPath(); c.moveTo(260, 110); c.lineTo(260, 340); c.stroke();
    // cross bar
    c.beginPath(); c.moveTo(200, 160); c.lineTo(320, 160); c.stroke();
    // left fluke
    c.beginPath(); c.moveTo(260, 340);
    c.quadraticCurveTo(180, 340, 150, 290);
    c.quadraticCurveTo(140, 270, 155, 260); c.stroke();
    // left fluke tip
    c.beginPath(); c.moveTo(155, 260); c.lineTo(145, 252); c.lineTo(148, 268); c.stroke();
    // right fluke
    c.beginPath(); c.moveTo(260, 340);
    c.quadraticCurveTo(340, 340, 370, 290);
    c.quadraticCurveTo(380, 270, 365, 260); c.stroke();
    // right fluke tip
    c.beginPath(); c.moveTo(365, 260); c.lineTo(375, 252); c.lineTo(372, 268); c.stroke();
    // shaft detail
    c.beginPath(); c.moveTo(255, 140); c.lineTo(265, 140); c.stroke();
    c.beginPath(); c.moveTo(255, 200); c.lineTo(265, 200); c.stroke();
    c.beginPath(); c.moveTo(255, 260); c.lineTo(265, 260); c.stroke();
    // rope on ring
    c.beginPath(); c.moveTo(245, 65); c.quadraticCurveTo(230, 55, 235, 45); c.stroke();
  },
  lightning(c) {
    // main bolt
    c.beginPath(); c.moveTo(280, 50); c.lineTo(220, 190); c.lineTo(270, 190);
    c.lineTo(210, 370); c.stroke();
    // right edge
    c.beginPath(); c.moveTo(320, 50); c.lineTo(260, 190); c.lineTo(310, 190);
    c.lineTo(250, 370); c.stroke();
    // top connection
    c.beginPath(); c.moveTo(280, 50); c.lineTo(320, 50); c.stroke();
    // bottom connection
    c.beginPath(); c.moveTo(210, 370); c.lineTo(250, 370); c.stroke();
    // middle connections
    c.beginPath(); c.moveTo(220, 190); c.lineTo(260, 190); c.stroke();
    c.beginPath(); c.moveTo(270, 190); c.lineTo(310, 190); c.stroke();
    // spark details
    c.beginPath(); c.moveTo(190, 160); c.lineTo(175, 155); c.stroke();
    c.beginPath(); c.moveTo(185, 175); c.lineTo(170, 175); c.stroke();
    c.beginPath(); c.moveTo(340, 170); c.lineTo(355, 165); c.stroke();
    c.beginPath(); c.moveTo(335, 185); c.lineTo(350, 185); c.stroke();
    // glow lines
    c.beginPath(); c.moveTo(170, 260); c.lineTo(155, 255); c.stroke();
    c.beginPath(); c.moveTo(330, 280); c.lineTo(345, 275); c.stroke();
  },
  crown(c) {
    // base
    c.beginPath(); c.moveTo(140, 280); c.lineTo(380, 280); c.stroke();
    c.beginPath(); c.moveTo(140, 300); c.lineTo(380, 300); c.stroke();
    c.beginPath(); c.moveTo(140, 280); c.lineTo(140, 300); c.stroke();
    c.beginPath(); c.moveTo(380, 280); c.lineTo(380, 300); c.stroke();
    // crown body
    c.beginPath(); c.moveTo(140, 280); c.lineTo(150, 140);
    c.lineTo(200, 210); c.lineTo(260, 110); c.lineTo(320, 210);
    c.lineTo(370, 140); c.lineTo(380, 280); c.stroke();
    // jewels on points
    c.beginPath(); c.arc(150, 135, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 105, 10, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(370, 135, 8, 0, Math.PI * 2); c.stroke();
    // jewels on band
    c.beginPath(); c.arc(200, 285, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 285, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(320, 285, 6, 0, Math.PI * 2); c.stroke();
    // cross-hatch on body
    c.beginPath(); c.moveTo(165, 240); c.lineTo(175, 200); c.stroke();
    c.beginPath(); c.moveTo(200, 250); c.lineTo(220, 200); c.stroke();
    c.beginPath(); c.moveTo(300, 250); c.lineTo(320, 200); c.stroke();
    c.beginPath(); c.moveTo(355, 240); c.lineTo(345, 200); c.stroke();
  },
  ghost(c) {
    // head/body top
    c.beginPath(); c.arc(260, 170, 80, Math.PI, 0); c.stroke();
    // left side
    c.beginPath(); c.moveTo(180, 170); c.lineTo(180, 340); c.stroke();
    // right side
    c.beginPath(); c.moveTo(340, 170); c.lineTo(340, 340); c.stroke();
    // wavy bottom
    c.beginPath(); c.moveTo(180, 340);
    c.quadraticCurveTo(200, 310, 220, 340);
    c.quadraticCurveTo(240, 370, 260, 340);
    c.quadraticCurveTo(280, 310, 300, 340);
    c.quadraticCurveTo(320, 370, 340, 340); c.stroke();
    // left eye
    c.beginPath(); c.ellipse(230, 180, 18, 22, 0, 0, Math.PI * 2); c.stroke();
    // right eye
    c.beginPath(); c.ellipse(290, 180, 18, 22, 0, 0, Math.PI * 2); c.stroke();
    // left pupil
    c.beginPath(); c.arc(233, 184, 7, 0, Math.PI * 2); c.stroke();
    // right pupil
    c.beginPath(); c.arc(293, 184, 7, 0, Math.PI * 2); c.stroke();
    // mouth
    c.beginPath(); c.ellipse(260, 240, 18, 14, 0, 0, Math.PI * 2); c.stroke();
    // arms
    c.beginPath(); c.moveTo(180, 230); c.quadraticCurveTo(145, 240, 140, 260); c.stroke();
    c.beginPath(); c.moveTo(340, 230); c.quadraticCurveTo(375, 240, 380, 260); c.stroke();
  },
  hotdog(c) {
    // bun top
    c.beginPath(); c.moveTo(100, 210);
    c.quadraticCurveTo(95, 180, 130, 170);
    c.lineTo(390, 170);
    c.quadraticCurveTo(425, 180, 420, 210); c.stroke();
    // bun bottom
    c.beginPath(); c.moveTo(100, 230);
    c.quadraticCurveTo(95, 260, 130, 270);
    c.lineTo(390, 270);
    c.quadraticCurveTo(425, 260, 420, 230); c.stroke();
    // sausage visible top
    c.beginPath(); c.moveTo(110, 210);
    c.lineTo(410, 210); c.stroke();
    // sausage visible bottom
    c.beginPath(); c.moveTo(110, 230);
    c.lineTo(410, 230); c.stroke();
    // sausage ends
    c.beginPath(); c.arc(115, 220, 12, Math.PI * 0.5, Math.PI * 1.5); c.stroke();
    c.beginPath(); c.arc(405, 220, 12, -Math.PI * 0.5, Math.PI * 0.5); c.stroke();
    // mustard zigzag
    c.beginPath(); c.moveTo(130, 215);
    c.lineTo(155, 225); c.lineTo(180, 215); c.lineTo(205, 225);
    c.lineTo(230, 215); c.lineTo(255, 225); c.lineTo(280, 215);
    c.lineTo(305, 225); c.lineTo(330, 215); c.lineTo(355, 225);
    c.lineTo(380, 215); c.stroke();
    // bun texture
    c.beginPath(); c.moveTo(150, 185); c.lineTo(180, 185); c.stroke();
    c.beginPath(); c.moveTo(250, 182); c.lineTo(280, 182); c.stroke();
    c.beginPath(); c.moveTo(340, 185); c.lineTo(370, 185); c.stroke();
    // sesame seeds
    c.beginPath(); c.ellipse(200, 180, 6, 3, 0.3, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.ellipse(310, 178, 6, 3, -0.2, 0, Math.PI * 2); c.stroke();
  },
  dinosaur(c) {
    // head
    c.beginPath(); c.moveTo(310, 100); c.lineTo(390, 100); c.lineTo(400, 110);
    c.lineTo(400, 140); c.lineTo(310, 140);
    c.quadraticCurveTo(295, 120, 310, 100); c.stroke();
    // eye
    c.beginPath(); c.arc(340, 115, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(342, 114, 3, 0, Math.PI * 2); c.stroke();
    // nostril
    c.beginPath(); c.arc(385, 110, 4, 0, Math.PI * 2); c.stroke();
    // mouth
    c.beginPath(); c.moveTo(310, 140); c.lineTo(400, 140); c.stroke();
    // teeth
    c.beginPath(); c.moveTo(340, 140); c.lineTo(345, 148); c.lineTo(350, 140); c.stroke();
    c.beginPath(); c.moveTo(360, 140); c.lineTo(365, 148); c.lineTo(370, 140); c.stroke();
    c.beginPath(); c.moveTo(380, 140); c.lineTo(385, 148); c.lineTo(390, 140); c.stroke();
    // neck
    c.beginPath(); c.moveTo(310, 110); c.quadraticCurveTo(280, 130, 270, 170); c.stroke();
    c.beginPath(); c.moveTo(310, 135); c.quadraticCurveTo(290, 150, 285, 175); c.stroke();
    // body
    c.beginPath(); c.moveTo(270, 170);
    c.bezierCurveTo(230, 170, 180, 190, 170, 230);
    c.quadraticCurveTo(160, 270, 180, 295); c.stroke();
    c.beginPath(); c.moveTo(285, 175);
    c.bezierCurveTo(320, 200, 340, 240, 320, 290);
    c.quadraticCurveTo(310, 310, 280, 310); c.stroke();
    // belly
    c.beginPath(); c.moveTo(180, 295); c.lineTo(280, 310); c.stroke();
    // back bumps
    c.beginPath(); c.moveTo(240, 172); c.lineTo(235, 160); c.lineTo(250, 170); c.stroke();
    c.beginPath(); c.moveTo(215, 180); c.lineTo(208, 168); c.lineTo(225, 178); c.stroke();
    // tiny arms!
    c.beginPath(); c.moveTo(290, 210); c.lineTo(310, 225); c.lineTo(300, 230); c.stroke();
    c.beginPath(); c.moveTo(290, 210); c.lineTo(315, 215); c.lineTo(308, 222); c.stroke();
    // left leg
    c.beginPath(); c.moveTo(210, 290); c.lineTo(200, 350); c.lineTo(180, 360);
    c.moveTo(200, 350); c.lineTo(215, 360); c.stroke();
    // right leg
    c.beginPath(); c.moveTo(280, 305); c.lineTo(290, 350); c.lineTo(275, 360);
    c.moveTo(290, 350); c.lineTo(308, 360); c.stroke();
    // tail
    c.beginPath(); c.moveTo(170, 235);
    c.bezierCurveTo(140, 220, 110, 230, 90, 210);
    c.quadraticCurveTo(75, 195, 80, 185); c.stroke();
  },
  sailboat(c) {
    // hull
    c.beginPath(); c.moveTo(100, 300); c.lineTo(130, 350); c.lineTo(390, 350); c.lineTo(420, 300); c.stroke();
    c.beginPath(); c.moveTo(100, 300); c.lineTo(420, 300); c.stroke();
    // mast
    c.beginPath(); c.moveTo(260, 300); c.lineTo(260, 80); c.stroke();
    // main sail
    c.beginPath(); c.moveTo(260, 90); c.lineTo(380, 290); c.lineTo(260, 290); c.stroke();
    // sail curve
    c.beginPath(); c.moveTo(260, 90);
    c.quadraticCurveTo(340, 180, 380, 290); c.stroke();
    // jib sail
    c.beginPath(); c.moveTo(260, 100); c.lineTo(160, 290); c.lineTo(260, 290); c.stroke();
    c.beginPath(); c.moveTo(260, 100);
    c.quadraticCurveTo(200, 190, 160, 290); c.stroke();
    // flag
    c.beginPath(); c.moveTo(260, 80); c.lineTo(240, 90); c.lineTo(260, 100); c.stroke();
    // hull detail
    c.beginPath(); c.moveTo(140, 320); c.lineTo(380, 320); c.stroke();
    // porthole
    c.beginPath(); c.arc(220, 318, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(300, 318, 8, 0, Math.PI * 2); c.stroke();
    // water
    c.beginPath(); c.moveTo(70, 365); c.quadraticCurveTo(130, 355, 190, 365); c.stroke();
    c.beginPath(); c.moveTo(240, 370); c.quadraticCurveTo(300, 360, 360, 370); c.stroke();
    c.beginPath(); c.moveTo(390, 365); c.quadraticCurveTo(420, 358, 450, 365); c.stroke();
  },
  owl(c) {
    // body
    c.beginPath(); c.ellipse(260, 260, 75, 100, 0, 0, Math.PI * 2); c.stroke();
    // head
    c.beginPath(); c.arc(260, 155, 55, 0, Math.PI * 2); c.stroke();
    // left ear tuft
    c.beginPath(); c.moveTo(220, 115); c.lineTo(200, 75); c.lineTo(230, 105); c.stroke();
    // right ear tuft
    c.beginPath(); c.moveTo(300, 115); c.lineTo(320, 75); c.lineTo(290, 105); c.stroke();
    // left eye circle
    c.beginPath(); c.arc(238, 155, 22, 0, Math.PI * 2); c.stroke();
    // right eye circle
    c.beginPath(); c.arc(282, 155, 22, 0, Math.PI * 2); c.stroke();
    // left pupil
    c.beginPath(); c.arc(238, 155, 10, 0, Math.PI * 2); c.stroke();
    // right pupil
    c.beginPath(); c.arc(282, 155, 10, 0, Math.PI * 2); c.stroke();
    // beak
    c.beginPath(); c.moveTo(253, 170); c.lineTo(260, 190); c.lineTo(267, 170); c.stroke();
    // chest feather pattern V shapes
    c.beginPath(); c.moveTo(240, 230); c.lineTo(250, 240); c.lineTo(260, 230); c.stroke();
    c.beginPath(); c.moveTo(260, 230); c.lineTo(270, 240); c.lineTo(280, 230); c.stroke();
    c.beginPath(); c.moveTo(235, 255); c.lineTo(248, 265); c.lineTo(260, 255); c.stroke();
    c.beginPath(); c.moveTo(260, 255); c.lineTo(272, 265); c.lineTo(285, 255); c.stroke();
    c.beginPath(); c.moveTo(240, 280); c.lineTo(250, 290); c.lineTo(260, 280); c.stroke();
    c.beginPath(); c.moveTo(260, 280); c.lineTo(270, 290); c.lineTo(280, 280); c.stroke();
    // left wing
    c.beginPath(); c.moveTo(188, 220); c.quadraticCurveTo(145, 270, 160, 330); c.stroke();
    // right wing
    c.beginPath(); c.moveTo(332, 220); c.quadraticCurveTo(375, 270, 360, 330); c.stroke();
    // feet/talons
    c.beginPath(); c.moveTo(235, 355); c.lineTo(220, 375); c.moveTo(235, 355); c.lineTo(235, 378);
    c.moveTo(235, 355); c.lineTo(250, 375); c.stroke();
    c.beginPath(); c.moveTo(285, 355); c.lineTo(270, 375); c.moveTo(285, 355); c.lineTo(285, 378);
    c.moveTo(285, 355); c.lineTo(300, 375); c.stroke();
    // branch
    c.beginPath(); c.moveTo(150, 365); c.lineTo(370, 365); c.stroke();
  },
  diamond(c) {
    // top facet
    c.beginPath(); c.moveTo(180, 170); c.lineTo(260, 80); c.lineTo(340, 170); c.stroke();
    // top flat
    c.beginPath(); c.moveTo(180, 170); c.lineTo(340, 170); c.stroke();
    // bottom point
    c.beginPath(); c.moveTo(180, 170); c.lineTo(260, 370); c.lineTo(340, 170); c.stroke();
    // upper facet lines
    c.beginPath(); c.moveTo(220, 80); c.lineTo(210, 170); c.stroke();
    c.beginPath(); c.moveTo(260, 80); c.lineTo(260, 170); c.stroke();
    c.beginPath(); c.moveTo(300, 80); c.lineTo(310, 170); c.stroke();
    // crown top edge
    c.beginPath(); c.moveTo(220, 80); c.lineTo(300, 80); c.stroke();
    c.beginPath(); c.moveTo(180, 170); c.lineTo(220, 80); c.stroke();
    c.beginPath(); c.moveTo(340, 170); c.lineTo(300, 80); c.stroke();
    // lower facet lines
    c.beginPath(); c.moveTo(210, 170); c.lineTo(260, 370); c.stroke();
    c.beginPath(); c.moveTo(260, 170); c.lineTo(260, 370); c.stroke();
    c.beginPath(); c.moveTo(310, 170); c.lineTo(260, 370); c.stroke();
    // sparkle left
    c.beginPath(); c.moveTo(140, 120); c.lineTo(150, 130); c.stroke();
    c.beginPath(); c.moveTo(150, 120); c.lineTo(140, 130); c.stroke();
    // sparkle right
    c.beginPath(); c.moveTo(370, 140); c.lineTo(380, 150); c.stroke();
    c.beginPath(); c.moveTo(380, 140); c.lineTo(370, 150); c.stroke();
    // sparkle top
    c.beginPath(); c.moveTo(285, 55); c.lineTo(290, 65); c.stroke();
    c.beginPath(); c.moveTo(290, 55); c.lineTo(285, 65); c.stroke();
  },
  butterfly(c) {
    // body
    c.beginPath(); c.moveTo(260, 100); c.lineTo(260, 320); c.stroke();
    // head
    c.beginPath(); c.arc(260, 100, 14, 0, Math.PI * 2); c.stroke();
    // left antenna
    c.beginPath(); c.moveTo(252, 90); c.quadraticCurveTo(220, 50, 210, 45); c.stroke();
    c.beginPath(); c.arc(207, 43, 5, 0, Math.PI * 2); c.stroke();
    // right antenna
    c.beginPath(); c.moveTo(268, 90); c.quadraticCurveTo(300, 50, 310, 45); c.stroke();
    c.beginPath(); c.arc(313, 43, 5, 0, Math.PI * 2); c.stroke();
    // upper left wing
    c.beginPath(); c.moveTo(260, 130);
    c.bezierCurveTo(200, 80, 110, 100, 110, 170);
    c.bezierCurveTo(110, 220, 180, 230, 260, 210); c.stroke();
    // upper right wing
    c.beginPath(); c.moveTo(260, 130);
    c.bezierCurveTo(320, 80, 410, 100, 410, 170);
    c.bezierCurveTo(410, 220, 340, 230, 260, 210); c.stroke();
    // lower left wing
    c.beginPath(); c.moveTo(260, 220);
    c.bezierCurveTo(200, 220, 130, 260, 140, 320);
    c.bezierCurveTo(150, 350, 220, 340, 260, 310); c.stroke();
    // lower right wing
    c.beginPath(); c.moveTo(260, 220);
    c.bezierCurveTo(320, 220, 390, 260, 380, 320);
    c.bezierCurveTo(370, 350, 300, 340, 260, 310); c.stroke();
    // wing pattern left upper
    c.beginPath(); c.arc(185, 160, 20, 0, Math.PI * 2); c.stroke();
    // wing pattern right upper
    c.beginPath(); c.arc(335, 160, 20, 0, Math.PI * 2); c.stroke();
    // wing pattern left lower
    c.beginPath(); c.arc(195, 285, 14, 0, Math.PI * 2); c.stroke();
    // wing pattern right lower
    c.beginPath(); c.arc(325, 285, 14, 0, Math.PI * 2); c.stroke();
  },
  guitar(c) {
    // headstock
    c.beginPath(); c.moveTo(240, 55); c.lineTo(240, 110); c.lineTo(280, 110); c.lineTo(280, 55); c.stroke();
    c.beginPath(); c.moveTo(240, 55); c.quadraticCurveTo(260, 45, 280, 55); c.stroke();
    // tuning pegs left
    c.beginPath(); c.moveTo(240, 68); c.lineTo(225, 68); c.stroke();
    c.beginPath(); c.arc(222, 68, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(240, 82); c.lineTo(225, 82); c.stroke();
    c.beginPath(); c.arc(222, 82, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(240, 96); c.lineTo(225, 96); c.stroke();
    c.beginPath(); c.arc(222, 96, 4, 0, Math.PI * 2); c.stroke();
    // tuning pegs right
    c.beginPath(); c.moveTo(280, 68); c.lineTo(295, 68); c.stroke();
    c.beginPath(); c.arc(298, 68, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(280, 82); c.lineTo(295, 82); c.stroke();
    c.beginPath(); c.arc(298, 82, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(280, 96); c.lineTo(295, 96); c.stroke();
    c.beginPath(); c.arc(298, 96, 4, 0, Math.PI * 2); c.stroke();
    // nut
    c.beginPath(); c.moveTo(240, 110); c.lineTo(280, 110); c.stroke();
    // neck
    c.beginPath(); c.moveTo(248, 110); c.lineTo(248, 230); c.stroke();
    c.beginPath(); c.moveTo(272, 110); c.lineTo(272, 230); c.stroke();
    // frets
    c.beginPath(); c.moveTo(248, 135); c.lineTo(272, 135); c.stroke();
    c.beginPath(); c.moveTo(248, 158); c.lineTo(272, 158); c.stroke();
    c.beginPath(); c.moveTo(248, 178); c.lineTo(272, 178); c.stroke();
    c.beginPath(); c.moveTo(248, 196); c.lineTo(272, 196); c.stroke();
    c.beginPath(); c.moveTo(248, 212); c.lineTo(272, 212); c.stroke();
    // body upper bout
    c.beginPath(); c.moveTo(248, 230);
    c.bezierCurveTo(200, 230, 170, 260, 170, 290); c.stroke();
    c.beginPath(); c.moveTo(272, 230);
    c.bezierCurveTo(320, 230, 350, 260, 350, 290); c.stroke();
    // waist
    c.beginPath(); c.moveTo(170, 290); c.quadraticCurveTo(185, 310, 175, 330); c.stroke();
    c.beginPath(); c.moveTo(350, 290); c.quadraticCurveTo(335, 310, 345, 330); c.stroke();
    // lower bout
    c.beginPath(); c.moveTo(175, 330);
    c.bezierCurveTo(165, 370, 200, 400, 260, 400);
    c.bezierCurveTo(320, 400, 355, 370, 345, 330); c.stroke();
    // sound hole
    c.beginPath(); c.arc(260, 310, 30, 0, Math.PI * 2); c.stroke();
    // bridge
    c.beginPath(); c.moveTo(235, 365); c.lineTo(285, 365); c.stroke();
    // strings hint
    c.beginPath(); c.moveTo(255, 110); c.lineTo(255, 365); c.stroke();
    c.beginPath(); c.moveTo(265, 110); c.lineTo(265, 365); c.stroke();
  },
  jellyfish(c) {
    // bell/dome
    c.beginPath(); c.arc(260, 170, 90, Math.PI, 0); c.stroke();
    // bell bottom
    c.beginPath(); c.moveTo(170, 170);
    c.quadraticCurveTo(195, 195, 220, 175);
    c.quadraticCurveTo(240, 165, 260, 180);
    c.quadraticCurveTo(280, 165, 300, 175);
    c.quadraticCurveTo(325, 195, 350, 170); c.stroke();
    // bell inner pattern
    c.beginPath(); c.arc(260, 155, 40, Math.PI + 0.3, -0.3); c.stroke();
    // eyes
    c.beginPath(); c.arc(238, 145, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(282, 145, 8, 0, Math.PI * 2); c.stroke();
    // smile
    c.beginPath(); c.arc(260, 158, 12, 0.3, Math.PI - 0.3); c.stroke();
    // tentacle 1
    c.beginPath(); c.moveTo(190, 185);
    c.bezierCurveTo(180, 230, 195, 280, 175, 340);
    c.quadraticCurveTo(170, 360, 180, 370); c.stroke();
    // tentacle 2
    c.beginPath(); c.moveTo(220, 180);
    c.bezierCurveTo(215, 240, 230, 290, 210, 360);
    c.quadraticCurveTo(205, 380, 215, 385); c.stroke();
    // tentacle 3
    c.beginPath(); c.moveTo(250, 182);
    c.bezierCurveTo(248, 230, 255, 290, 240, 370);
    c.quadraticCurveTo(237, 390, 248, 390); c.stroke();
    // tentacle 4
    c.beginPath(); c.moveTo(270, 182);
    c.bezierCurveTo(275, 230, 270, 290, 285, 370);
    c.quadraticCurveTo(290, 390, 280, 390); c.stroke();
    // tentacle 5
    c.beginPath(); c.moveTo(300, 180);
    c.bezierCurveTo(310, 240, 295, 290, 315, 360);
    c.quadraticCurveTo(320, 380, 310, 385); c.stroke();
    // tentacle 6
    c.beginPath(); c.moveTo(330, 185);
    c.bezierCurveTo(340, 230, 325, 280, 345, 340);
    c.quadraticCurveTo(350, 360, 340, 370); c.stroke();
    // dots on bell
    c.beginPath(); c.arc(220, 120, 5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 110, 5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(300, 120, 5, 0, Math.PI * 2); c.stroke();
  },
  sunflower(c) {
    // center
    c.beginPath(); c.arc(260, 190, 40, 0, Math.PI * 2); c.stroke();
    // inner center
    c.beginPath(); c.arc(260, 190, 25, 0, Math.PI * 2); c.stroke();
    // center dots
    c.beginPath(); c.arc(250, 182, 3, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(270, 182, 3, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 198, 3, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(248, 195, 3, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(272, 195, 3, 0, Math.PI * 2); c.stroke();
    // petals (12 around)
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
      const px = 260 + 45 * Math.cos(a);
      const py = 190 + 45 * Math.sin(a);
      const ex = 260 + 85 * Math.cos(a);
      const ey = 190 + 85 * Math.sin(a);
      const cpx1 = 260 + 65 * Math.cos(a - 0.25);
      const cpy1 = 190 + 65 * Math.sin(a - 0.25);
      const cpx2 = 260 + 65 * Math.cos(a + 0.25);
      const cpy2 = 190 + 65 * Math.sin(a + 0.25);
      c.beginPath(); c.moveTo(px, py);
      c.quadraticCurveTo(cpx1, cpy1, ex, ey);
      c.quadraticCurveTo(cpx2, cpy2, px, py); c.stroke();
    }
    // stem
    c.beginPath(); c.moveTo(255, 275); c.quadraticCurveTo(250, 340, 255, 400); c.stroke();
    c.beginPath(); c.moveTo(265, 275); c.quadraticCurveTo(270, 340, 265, 400); c.stroke();
    // leaf left
    c.beginPath(); c.moveTo(255, 330);
    c.quadraticCurveTo(200, 310, 180, 330);
    c.quadraticCurveTo(200, 345, 255, 340); c.stroke();
    // leaf right
    c.beginPath(); c.moveTo(265, 350);
    c.quadraticCurveTo(320, 335, 340, 350);
    c.quadraticCurveTo(320, 365, 265, 358); c.stroke();
    // leaf veins
    c.beginPath(); c.moveTo(255, 335); c.lineTo(195, 330); c.stroke();
    c.beginPath(); c.moveTo(265, 354); c.lineTo(325, 350); c.stroke();
  },
  pirateship(c) {
    // hull
    c.beginPath(); c.moveTo(80, 280); c.lineTo(60, 320);
    c.lineTo(100, 350); c.lineTo(420, 350); c.lineTo(460, 320); c.lineTo(440, 280); c.stroke();
    c.beginPath(); c.moveTo(80, 280); c.lineTo(440, 280); c.stroke();
    // hull stripes
    c.beginPath(); c.moveTo(75, 305); c.lineTo(445, 305); c.stroke();
    // bow decoration
    c.beginPath(); c.moveTo(80, 280); c.quadraticCurveTo(50, 260, 40, 240); c.stroke();
    // stern decoration
    c.beginPath(); c.moveTo(440, 280); c.lineTo(460, 260); c.lineTo(460, 290); c.stroke();
    // main mast
    c.beginPath(); c.moveTo(260, 280); c.lineTo(260, 60); c.stroke();
    // fore mast
    c.beginPath(); c.moveTo(160, 280); c.lineTo(160, 110); c.stroke();
    // main sail
    c.beginPath(); c.moveTo(200, 90); c.lineTo(320, 90); c.stroke();
    c.beginPath(); c.moveTo(195, 180); c.lineTo(325, 180); c.stroke();
    c.beginPath(); c.moveTo(200, 90); c.quadraticCurveTo(195, 135, 195, 180); c.stroke();
    c.beginPath(); c.moveTo(320, 90); c.quadraticCurveTo(325, 135, 325, 180); c.stroke();
    // fore sail
    c.beginPath(); c.moveTo(115, 130); c.lineTo(205, 130); c.stroke();
    c.beginPath(); c.moveTo(110, 210); c.lineTo(210, 210); c.stroke();
    c.beginPath(); c.moveTo(115, 130); c.quadraticCurveTo(110, 170, 110, 210); c.stroke();
    c.beginPath(); c.moveTo(205, 130); c.quadraticCurveTo(210, 170, 210, 210); c.stroke();
    // crow's nest
    c.beginPath(); c.moveTo(245, 65); c.lineTo(275, 65); c.lineTo(278, 80); c.lineTo(242, 80); c.closePath(); c.stroke();
    // jolly roger flag
    c.beginPath(); c.moveTo(260, 60); c.lineTo(260, 35); c.stroke();
    c.beginPath(); c.moveTo(260, 35); c.lineTo(295, 35); c.lineTo(295, 55); c.lineTo(260, 55); c.stroke();
    // skull on flag
    c.beginPath(); c.arc(278, 43, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(272, 49); c.lineTo(284, 49); c.stroke();
    // water
    c.beginPath(); c.moveTo(40, 365); c.quadraticCurveTo(110, 355, 180, 365); c.stroke();
    c.beginPath(); c.moveTo(230, 370); c.quadraticCurveTo(300, 360, 370, 370); c.stroke();
    c.beginPath(); c.moveTo(400, 365); c.quadraticCurveTo(440, 358, 480, 365); c.stroke();
    // cannon holes
    c.beginPath(); c.arc(180, 300, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 300, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(340, 300, 6, 0, Math.PI * 2); c.stroke();
  },
};

function drawReference(ctxRef, promptKey = dailyPrompt.key) {
  ctxRef.clearRect(0, 0, refCanvas.width, refCanvas.height);
  ctxRef.save();
  ctxRef.lineWidth = 10;
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
  c.lineWidth = 10;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.strokeStyle = "#000";
  if (promptDrawFns[dailyPrompt.key]) {
    promptDrawFns[dailyPrompt.key](c);
  }
  c.restore();

  // Generate mask
  const mask = generateDailyMask(cols, rows, 0.35);

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
  c.lineWidth = 10;
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
  rocket: `<path d="M230 320 L230 140 Q230 80 260 50 Q290 80 290 140 L290 320"/>
    <line x1="260" y1="50" x2="250" y2="70"/><line x1="260" y1="50" x2="270" y2="70"/>
    <path d="M230 280 L190 340 L230 320"/><path d="M290 280 L330 340 L290 320"/>
    <circle cx="260" cy="180" r="22"/><circle cx="260" cy="180" r="14"/>
    <line x1="230" y1="250" x2="290" y2="250"/><line x1="230" y1="265" x2="290" y2="265"/>
    <path d="M240 320 Q245 360 260 390"/><path d="M280 320 Q275 360 260 390"/>
    <path d="M250 320 Q255 350 260 370"/><path d="M270 320 Q265 350 260 370"/>
    <circle cx="160" cy="100" r="3"/><circle cx="370" cy="150" r="3"/><circle cx="150" cy="250" r="3"/>`,
  octopus: `<ellipse cx="260" cy="150" rx="80" ry="70"/>
    <circle cx="230" cy="140" r="15"/><circle cx="290" cy="140" r="15"/>
    <circle cx="233" cy="138" r="6"/><circle cx="293" cy="138" r="6"/>
    <path d="M250 170 A10 10 0 0 1 270 170"/>
    <path d="M195 200 C150 250 120 300 140 350 Q150 370 165 355"/>
    <path d="M210 210 C180 270 160 330 190 370 Q200 385 210 370"/>
    <path d="M235 215 C220 280 210 340 230 380 Q240 395 250 380"/>
    <path d="M255 218 C250 280 245 350 265 390 Q275 400 280 385"/>
    <path d="M275 218 C285 280 295 350 305 385 Q315 400 320 380"/>
    <path d="M295 215 C320 270 340 330 330 370 Q325 385 315 365"/>
    <path d="M310 210 C340 260 370 310 365 355 Q362 375 350 355"/>
    <path d="M325 200 C370 240 400 290 385 340 Q380 360 370 340"/>
    <circle cx="145" cy="310" r="4"/><circle cx="138" cy="335" r="4"/>`,
  pizza: `<path d="M140 100 L260 380 L380 100"/>
    <path d="M140 100 A120 120 0 0 1 380 100"/>
    <path d="M152 108 A108 108 0 0 1 368 108"/>
    <circle cx="240" cy="180" r="16"/><circle cx="290" cy="220" r="14"/>
    <circle cx="220" cy="260" r="15"/><circle cx="270" cy="300" r="13"/>
    <path d="M298 160 A12 12 0 0 1 322 160"/><line x1="304" y1="160" x2="306" y2="175"/><line x1="316" y1="160" x2="314" y2="175"/>
    <circle cx="200" cy="190" r="10"/><circle cx="200" cy="190" r="4"/>
    <path d="M260 375 Q255 395 260 400"/>`,
  dragon: `<ellipse cx="160" cy="130" rx="45" ry="35" transform="rotate(-11 160 130)"/>
    <path d="M118 120 L95 115 L95 135 L118 138"/>
    <circle cx="150" cy="120" r="8"/><circle cx="152" cy="119" r="3"/>
    <path d="M150 100 L135 65 L155 90"/><path d="M175 98 L185 60 L180 92"/>
    <path d="M95 120 Q70 110 60 125 Q55 140 75 140"/>
    <path d="M190 150 Q220 180 240 200"/><path d="M175 160 Q210 195 230 215"/>
    <path d="M240 200 C300 190 350 210 370 250 Q385 285 370 310"/>
    <path d="M230 215 C280 220 340 240 360 280 Q370 310 355 325"/>
    <path d="M270 200 L310 110 L360 130 L400 100 L380 180 L350 210"/>
    <line x1="310" y1="110" x2="330" y2="190"/><line x1="360" y1="130" x2="360" y2="200"/>
    <line x1="260" y1="225" x2="260" y2="255"/><line x1="280" y1="230" x2="280" y2="265"/><line x1="300" y1="235" x2="300" y2="275"/>
    <path d="M270 250 L260 320 L240 330 M260 320 L270 335"/>
    <path d="M340 280 L350 340 L335 350 M350 340 L365 350"/>
    <path d="M370 310 C390 340 420 350 440 330 Q460 310 450 295"/>
    <path d="M450 295 L465 280 L445 290"/>
    <line x1="200" y1="160" x2="195" y2="148"/><line x1="215" y1="175" x2="208" y2="163"/>`,
  penguin: `<ellipse cx="260" cy="250" rx="70" ry="110"/>
    <ellipse cx="260" cy="265" rx="45" ry="85"/>
    <circle cx="260" cy="140" r="45"/>
    <circle cx="242" cy="132" r="8"/><circle cx="244" cy="131" r="3"/>
    <circle cx="278" cy="132" r="8"/><circle cx="280" cy="131" r="3"/>
    <path d="M252 148 L260 168 L268 148"/>
    <path d="M192 200 Q155 260 170 320"/>
    <path d="M328 200 Q365 260 350 320"/>
    <path d="M230 355 L210 375 L240 375 L250 358"/>
    <path d="M290 355 L280 375 L310 375 L290 358"/>
    <path d="M260 185 L245 175 L245 195 L260 185 L275 175 L275 195 Z"/>`,
  ufo: `<path d="M200 190 A60 60 0 0 1 320 190"/>
    <path d="M208 190 A45 45 0 0 1 312 190"/>
    <ellipse cx="260" cy="200" rx="140" ry="35"/>
    <path d="M140 210 A120 25 0 0 0 380 210"/>
    <circle cx="230" cy="175" r="8"/><circle cx="260" cy="170" r="8"/><circle cx="290" cy="175" r="8"/>
    <circle cx="170" cy="200" r="6"/><circle cx="215" cy="207" r="6"/><circle cx="260" cy="210" r="6"/>
    <circle cx="305" cy="207" r="6"/><circle cx="350" cy="200" r="6"/>
    <line x1="220" y1="230" x2="180" y2="380"/><line x1="300" y1="230" x2="340" y2="380"/>
    <line x1="180" y1="380" x2="340" y2="380"/>
    <line x1="235" y1="260" x2="285" y2="260"/><line x1="215" y1="320" x2="305" y2="320"/>
    <line x1="260" y1="130" x2="260" y2="110"/><circle cx="260" cy="106" r="5"/>`,
  skull: `<path d="M170 180 A90 90 0 0 1 350 180"/>
    <path d="M170 180 L170 240 Q170 270 190 280"/>
    <path d="M350 180 L350 240 Q350 270 330 280"/>
    <path d="M190 280 L195 270 L220 280"/><path d="M330 280 L325 270 L300 280"/>
    <path d="M220 280 L210 310 Q210 340 230 340 L290 340 Q310 340 310 310 L300 280"/>
    <ellipse cx="225" cy="200" rx="28" ry="30"/><ellipse cx="295" cy="200" rx="28" ry="30"/>
    <path d="M252 240 L248 265 L260 270 L272 265 L268 240"/>
    <line x1="220" y1="300" x2="300" y2="300"/>
    <line x1="235" y1="300" x2="235" y2="340"/><line x1="252" y1="300" x2="252" y2="340"/>
    <line x1="268" y1="300" x2="268" y2="340"/><line x1="285" y1="300" x2="285" y2="340"/>
    <path d="M175 160 Q180 170 178 185"/><path d="M345 160 Q340 170 342 185"/>`,
  palmtree: `<path d="M245 390 Q240 300 255 200 Q265 160 260 140"/>
    <path d="M275 390 Q270 300 275 200 Q280 160 270 140"/>
    <line x1="247" y1="350" x2="273" y2="350"/><line x1="248" y1="310" x2="274" y2="310"/>
    <line x1="252" y1="270" x2="276" y2="270"/><line x1="256" y1="230" x2="276" y2="230"/>
    <line x1="259" y1="195" x2="275" y2="195"/>
    <path d="M265 140 C320 110 390 100 430 130"/>
    <line x1="330" y1="105" x2="340" y2="120"/><line x1="370" y1="100" x2="375" y2="118"/><line x1="405" y1="108" x2="405" y2="126"/>
    <path d="M265 140 C200 110 130 105 90 140"/>
    <line x1="190" y1="108" x2="185" y2="125"/><line x1="150" y1="105" x2="148" y2="122"/><line x1="115" y1="115" x2="115" y2="132"/>
    <path d="M265 140 C310 140 380 160 410 200"/>
    <line x1="340" y1="148" x2="345" y2="165"/><line x1="375" y1="162" x2="378" y2="180"/>
    <path d="M265 140 C220 140 150 165 120 205"/>
    <line x1="180" y1="155" x2="177" y2="172"/><line x1="145" y1="172" x2="143" y2="190"/>
    <circle cx="255" cy="150" r="10"/><circle cx="275" cy="148" r="10"/>`,
  robot: `<rect x="210" y="80" width="100" height="80"/>
    <line x1="260" y1="80" x2="260" y2="55"/><circle cx="260" cy="48" r="7"/>
    <rect x="228" y="105" width="20" height="20"/><rect x="272" y="105" width="20" height="20"/>
    <circle cx="238" cy="115" r="5"/><circle cx="282" cy="115" r="5"/>
    <line x1="235" y1="140" x2="285" y2="140"/>
    <line x1="245" y1="140" x2="245" y2="148"/><line x1="260" y1="140" x2="260" y2="148"/><line x1="275" y1="140" x2="275" y2="148"/>
    <path d="M245 160 L245 180 L275 180 L275 160"/>
    <rect x="195" y="180" width="130" height="130"/>
    <rect x="220" y="200" width="80" height="60"/>
    <circle cx="240" cy="220" r="8"/><circle cx="270" cy="220" r="8"/>
    <line x1="230" y1="245" x2="290" y2="245"/><line x1="260" y1="240" x2="260" y2="250"/>
    <path d="M195 195 L155 195 L155 280 L175 280 L175 210 L195 210"/>
    <line x1="145" y1="280" x2="145" y2="300"/><line x1="175" y1="280" x2="175" y2="300"/>
    <path d="M325 195 L365 195 L365 280 L345 280 L345 210 L325 210"/>
    <line x1="345" y1="280" x2="345" y2="300"/><line x1="375" y1="280" x2="375" y2="300"/>
    <path d="M220 310 L220 370 L200 370 L200 380 L245 380 L245 370 L240 370 L240 310"/>
    <path d="M280 310 L280 370 L275 370 L275 380 L320 380 L320 370 L300 370 L300 310"/>
    <line x1="205" y1="115" x2="215" y2="115"/><line x1="210" y1="110" x2="210" y2="120"/>`,
  flamingo: `<ellipse cx="280" cy="240" rx="60" ry="40" transform="rotate(17 280 240)"/>
    <path d="M335 225 Q370 210 380 220"/><path d="M335 235 Q375 225 385 235"/>
    <path d="M235 215 C210 190 190 150 195 110 Q198 85 215 80"/>
    <path d="M245 220 C225 195 210 155 215 115 Q218 92 230 87"/>
    <circle cx="222" cy="78" r="18"/>
    <circle cx="215" cy="74" r="4"/>
    <path d="M206 82 L178 90 L178 85 L200 78"/>
    <path d="M178 85 Q172 88 170 92"/>
    <path d="M270 275 L265 340 Q260 355 265 360"/><line x1="255" y1="360" x2="280" y2="360"/>
    <path d="M290 275 L300 320 L290 360"/><line x1="280" y1="360" x2="305" y2="360"/>
    <path d="M250 225 Q280 215 320 225"/><path d="M255 235 Q285 228 325 238"/>`,
  volcano: `<line x1="60" y1="370" x2="200" y2="140"/><line x1="460" y1="370" x2="320" y2="140"/>
    <path d="M200 140 Q260 160 320 140"/>
    <line x1="40" y1="370" x2="480" y2="370"/>
    <path d="M230 145 C220 180 200 220 180 270 Q170 300 175 320"/>
    <path d="M280 148 C290 190 310 240 320 290 Q325 320 320 340"/>
    <circle cx="240" cy="90" r="8"/><circle cx="275" cy="70" r="6"/>
    <circle cx="300" cy="95" r="7"/><circle cx="220" cy="60" r="5"/>
    <circle cx="250" cy="45" r="18"/><circle cx="275" cy="35" r="22"/><circle cx="300" cy="50" r="16"/>
    <line x1="140" y1="280" x2="165" y2="280"/><line x1="350" y1="290" x2="380" y2="290"/>
    <line x1="120" y1="330" x2="155" y2="330"/><line x1="370" y1="340" x2="400" y2="340"/>`,
  sword: `<line x1="260" y1="60" x2="245" y2="240"/><line x1="260" y1="60" x2="275" y2="240"/>
    <line x1="260" y1="60" x2="260" y2="45"/>
    <line x1="260" y1="70" x2="260" y2="235"/>
    <line x1="200" y1="240" x2="320" y2="240"/>
    <path d="M200 240 Q195 250 200 255"/><path d="M320 240 Q325 250 320 255"/>
    <line x1="200" y1="255" x2="320" y2="255"/>
    <line x1="248" y1="255" x2="248" y2="340"/><line x1="272" y1="255" x2="272" y2="340"/>
    <line x1="248" y1="275" x2="272" y2="285"/><line x1="248" y1="295" x2="272" y2="305"/><line x1="248" y1="315" x2="272" y2="325"/>
    <circle cx="260" cy="350" r="15"/><circle cx="260" cy="350" r="6"/>
    <line x1="252" y1="100" x2="250" y2="150"/>`,
  mushroom: `<path d="M160 190 A100 100 0 0 1 360 190"/>
    <path d="M160 190 Q260 220 360 190"/>
    <path d="M225 200 Q220 300 225 370"/><path d="M295 200 Q300 300 295 370"/>
    <path d="M225 370 Q210 380 210 390"/><path d="M295 370 Q310 380 310 390"/>
    <line x1="210" y1="390" x2="310" y2="390"/>
    <circle cx="220" cy="150" r="18"/><circle cx="300" cy="145" r="15"/>
    <circle cx="260" cy="120" r="20"/><circle cx="190" cy="170" r="12"/><circle cx="330" cy="168" r="13"/>
    <line x1="240" y1="198" x2="240" y2="210"/><line x1="260" y1="200" x2="260" y2="215"/><line x1="280" y1="198" x2="280" y2="210"/>`,
  icecream: `<path d="M210 230 L260 390 L310 230"/>
    <line x1="220" y1="245" x2="280" y2="335"/><line x1="240" y1="240" x2="290" y2="310"/>
    <line x1="300" y1="245" x2="240" y2="335"/><line x1="280" y1="240" x2="230" y2="310"/>
    <circle cx="260" cy="200" r="55"/><circle cx="260" cy="130" r="50"/>
    <circle cx="260" cy="75" r="14"/>
    <path d="M260 61 Q270 45 265 38"/>
    <path d="M215 195 Q210 215 215 225"/><path d="M305 195 Q310 215 305 225"/>
    <circle cx="240" cy="195" r="5"/><circle cx="280" cy="200" r="4"/>
    <circle cx="250" cy="125" r="5"/><circle cx="275" cy="135" r="4"/>`,
  castle: `<rect x="160" y="180" width="200" height="200"/>
    <rect x="130" y="120" width="60" height="260"/><rect x="330" y="120" width="60" height="260"/>
    <path d="M125 120 L125 100 L142 100 L142 120"/><path d="M152 120 L152 100 L168 100 L168 120"/><path d="M178 120 L178 100 L195 100 L195 120"/>
    <path d="M325 120 L325 100 L342 100 L342 120"/><path d="M352 120 L352 100 L368 100 L368 120"/><path d="M378 120 L378 100 L395 100 L395 120"/>
    <path d="M175 180 L175 162 L195 162 L195 180"/><path d="M210 180 L210 162 L230 162 L230 180"/>
    <path d="M245 180 L245 162 L265 162 L265 180"/><path d="M280 180 L280 162 L300 162 L300 180"/>
    <path d="M315 180 L315 162 L335 162 L335 180"/>
    <path d="M230 380 L230 310 A30 30 0 0 1 290 310 L290 380"/>
    <line x1="250" y1="310" x2="250" y2="380"/><line x1="270" y1="310" x2="270" y2="380"/>
    <path d="M148 200 A12 12 0 0 1 172 200 L172 225 L148 225 Z"/>
    <path d="M348 200 A12 12 0 0 1 372 200 L372 225 L348 225 Z"/>
    <line x1="260" y1="162" x2="260" y2="125"/>
    <path d="M260 125 L285 135 L260 145"/>`,
  cat: `<circle cx="260" cy="160" r="60"/>
    <path d="M215 115 L200 70 L235 100"/><path d="M305 115 L320 70 L285 100"/>
    <path d="M218 110 L210 82 L230 103"/><path d="M302 110 L310 82 L290 103"/>
    <ellipse cx="238" cy="150" rx="12" ry="14"/><ellipse cx="282" cy="150" rx="12" ry="14"/>
    <line x1="238" y1="142" x2="238" y2="158"/><line x1="282" y1="142" x2="282" y2="158"/>
    <path d="M254 172 L260 180 L266 172 Z"/>
    <line x1="260" y1="180" x2="260" y2="188"/>
    <path d="M260 188 Q248 195 242 188"/><path d="M260 188 Q272 195 278 188"/>
    <line x1="220" y1="170" x2="175" y2="162"/><line x1="220" y1="177" x2="175" y2="177"/><line x1="220" y1="184" x2="175" y2="192"/>
    <line x1="300" y1="170" x2="345" y2="162"/><line x1="300" y1="177" x2="345" y2="177"/><line x1="300" y1="184" x2="345" y2="192"/>
    <ellipse cx="260" cy="290" rx="55" ry="70"/>
    <circle cx="230" cy="355" r="15"/><circle cx="290" cy="355" r="15"/>
    <path d="M310 300 C360 290 390 260 380 230 Q375 215 365 220"/>`,
  anchor: `<circle cx="260" cy="85" r="25"/>
    <line x1="260" y1="110" x2="260" y2="340"/>
    <line x1="200" y1="160" x2="320" y2="160"/>
    <path d="M260 340 Q180 340 150 290 Q140 270 155 260"/>
    <path d="M155 260 L145 252 L148 268"/>
    <path d="M260 340 Q340 340 370 290 Q380 270 365 260"/>
    <path d="M365 260 L375 252 L372 268"/>
    <line x1="255" y1="140" x2="265" y2="140"/><line x1="255" y1="200" x2="265" y2="200"/><line x1="255" y1="260" x2="265" y2="260"/>
    <path d="M245 65 Q230 55 235 45"/>`,
  lightning: `<path d="M280 50 L220 190 L270 190 L210 370"/>
    <path d="M320 50 L260 190 L310 190 L250 370"/>
    <line x1="280" y1="50" x2="320" y2="50"/><line x1="210" y1="370" x2="250" y2="370"/>
    <line x1="220" y1="190" x2="260" y2="190"/><line x1="270" y1="190" x2="310" y2="190"/>
    <line x1="190" y1="160" x2="175" y2="155"/><line x1="185" y1="175" x2="170" y2="175"/>
    <line x1="340" y1="170" x2="355" y2="165"/><line x1="335" y1="185" x2="350" y2="185"/>
    <line x1="170" y1="260" x2="155" y2="255"/><line x1="330" y1="280" x2="345" y2="275"/>`,
  crown: `<line x1="140" y1="280" x2="380" y2="280"/><line x1="140" y1="300" x2="380" y2="300"/>
    <line x1="140" y1="280" x2="140" y2="300"/><line x1="380" y1="280" x2="380" y2="300"/>
    <path d="M140 280 L150 140 L200 210 L260 110 L320 210 L370 140 L380 280"/>
    <circle cx="150" cy="135" r="8"/><circle cx="260" cy="105" r="10"/><circle cx="370" cy="135" r="8"/>
    <circle cx="200" cy="285" r="6"/><circle cx="260" cy="285" r="8"/><circle cx="320" cy="285" r="6"/>
    <line x1="165" y1="240" x2="175" y2="200"/><line x1="200" y1="250" x2="220" y2="200"/>
    <line x1="300" y1="250" x2="320" y2="200"/><line x1="355" y1="240" x2="345" y2="200"/>`,
  ghost: `<path d="M180 170 A80 80 0 0 1 340 170"/>
    <line x1="180" y1="170" x2="180" y2="340"/><line x1="340" y1="170" x2="340" y2="340"/>
    <path d="M180 340 Q200 310 220 340 Q240 370 260 340 Q280 310 300 340 Q320 370 340 340"/>
    <ellipse cx="230" cy="180" rx="18" ry="22"/><ellipse cx="290" cy="180" rx="18" ry="22"/>
    <circle cx="233" cy="184" r="7"/><circle cx="293" cy="184" r="7"/>
    <ellipse cx="260" cy="240" rx="18" ry="14"/>
    <path d="M180 230 Q145 240 140 260"/><path d="M340 230 Q375 240 380 260"/>`,
  hotdog: `<path d="M100 210 Q95 180 130 170 L390 170 Q425 180 420 210"/>
    <path d="M100 230 Q95 260 130 270 L390 270 Q425 260 420 230"/>
    <line x1="110" y1="210" x2="410" y2="210"/><line x1="110" y1="230" x2="410" y2="230"/>
    <path d="M103 220 A12 12 0 0 0 103 220" /><path d="M115 208 A12 12 0 1 0 115 232"/>
    <path d="M405 208 A12 12 0 1 1 405 232"/>
    <path d="M130 215 L155 225 L180 215 L205 225 L230 215 L255 225 L280 215 L305 225 L330 215 L355 225 L380 215"/>
    <line x1="150" y1="185" x2="180" y2="185"/><line x1="250" y1="182" x2="280" y2="182"/><line x1="340" y1="185" x2="370" y2="185"/>
    <ellipse cx="200" cy="180" rx="6" ry="3" transform="rotate(17 200 180)"/>
    <ellipse cx="310" cy="178" rx="6" ry="3" transform="rotate(-11 310 178)"/>`,
  dinosaur: `<path d="M310 100 L390 100 L400 110 L400 140 L310 140 Q295 120 310 100"/>
    <circle cx="340" cy="115" r="8"/><circle cx="342" cy="114" r="3"/>
    <circle cx="385" cy="110" r="4"/>
    <line x1="310" y1="140" x2="400" y2="140"/>
    <path d="M340 140 L345 148 L350 140"/><path d="M360 140 L365 148 L370 140"/><path d="M380 140 L385 148 L390 140"/>
    <path d="M310 110 Q280 130 270 170"/><path d="M310 135 Q290 150 285 175"/>
    <path d="M270 170 C230 170 180 190 170 230 Q160 270 180 295"/>
    <path d="M285 175 C320 200 340 240 320 290 Q310 310 280 310"/>
    <line x1="180" y1="295" x2="280" y2="310"/>
    <path d="M240 172 L235 160 L250 170"/><path d="M215 180 L208 168 L225 178"/>
    <path d="M290 210 L310 225 L300 230"/><path d="M290 210 L315 215 L308 222"/>
    <path d="M210 290 L200 350 L180 360 M200 350 L215 360"/>
    <path d="M280 305 L290 350 L275 360 M290 350 L308 360"/>
    <path d="M170 235 C140 220 110 230 90 210 Q75 195 80 185"/>`,
  sailboat: `<path d="M100 300 L130 350 L390 350 L420 300"/>
    <line x1="100" y1="300" x2="420" y2="300"/>
    <line x1="260" y1="300" x2="260" y2="80"/>
    <path d="M260 90 L380 290 L260 290"/>
    <path d="M260 90 Q340 180 380 290"/>
    <path d="M260 100 L160 290 L260 290"/>
    <path d="M260 100 Q200 190 160 290"/>
    <path d="M260 80 L240 90 L260 100"/>
    <line x1="140" y1="320" x2="380" y2="320"/>
    <circle cx="220" cy="318" r="8"/><circle cx="300" cy="318" r="8"/>
    <path d="M70 365 Q130 355 190 365"/><path d="M240 370 Q300 360 360 370"/><path d="M390 365 Q420 358 450 365"/>`,
  owl: `<ellipse cx="260" cy="260" rx="75" ry="100"/>
    <circle cx="260" cy="155" r="55"/>
    <path d="M220 115 L200 75 L230 105"/><path d="M300 115 L320 75 L290 105"/>
    <circle cx="238" cy="155" r="22"/><circle cx="282" cy="155" r="22"/>
    <circle cx="238" cy="155" r="10"/><circle cx="282" cy="155" r="10"/>
    <path d="M253 170 L260 190 L267 170"/>
    <path d="M240 230 L250 240 L260 230"/><path d="M260 230 L270 240 L280 230"/>
    <path d="M235 255 L248 265 L260 255"/><path d="M260 255 L272 265 L285 255"/>
    <path d="M240 280 L250 290 L260 280"/><path d="M260 280 L270 290 L280 280"/>
    <path d="M188 220 Q145 270 160 330"/><path d="M332 220 Q375 270 360 330"/>
    <path d="M235 355 L220 375 M235 355 L235 378 M235 355 L250 375"/>
    <path d="M285 355 L270 375 M285 355 L285 378 M285 355 L300 375"/>
    <line x1="150" y1="365" x2="370" y2="365"/>`,
  diamond: `<path d="M180 170 L260 80 L340 170"/>
    <line x1="180" y1="170" x2="340" y2="170"/>
    <path d="M180 170 L260 370 L340 170"/>
    <line x1="220" y1="80" x2="210" y2="170"/><line x1="260" y1="80" x2="260" y2="170"/><line x1="300" y1="80" x2="310" y2="170"/>
    <line x1="220" y1="80" x2="300" y2="80"/>
    <line x1="180" y1="170" x2="220" y2="80"/><line x1="340" y1="170" x2="300" y2="80"/>
    <line x1="210" y1="170" x2="260" y2="370"/><line x1="260" y1="170" x2="260" y2="370"/><line x1="310" y1="170" x2="260" y2="370"/>
    <line x1="140" y1="120" x2="150" y2="130"/><line x1="150" y1="120" x2="140" y2="130"/>
    <line x1="370" y1="140" x2="380" y2="150"/><line x1="380" y1="140" x2="370" y2="150"/>
    <line x1="285" y1="55" x2="290" y2="65"/><line x1="290" y1="55" x2="285" y2="65"/>`,
  butterfly: `<line x1="260" y1="100" x2="260" y2="320"/>
    <circle cx="260" cy="100" r="14"/>
    <path d="M252 90 Q220 50 210 45"/><circle cx="207" cy="43" r="5"/>
    <path d="M268 90 Q300 50 310 45"/><circle cx="313" cy="43" r="5"/>
    <path d="M260 130 C200 80 110 100 110 170 C110 220 180 230 260 210"/>
    <path d="M260 130 C320 80 410 100 410 170 C410 220 340 230 260 210"/>
    <path d="M260 220 C200 220 130 260 140 320 C150 350 220 340 260 310"/>
    <path d="M260 220 C320 220 390 260 380 320 C370 350 300 340 260 310"/>
    <circle cx="185" cy="160" r="20"/><circle cx="335" cy="160" r="20"/>
    <circle cx="195" cy="285" r="14"/><circle cx="325" cy="285" r="14"/>`,
  guitar: `<path d="M240 55 L240 110 L280 110 L280 55"/><path d="M240 55 Q260 45 280 55"/>
    <line x1="240" y1="68" x2="225" y2="68"/><circle cx="222" cy="68" r="4"/>
    <line x1="240" y1="82" x2="225" y2="82"/><circle cx="222" cy="82" r="4"/>
    <line x1="240" y1="96" x2="225" y2="96"/><circle cx="222" cy="96" r="4"/>
    <line x1="280" y1="68" x2="295" y2="68"/><circle cx="298" cy="68" r="4"/>
    <line x1="280" y1="82" x2="295" y2="82"/><circle cx="298" cy="82" r="4"/>
    <line x1="280" y1="96" x2="295" y2="96"/><circle cx="298" cy="96" r="4"/>
    <line x1="240" y1="110" x2="280" y2="110"/>
    <line x1="248" y1="110" x2="248" y2="230"/><line x1="272" y1="110" x2="272" y2="230"/>
    <line x1="248" y1="135" x2="272" y2="135"/><line x1="248" y1="158" x2="272" y2="158"/>
    <line x1="248" y1="178" x2="272" y2="178"/><line x1="248" y1="196" x2="272" y2="196"/><line x1="248" y1="212" x2="272" y2="212"/>
    <path d="M248 230 C200 230 170 260 170 290"/><path d="M272 230 C320 230 350 260 350 290"/>
    <path d="M170 290 Q185 310 175 330"/><path d="M350 290 Q335 310 345 330"/>
    <path d="M175 330 C165 370 200 400 260 400 C320 400 355 370 345 330"/>
    <circle cx="260" cy="310" r="30"/>
    <line x1="235" y1="365" x2="285" y2="365"/>
    <line x1="255" y1="110" x2="255" y2="365"/><line x1="265" y1="110" x2="265" y2="365"/>`,
  jellyfish: `<path d="M170 170 A90 90 0 0 1 350 170"/>
    <path d="M170 170 Q195 195 220 175 Q240 165 260 180 Q280 165 300 175 Q325 195 350 170"/>
    <path d="M220 155 A40 40 0 0 1 300 155"/>
    <circle cx="238" cy="145" r="8"/><circle cx="282" cy="145" r="8"/>
    <path d="M248 158 A12 12 0 0 0 272 158"/>
    <path d="M190 185 C180 230 195 280 175 340 Q170 360 180 370"/>
    <path d="M220 180 C215 240 230 290 210 360 Q205 380 215 385"/>
    <path d="M250 182 C248 230 255 290 240 370 Q237 390 248 390"/>
    <path d="M270 182 C275 230 270 290 285 370 Q290 390 280 390"/>
    <path d="M300 180 C310 240 295 290 315 360 Q320 380 310 385"/>
    <path d="M330 185 C340 230 325 280 345 340 Q350 360 340 370"/>
    <circle cx="220" cy="120" r="5"/><circle cx="260" cy="110" r="5"/><circle cx="300" cy="120" r="5"/>`,
  get sunflower() {
    let petals = "";
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
      const px = 260 + 45 * Math.cos(a);
      const py = 190 + 45 * Math.sin(a);
      const ex = 260 + 85 * Math.cos(a);
      const ey = 190 + 85 * Math.sin(a);
      const cpx1 = 260 + 65 * Math.cos(a - 0.25);
      const cpy1 = 190 + 65 * Math.sin(a - 0.25);
      const cpx2 = 260 + 65 * Math.cos(a + 0.25);
      const cpy2 = 190 + 65 * Math.sin(a + 0.25);
      petals += `<path d="M${px} ${py} Q${cpx1} ${cpy1} ${ex} ${ey} Q${cpx2} ${cpy2} ${px} ${py}"/>`;
    }
    return `<circle cx="260" cy="190" r="40"/><circle cx="260" cy="190" r="25"/>
      <circle cx="250" cy="182" r="3"/><circle cx="270" cy="182" r="3"/>
      <circle cx="260" cy="198" r="3"/><circle cx="248" cy="195" r="3"/><circle cx="272" cy="195" r="3"/>
      ${petals}
      <path d="M255 275 Q250 340 255 400"/><path d="M265 275 Q270 340 265 400"/>
      <path d="M255 330 Q200 310 180 330 Q200 345 255 340"/>
      <path d="M265 350 Q320 335 340 350 Q320 365 265 358"/>
      <line x1="255" y1="335" x2="195" y2="330"/><line x1="265" y1="354" x2="325" y2="350"/>`;
  },
  pirateship: `<path d="M80 280 L60 320 L100 350 L420 350 L460 320 L440 280"/>
    <line x1="80" y1="280" x2="440" y2="280"/>
    <line x1="75" y1="305" x2="445" y2="305"/>
    <path d="M80 280 Q50 260 40 240"/>
    <path d="M440 280 L460 260 L460 290"/>
    <line x1="260" y1="280" x2="260" y2="60"/><line x1="160" y1="280" x2="160" y2="110"/>
    <line x1="200" y1="90" x2="320" y2="90"/><line x1="195" y1="180" x2="325" y2="180"/>
    <path d="M200 90 Q195 135 195 180"/><path d="M320 90 Q325 135 325 180"/>
    <line x1="115" y1="130" x2="205" y2="130"/><line x1="110" y1="210" x2="210" y2="210"/>
    <path d="M115 130 Q110 170 110 210"/><path d="M205 130 Q210 170 210 210"/>
    <path d="M245 65 L275 65 L278 80 L242 80 Z"/>
    <line x1="260" y1="60" x2="260" y2="35"/>
    <path d="M260 35 L295 35 L295 55 L260 55"/>
    <circle cx="278" cy="43" r="6"/><line x1="272" y1="49" x2="284" y2="49"/>
    <path d="M40 365 Q110 355 180 365"/><path d="M230 370 Q300 360 370 370"/><path d="M400 365 Q440 358 480 365"/>
    <circle cx="180" cy="300" r="6"/><circle cx="260" cy="300" r="6"/><circle cx="340" cy="300" r="6"/>`,
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
  const width = 1200;
  const height = 630;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const c = canvas.getContext("2d");

  const white = "#ffffff";
  const bg = "#f5f6f8";
  const text = "#0f1419";
  const textMuted = "#6b7280";
  const green = "#10b856";
  const greenLight = "rgba(16, 184, 86, 0.10)";
  const greenDim = "#e2f5ea";
  const cardBg = "#ffffff";
  const border = "rgba(0,0,0,0.06)";
  const pad = 40;

  // ── Background ──
  c.fillStyle = bg;
  c.fillRect(0, 0, width, height);

  // ── Main card ──
  const cardX = pad;
  const cardY = pad;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;
  c.save();
  roundRect(c, cardX, cardY, cardW, cardH, 28);
  c.fillStyle = cardBg;
  c.fill();
  c.shadowColor = "rgba(0,0,0,0.08)";
  c.shadowBlur = 30;
  c.shadowOffsetY = 8;
  c.fill();
  c.restore();

  // ── Top section: Brand + Date ──
  c.fillStyle = text;
  c.font = "800 28px system-ui, -apple-system, sans-serif";
  c.fillText("Drawdle", cardX + 44, cardY + 52);

  c.fillStyle = textMuted;
  c.font = "500 16px system-ui, -apple-system, sans-serif";
  const dateText = formatDate();
  const dateW = c.measureText(dateText).width;
  c.fillText(dateText, cardX + cardW - 44 - dateW, cardY + 52);

  // Divider line
  c.beginPath();
  c.moveTo(cardX + 44, cardY + 72);
  c.lineTo(cardX + cardW - 44, cardY + 72);
  c.strokeStyle = border;
  c.lineWidth = 1;
  c.stroke();

  // ── Left half: Score area ──
  const leftW = cardW * 0.42;
  const contentY = cardY + 96;

  // Prompt title
  c.fillStyle = textMuted;
  c.font = "600 15px system-ui, -apple-system, sans-serif";
  c.fillText("TODAY'S PROMPT", cardX + 44, contentY);

  c.fillStyle = text;
  c.font = "700 32px system-ui, -apple-system, sans-serif";
  c.fillText(dailyPrompt.title, cardX + 44, contentY + 40);

  // Big score with green accent pill behind
  const scoreStr = String(score);
  c.font = "800 120px system-ui, -apple-system, sans-serif";
  const scoreTextW = c.measureText(scoreStr).width;
  const scoreCenterX = cardX + 44 + (leftW - 44) / 2;
  const scoreX = scoreCenterX - scoreTextW / 2;
  const scoreBaseY = contentY + 170;

  // Green glow circle behind score
  const glowGrad = c.createRadialGradient(scoreCenterX, scoreBaseY - 40, 0, scoreCenterX, scoreBaseY - 40, 100);
  glowGrad.addColorStop(0, "rgba(16, 184, 86, 0.12)");
  glowGrad.addColorStop(1, "rgba(16, 184, 86, 0)");
  c.fillStyle = glowGrad;
  c.beginPath();
  c.arc(scoreCenterX, scoreBaseY - 40, 100, 0, Math.PI * 2);
  c.fill();

  c.fillStyle = green;
  c.font = "800 120px system-ui, -apple-system, sans-serif";
  c.fillText(scoreStr, scoreX, scoreBaseY);

  // /100
  c.fillStyle = textMuted;
  c.font = "600 26px system-ui, -apple-system, sans-serif";
  c.fillText("/ 100", scoreX + scoreTextW + 8, scoreBaseY - 4);

  // Feedback text
  const feedback = getScoreFeedbackText(score);
  c.fillStyle = textMuted;
  c.font = "italic 500 17px system-ui, -apple-system, sans-serif";
  c.fillText(`"${feedback}"`, cardX + 44, scoreBaseY + 40);

  // Grid blocks
  const blockSize = 28;
  const blockGap = 8;
  const totalBlockW = shareGridLength * blockSize + (shareGridLength - 1) * blockGap;
  const blockStartX = cardX + 44;
  const blockY = scoreBaseY + 68;
  const filled = Math.min(shareGridLength, Math.max(0, Math.round((score / 100) * shareGridLength)));
  for (let i = 0; i < shareGridLength; i++) {
    const bx = blockStartX + i * (blockSize + blockGap);
    roundRect(c, bx, blockY, blockSize, blockSize, 6);
    c.fillStyle = i < filled ? green : greenDim;
    c.fill();
  }

  // Stats line
  const stats = loadStats();
  c.fillStyle = textMuted;
  c.font = "500 14px system-ui, -apple-system, sans-serif";
  c.fillText(`Streak ${stats.streak}  ·  ${stats.plays} played`, blockStartX, blockY + blockSize + 28);

  // ── Right half: Side-by-side drawings ──
  const rightX = cardX + leftW + 20;
  const rightW = cardW - leftW - 64;
  const drawGap = 14;
  const drawW = Math.floor((rightW - drawGap) / 2);
  const drawTop = contentY - 6;
  const drawH = cardH - (contentY - cardY) - 44;

  const drawArtPanel = (px, label, renderFn) => {
    // Card
    roundRect(c, px, drawTop, drawW, drawH, 16);
    c.fillStyle = bg;
    c.fill();
    c.strokeStyle = border;
    c.lineWidth = 1;
    c.stroke();

    // Label
    c.fillStyle = textMuted;
    c.font = "700 11px system-ui, -apple-system, sans-serif";
    c.fillText(label.toUpperCase(), px + 14, drawTop + 22);

    // Art area
    const artX = px + 10;
    const artY = drawTop + 34;
    const artW = drawW - 20;
    const artH = drawH - 44;

    c.save();
    roundRect(c, artX, artY, artW, artH, 10);
    renderFn(artX, artY, artW, artH);
    c.restore();
  };

  // User drawing
  drawArtPanel(rightX, "Yours", (ax, ay, aw, ah) => {
    c.fillStyle = white;
    c.fill();
    c.clip();
    const savedDrawing = localStorage.getItem("drawdleLastDrawing");
    if (savedDrawing) {
      // Use saved image — drawImage with HTMLImageElement is sync if already loaded
      // Fall back to live canvas
    }
    const s = Math.min(aw / drawCanvas.width, ah / drawCanvas.height);
    const ox = ax + (aw - drawCanvas.width * s) / 2;
    const oy = ay + (ah - drawCanvas.height * s) / 2;
    c.drawImage(drawCanvas, ox, oy, drawCanvas.width * s, drawCanvas.height * s);
  });

  // Reference
  drawArtPanel(rightX + drawW + drawGap, "Reference", (ax, ay, aw, ah) => {
    c.fillStyle = white;
    c.fill();
    c.clip();
    const s = Math.min(aw / drawCanvas.width, ah / drawCanvas.height);
    const ox = ax + (aw - drawCanvas.width * s) / 2;
    const oy = ay + (ah - drawCanvas.height * s) / 2;
    c.save();
    c.translate(ox, oy);
    c.scale(s, s);
    c.lineWidth = 10 / s;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.strokeStyle = "#151720";
    if (promptDrawFns[dailyPrompt.key]) promptDrawFns[dailyPrompt.key](c);
    c.restore();
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
  scoreFeedbackEl.textContent = getScoreFeedbackText(score);
}

function getScoreFeedbackText(score) {
  if (score >= 95) return "Pixel perfect. Are you a printer?";
  if (score >= 90) return "Basically traced it. Incredible.";
  if (score >= 85) return "So close it's scary. Well done.";
  if (score >= 80) return "Impressive eye. Solid lines.";
  if (score >= 75) return "You've got the touch.";
  if (score >= 70) return "Looking sharp. Almost there.";
  if (score >= 65) return "Not bad at all. The shapes are there.";
  if (score >= 60) return "Getting warmer. You see it.";
  if (score >= 50) return "Halfway hero. Room to grow.";
  if (score >= 40) return "Rough sketch energy. Keep at it.";
  if (score >= 25) return "Bold attempt. Tomorrow's your day.";
  return "Abstract art has entered the chat.";
}

function populateResultsModal(score, stats) {
  resultsScoreBig.textContent = score;
  resultsPrompt.textContent = dailyPrompt.title;
  resultsFeedback.textContent = getScoreFeedbackText(score);
  // Grid visual
  resultsGridVisual.innerHTML = "";
  const filled = Math.min(shareGridLength, Math.max(0, Math.round((score / 100) * shareGridLength)));
  for (let i = 0; i < shareGridLength; i++) {
    const block = document.createElement("div");
    block.className = `share-block ${i < filled ? "filled" : "empty"}`;
    resultsGridVisual.appendChild(block);
  }
  // Badges
  renderBadges(resultsBadges, stats, score);
  // Draw user's drawing onto modal canvas
  const uCtx = resultsUserCanvas.getContext("2d");
  uCtx.clearRect(0, 0, resultsUserCanvas.width, resultsUserCanvas.height);
  // Try saved drawing first (for page reload), fall back to live canvas
  const savedDrawing = localStorage.getItem("drawdleLastDrawing");
  if (savedDrawing) {
    const img = new Image();
    img.onload = () => uCtx.drawImage(img, 0, 0);
    img.src = savedDrawing;
  } else {
    uCtx.drawImage(drawCanvas, 0, 0);
  }
  // Draw reference onto modal canvas
  const rCtx = resultsRefCanvas.getContext("2d");
  rCtx.clearRect(0, 0, resultsRefCanvas.width, resultsRefCanvas.height);
  rCtx.fillStyle = "#fff";
  rCtx.fillRect(0, 0, resultsRefCanvas.width, resultsRefCanvas.height);
  drawReference(rCtx);
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
  if (roundLocked) return;
  event.preventDefault();
  startDraw(event);
});

drawCanvas.addEventListener("touchmove", (event) => {
  if (roundLocked) return;
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

// Results modal
closeResultsBtn.addEventListener("click", () => {
  closeModal(resultsModal);
});

resultsModal.addEventListener("click", (event) => {
  if (event.target === resultsModal) {
    closeModal(resultsModal);
  }
});

resultsModal.addEventListener("keydown", (e) => {
  trapModalFocus(e, resultsModal);
  if (e.key === "Escape") closeModal(resultsModal);
});

resultsShareBtn.addEventListener("click", () => {
  shareResultUnified();
});

resultsCopyBtn.addEventListener("click", () => {
  const score = scoreValue.textContent;
  const siteUrl = `${window.location.origin}${window.location.pathname}`;
  const text = `Drawdle · ${dailyPrompt.title}\nScore: ${score}\n${buildShareGrid(score)}\nTry it: ${siteUrl}`;
  navigator.clipboard.writeText(text);
  resultsCopyBtn.textContent = "Copied!";
  setTimeout(() => {
    resultsCopyBtn.textContent = "Copy";
  }, 1500);
});

resultsDownloadBtn.addEventListener("click", downloadCard);


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
