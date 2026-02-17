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
  { key: "rocket", title: "Rocket Ship", hint: "I eat fire for breakfast and touch the stars by dinner" },
  { key: "octopus", title: "Octopus", hint: "Eight arms, three hearts, and a beak you'd never expect" },
  { key: "pizza", title: "Pizza Slice", hint: "Born round, boxed square, eaten as a triangle" },
  { key: "dragon", title: "Dragon", hint: "I breathe fire but I'm not a volcano, I fly but I'm not a bird" },
  { key: "penguin", title: "Penguin", hint: "I wear a tuxedo every day but I've never been to a party" },
  { key: "ufo", title: "Flying Saucer", hint: "Nobody believes you saw me, but check the sky at midnight" },
  { key: "skull", title: "Skeleton Skull", hint: "I'm the last face you'll ever make, and I'm always grinning" },
  { key: "palmtree", title: "Palm Tree", hint: "I stand on one leg with a wild green hairdo" },
  { key: "robot", title: "Dancing Robot", hint: "I have a brain of metal and a heart of circuits" },
  { key: "flamingo", title: "Flamingo", hint: "I'm pink because of my diet and I sleep on one leg" },
  { key: "volcano", title: "Volcano", hint: "I'm a mountain with anger issues and a lava lamp inside" },
  { key: "sword", title: "Battle Sword", hint: "Knights carried me, pirates swung me, Jedi upgraded me" },
  { key: "mushroom", title: "Mushroom", hint: "I pop up after rain, some feed you, some end you" },
  { key: "icecream", title: "Ice Cream Cone", hint: "I'm cold, I'm sweet, and I'm always having a meltdown" },
  { key: "castle", title: "Castle", hint: "I have towers but no cell service, walls but no paint" },
  { key: "cat", title: "Sneaky Kitten", hint: "I knock things off tables for sport and judge you silently" },
  { key: "anchor", title: "Anchor", hint: "I hold giants still but I live at the bottom of the sea" },
  { key: "lightning", title: "Lightning Bolt", hint: "I'm gone before you hear me and I never strike twice, they say" },
  { key: "crown", title: "Golden Crown", hint: "I sit on heads but I'm not a hat, I'm heavier than I look" },
  { key: "ghost", title: "Spooky Ghost", hint: "I walk through walls, rattle chains, and say one word a lot" },
  { key: "hotdog", title: "Hot Dog Stand", hint: "I'm a sausage in a sleeping bag at every baseball game" },
  { key: "dinosaur", title: "Tyrannosaurus", hint: "Tiny arms and big dreams sixty-five million years ago" },
  { key: "sailboat", title: "Sailboat", hint: "I catch wind for a living and never need gasoline" },
  { key: "owl", title: "Midnight Owl", hint: "I spin my head almost all the way around and hunt at midnight" },
  { key: "diamond", title: "Diamond", hint: "I started as coal, took a billion years, now I'm on a ring" },
  { key: "butterfly", title: "Butterfly", hint: "I was a caterpillar once, now I paint the sky" },
  { key: "guitar", title: "Guitar", hint: "Six strings, one hole, infinite songs — strum me" },
  { key: "jellyfish", title: "Jellyfish", hint: "No brain, no heart, no blood — but I can still sting you" },
  { key: "sunflower", title: "Sunflower", hint: "Taller than you, I follow the sun, my face is full of seeds" },
  { key: "pirateship", title: "Pirate Ship", hint: "I fly a skull-and-crossbones flag and my crew says arrr" },
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

function maskWord(title) {
  const seed = getTodayKey().split("-").join("");
  let s = 0;
  for (let i = 0; i < seed.length; i++) {
    s = ((s << 5) - s + seed.charCodeAt(i)) | 0;
  }
  s = Math.abs(s) >>> 0;
  function nextRand() {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const words = title.split(/\s+/);
  const masked = words.map(word => {
    const letters = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (letters.length <= 2) return letters;
    const reveal = Math.min(2, letters.length);
    const indices = new Set();
    while (indices.size < reveal) {
      indices.add(Math.floor(nextRand() * letters.length));
    }
    return letters.split("").map((ch, i) => indices.has(i) ? ch : "*").join("");
  });
  return masked.join(" ");
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
    promptTitleEl.textContent = dailyPrompt.title;
    if (readyPromptLabel) readyPromptLabel.textContent = dailyPrompt.title;
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
  promptTitleEl.textContent = dailyPrompt.title;
  if (readyPromptLabel) readyPromptLabel.textContent = dailyPrompt.title;
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
    c.beginPath(); c.moveTo(218, 364); c.lineTo(218, 112);
    c.quadraticCurveTo(218, 28, 260, -14);
    c.quadraticCurveTo(302, 28, 302, 112); c.lineTo(302, 364); c.stroke();
    // nose cone tip
    c.beginPath(); c.moveTo(260, -14); c.lineTo(246, 14); c.stroke();
    c.beginPath(); c.moveTo(260, -14); c.lineTo(274, 14); c.stroke();
    // left fin
    c.beginPath(); c.moveTo(218, 308); c.lineTo(162, 392);
    c.lineTo(218, 364); c.stroke();
    // right fin
    c.beginPath(); c.moveTo(302, 308); c.lineTo(358, 392);
    c.lineTo(302, 364); c.stroke();
    // window
    c.beginPath(); c.arc(260, 168, 31, 0, Math.PI * 2); c.stroke();
    // window inner
    c.beginPath(); c.arc(260, 168, 20, 0, Math.PI * 2); c.stroke();
    // body stripe
    c.beginPath(); c.moveTo(218, 266); c.lineTo(302, 266); c.stroke();
    c.beginPath(); c.moveTo(218, 287); c.lineTo(302, 287); c.stroke();
    // exhaust flames
    c.beginPath(); c.moveTo(232, 364); c.quadraticCurveTo(239, 420, 260, 462); c.stroke();
    c.beginPath(); c.moveTo(288, 364); c.quadraticCurveTo(281, 420, 260, 462); c.stroke();
    c.beginPath(); c.moveTo(246, 364); c.quadraticCurveTo(253, 406, 260, 434); c.stroke();
    c.beginPath(); c.moveTo(274, 364); c.quadraticCurveTo(267, 406, 260, 434); c.stroke();
    // stars
    c.beginPath(); c.arc(120, 56, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(414, 126, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(106, 266, 4, 0, Math.PI * 2); c.stroke();
  },
  octopus(c) {
    // head
    c.beginPath(); c.ellipse(260, 135, 100, 88, 0, 0, Math.PI * 2); c.stroke();
    // eyes
    c.beginPath(); c.arc(223, 123, 19, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(298, 123, 19, 0, Math.PI * 2); c.stroke();
    // pupils
    c.beginPath(); c.arc(226, 120, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(301, 120, 8, 0, Math.PI * 2); c.stroke();
    // mouth
    c.beginPath(); c.arc(260, 160, 13, 0.2, Math.PI - 0.2); c.stroke();
    // tentacle 1
    c.beginPath(); c.moveTo(179, 198); c.bezierCurveTo(123, 260, 85, 323, 110, 385);
    c.quadraticCurveTo(123, 410, 141, 391); c.stroke();
    // tentacle 2
    c.beginPath(); c.moveTo(198, 210); c.bezierCurveTo(160, 285, 135, 360, 173, 410);
    c.quadraticCurveTo(185, 429, 198, 410); c.stroke();
    // tentacle 3
    c.beginPath(); c.moveTo(229, 216); c.bezierCurveTo(210, 298, 198, 373, 223, 423);
    c.quadraticCurveTo(235, 441, 248, 423); c.stroke();
    // tentacle 4
    c.beginPath(); c.moveTo(254, 220); c.bezierCurveTo(248, 298, 241, 385, 266, 435);
    c.quadraticCurveTo(279, 448, 285, 429); c.stroke();
    // tentacle 5
    c.beginPath(); c.moveTo(279, 220); c.bezierCurveTo(291, 298, 304, 385, 316, 429);
    c.quadraticCurveTo(329, 448, 335, 423); c.stroke();
    // tentacle 6
    c.beginPath(); c.moveTo(304, 216); c.bezierCurveTo(335, 285, 360, 360, 348, 410);
    c.quadraticCurveTo(341, 429, 329, 404); c.stroke();
    // tentacle 7
    c.beginPath(); c.moveTo(323, 210); c.bezierCurveTo(360, 273, 398, 335, 391, 391);
    c.quadraticCurveTo(388, 416, 373, 391); c.stroke();
    // tentacle 8
    c.beginPath(); c.moveTo(341, 198); c.bezierCurveTo(398, 248, 435, 310, 416, 373);
    c.quadraticCurveTo(410, 398, 398, 373); c.stroke();
    // suction cups on tentacle 1
    c.beginPath(); c.arc(116, 335, 5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(108, 366, 5, 0, Math.PI * 2); c.stroke();
  },
  pizza(c) {
    // outer crust arc
    c.beginPath(); c.moveTo(116, 78); c.lineTo(260, 414); c.lineTo(404, 78); c.stroke();
    // crust top
    c.beginPath(); c.arc(260, 78, 144, Math.PI, 0); c.stroke();
    // inner crust line
    c.beginPath(); c.arc(260, 88, 130, Math.PI + 0.1, -0.1); c.stroke();
    // pepperoni 1
    c.beginPath(); c.arc(236, 174, 19, 0, Math.PI * 2); c.stroke();
    // pepperoni 2
    c.beginPath(); c.arc(296, 222, 17, 0, Math.PI * 2); c.stroke();
    // pepperoni 3
    c.beginPath(); c.arc(212, 270, 18, 0, Math.PI * 2); c.stroke();
    // pepperoni 4
    c.beginPath(); c.arc(272, 318, 16, 0, Math.PI * 2); c.stroke();
    // mushroom
    c.beginPath(); c.arc(320, 150, 14, Math.PI, 0); c.stroke();
    c.beginPath(); c.moveTo(313, 150); c.lineTo(315, 168); c.stroke();
    c.beginPath(); c.moveTo(327, 150); c.lineTo(325, 168); c.stroke();
    // olive
    c.beginPath(); c.arc(188, 186, 12, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(188, 186, 5, 0, Math.PI * 2); c.stroke();
    // cheese drip
    c.beginPath(); c.moveTo(260, 408); c.quadraticCurveTo(254, 432, 260, 438); c.stroke();
  },
  dragon(c) {
    // head
    c.beginPath(); c.ellipse(145, 118, 52, 40, -0.2, 0, Math.PI * 2); c.stroke();
    // snout
    c.beginPath(); c.moveTo(97, 107); c.lineTo(70, 101); c.lineTo(70, 124); c.lineTo(97, 127); c.stroke();
    // eye
    c.beginPath(); c.arc(134, 107, 9, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(136, 105, 3, 0, Math.PI * 2); c.stroke();
    // horn left
    c.beginPath(); c.moveTo(134, 84); c.lineTo(116, 43); c.lineTo(139, 72); c.stroke();
    // horn right
    c.beginPath(); c.moveTo(162, 81); c.lineTo(174, 38); c.lineTo(168, 74); c.stroke();
    // nostril flame
    c.beginPath(); c.moveTo(70, 107); c.quadraticCurveTo(42, 95, 30, 112);
    c.quadraticCurveTo(24, 130, 47, 130); c.stroke();
    // neck
    c.beginPath(); c.moveTo(180, 141); c.quadraticCurveTo(214, 176, 237, 199); c.stroke();
    c.beginPath(); c.moveTo(162, 153); c.quadraticCurveTo(203, 193, 226, 216); c.stroke();
    // body
    c.beginPath(); c.moveTo(237, 199);
    c.bezierCurveTo(306, 187, 364, 210, 387, 256);
    c.quadraticCurveTo(404, 296, 387, 325); c.stroke();
    c.beginPath(); c.moveTo(226, 216);
    c.bezierCurveTo(283, 222, 352, 245, 375, 291);
    c.quadraticCurveTo(387, 325, 369, 342); c.stroke();
    // wing
    c.beginPath(); c.moveTo(272, 199); c.lineTo(318, 95); c.lineTo(375, 118);
    c.lineTo(421, 84); c.lineTo(398, 176); c.lineTo(364, 210); c.stroke();
    // wing membrane lines
    c.beginPath(); c.moveTo(318, 95); c.lineTo(341, 187); c.stroke();
    c.beginPath(); c.moveTo(375, 118); c.lineTo(375, 199); c.stroke();
    // belly
    c.beginPath(); c.moveTo(260, 227); c.lineTo(260, 262); c.stroke();
    c.beginPath(); c.moveTo(283, 233); c.lineTo(283, 273); c.stroke();
    c.beginPath(); c.moveTo(306, 239); c.lineTo(306, 285); c.stroke();
    // front leg
    c.beginPath(); c.moveTo(272, 256); c.lineTo(260, 337); c.lineTo(237, 348);
    c.moveTo(260, 337); c.lineTo(272, 354); c.stroke();
    // back leg
    c.beginPath(); c.moveTo(352, 291); c.lineTo(364, 360); c.lineTo(346, 371);
    c.moveTo(364, 360); c.lineTo(381, 371); c.stroke();
    // tail
    c.beginPath(); c.moveTo(387, 325);
    c.bezierCurveTo(410, 360, 444, 371, 467, 348);
    c.quadraticCurveTo(490, 325, 479, 308); c.stroke();
    // tail spike
    c.beginPath(); c.moveTo(479, 308); c.lineTo(496, 291); c.lineTo(473, 302); c.stroke();
    // neck spines
    c.beginPath(); c.moveTo(191, 153); c.lineTo(185, 139); c.stroke();
    c.beginPath(); c.moveTo(208, 170); c.lineTo(200, 156); c.stroke();
  },
  penguin(c) {
    // body
    c.beginPath(); c.ellipse(260, 264, 95, 149, 0, 0, Math.PI * 2); c.stroke();
    // belly
    c.beginPath(); c.ellipse(260, 284, 61, 115, 0, 0, Math.PI * 2); c.stroke();
    // head
    c.beginPath(); c.arc(260, 116, 61, 0, Math.PI * 2); c.stroke();
    // left eye
    c.beginPath(); c.arc(236, 105, 11, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(238, 103, 4, 0, Math.PI * 2); c.stroke();
    // right eye
    c.beginPath(); c.arc(284, 105, 11, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(287, 103, 4, 0, Math.PI * 2); c.stroke();
    // beak
    c.beginPath(); c.moveTo(249, 126); c.lineTo(260, 153); c.lineTo(271, 126); c.stroke();
    // left wing
    c.beginPath(); c.moveTo(168, 197);
    c.quadraticCurveTo(118, 278, 139, 359); c.stroke();
    // right wing
    c.beginPath(); c.moveTo(352, 197);
    c.quadraticCurveTo(402, 278, 382, 359); c.stroke();
    // left foot
    c.beginPath(); c.moveTo(220, 406); c.lineTo(193, 433); c.lineTo(233, 433); c.lineTo(247, 410); c.stroke();
    // right foot
    c.beginPath(); c.moveTo(301, 406); c.lineTo(287, 433); c.lineTo(328, 433); c.lineTo(301, 410); c.stroke();
    // bow tie
    c.beginPath(); c.moveTo(260, 176); c.lineTo(240, 163); c.lineTo(240, 190);
    c.lineTo(260, 176); c.lineTo(280, 163); c.lineTo(280, 190); c.closePath(); c.stroke();
  },
  ufo(c) {
    // dome
    c.beginPath(); c.arc(260, 186, 72, Math.PI, 0); c.stroke();
    // dome inner
    c.beginPath(); c.arc(260, 186, 54, Math.PI + 0.2, -0.2); c.stroke();
    // main saucer body
    c.beginPath(); c.ellipse(260, 198, 168, 42, 0, 0, Math.PI * 2); c.stroke();
    // bottom rim
    c.beginPath(); c.ellipse(260, 210, 144, 30, 0, 0.1, Math.PI - 0.1); c.stroke();
    // windows on dome
    c.beginPath(); c.arc(224, 168, 10, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 162, 10, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(296, 168, 10, 0, Math.PI * 2); c.stroke();
    // lights on rim
    c.beginPath(); c.arc(152, 198, 7, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(206, 206, 7, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 210, 7, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(314, 206, 7, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(368, 198, 7, 0, Math.PI * 2); c.stroke();
    // beam
    c.beginPath(); c.moveTo(212, 234); c.lineTo(164, 414); c.stroke();
    c.beginPath(); c.moveTo(308, 234); c.lineTo(356, 414); c.stroke();
    // beam bottom
    c.beginPath(); c.moveTo(164, 414); c.lineTo(356, 414); c.stroke();
    // beam lines
    c.beginPath(); c.moveTo(230, 270); c.lineTo(290, 270); c.stroke();
    c.beginPath(); c.moveTo(206, 342); c.lineTo(314, 342); c.stroke();
    // antenna
    c.beginPath(); c.moveTo(260, 114); c.lineTo(260, 90); c.stroke();
    c.beginPath(); c.arc(260, 85, 6, 0, Math.PI * 2); c.stroke();
  },
  skull(c) {
    // cranium
    c.beginPath(); c.arc(260, 171, 117, Math.PI, 0); c.stroke();
    // sides of skull
    c.beginPath(); c.moveTo(143, 171); c.lineTo(143, 249);
    c.quadraticCurveTo(143, 288, 169, 301); c.stroke();
    c.beginPath(); c.moveTo(377, 171); c.lineTo(377, 249);
    c.quadraticCurveTo(377, 288, 351, 301); c.stroke();
    // cheekbones
    c.beginPath(); c.moveTo(169, 301); c.lineTo(176, 288); c.lineTo(208, 301); c.stroke();
    c.beginPath(); c.moveTo(351, 301); c.lineTo(345, 288); c.lineTo(312, 301); c.stroke();
    // jaw
    c.beginPath(); c.moveTo(208, 301); c.lineTo(195, 340);
    c.quadraticCurveTo(195, 379, 221, 379); c.lineTo(299, 379);
    c.quadraticCurveTo(325, 379, 325, 340); c.lineTo(312, 301); c.stroke();
    // left eye socket
    c.beginPath(); c.ellipse(215, 197, 36, 39, 0, 0, Math.PI * 2); c.stroke();
    // right eye socket
    c.beginPath(); c.ellipse(306, 197, 36, 39, 0, 0, Math.PI * 2); c.stroke();
    // nose
    c.beginPath(); c.moveTo(250, 249); c.lineTo(244, 282); c.lineTo(260, 288); c.lineTo(276, 282); c.lineTo(270, 249); c.stroke();
    // teeth
    c.beginPath(); c.moveTo(208, 327); c.lineTo(312, 327); c.stroke();
    c.beginPath(); c.moveTo(228, 327); c.lineTo(228, 379); c.stroke();
    c.beginPath(); c.moveTo(250, 327); c.lineTo(250, 379); c.stroke();
    c.beginPath(); c.moveTo(270, 327); c.lineTo(270, 379); c.stroke();
    c.beginPath(); c.moveTo(293, 327); c.lineTo(293, 379); c.stroke();
    // temple detail
    c.beginPath(); c.moveTo(150, 145); c.quadraticCurveTo(156, 158, 153, 178); c.stroke();
    c.beginPath(); c.moveTo(371, 145); c.quadraticCurveTo(364, 158, 367, 178); c.stroke();
  },
  palmtree(c) {
    // trunk
    c.beginPath(); c.moveTo(243, 417); c.quadraticCurveTo(237, 314, 254, 199);
    c.quadraticCurveTo(266, 153, 260, 130); c.stroke();
    c.beginPath(); c.moveTo(277, 417); c.quadraticCurveTo(272, 314, 277, 199);
    c.quadraticCurveTo(283, 153, 272, 130); c.stroke();
    // trunk segments
    c.beginPath(); c.moveTo(245, 371); c.lineTo(275, 371); c.stroke();
    c.beginPath(); c.moveTo(246, 325); c.lineTo(276, 325); c.stroke();
    c.beginPath(); c.moveTo(251, 279); c.lineTo(278, 279); c.stroke();
    c.beginPath(); c.moveTo(255, 233); c.lineTo(278, 233); c.stroke();
    c.beginPath(); c.moveTo(259, 193); c.lineTo(277, 193); c.stroke();
    // frond 1 (right)
    c.beginPath(); c.moveTo(266, 130);
    c.bezierCurveTo(329, 95, 410, 84, 456, 118); c.stroke();
    c.beginPath(); c.moveTo(341, 89); c.lineTo(352, 107); c.stroke();
    c.beginPath(); c.moveTo(387, 84); c.lineTo(392, 104); c.stroke();
    c.beginPath(); c.moveTo(427, 93); c.lineTo(427, 113); c.stroke();
    // frond 2 (left)
    c.beginPath(); c.moveTo(266, 130);
    c.bezierCurveTo(191, 95, 111, 89, 65, 130); c.stroke();
    c.beginPath(); c.moveTo(180, 93); c.lineTo(174, 112); c.stroke();
    c.beginPath(); c.moveTo(134, 89); c.lineTo(131, 109); c.stroke();
    c.beginPath(); c.moveTo(93, 101); c.lineTo(93, 120); c.stroke();
    // frond 3 (right drooping)
    c.beginPath(); c.moveTo(266, 130);
    c.bezierCurveTo(318, 130, 398, 153, 433, 199); c.stroke();
    c.beginPath(); c.moveTo(352, 139); c.lineTo(358, 158); c.stroke();
    c.beginPath(); c.moveTo(392, 155); c.lineTo(396, 176); c.stroke();
    // frond 4 (left drooping)
    c.beginPath(); c.moveTo(266, 130);
    c.bezierCurveTo(214, 130, 134, 158, 99, 204); c.stroke();
    c.beginPath(); c.moveTo(168, 147); c.lineTo(165, 166); c.stroke();
    c.beginPath(); c.moveTo(128, 166); c.lineTo(125, 187); c.stroke();
    // coconuts
    c.beginPath(); c.arc(254, 141, 12, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(277, 139, 12, 0, Math.PI * 2); c.stroke();
  },
  robot(c) {
    // head
    c.beginPath(); c.rect(200, 54, 120, 96); c.stroke();
    // antenna
    c.beginPath(); c.moveTo(260, 54); c.lineTo(260, 24); c.stroke();
    c.beginPath(); c.arc(260, 16, 8, 0, Math.PI * 2); c.stroke();
    // eyes
    c.beginPath(); c.rect(222, 84, 24, 24); c.stroke();
    c.beginPath(); c.rect(274, 84, 24, 24); c.stroke();
    // pupils
    c.beginPath(); c.arc(234, 96, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(286, 96, 6, 0, Math.PI * 2); c.stroke();
    // mouth
    c.beginPath(); c.moveTo(230, 126); c.lineTo(290, 126); c.stroke();
    c.beginPath(); c.moveTo(242, 126); c.lineTo(242, 136); c.stroke();
    c.beginPath(); c.moveTo(260, 126); c.lineTo(260, 136); c.stroke();
    c.beginPath(); c.moveTo(278, 126); c.lineTo(278, 136); c.stroke();
    // neck
    c.beginPath(); c.moveTo(242, 150); c.lineTo(242, 174); c.lineTo(278, 174); c.lineTo(278, 150); c.stroke();
    // body
    c.beginPath(); c.rect(182, 174, 156, 156); c.stroke();
    // chest panel
    c.beginPath(); c.rect(212, 198, 96, 72); c.stroke();
    // chest buttons
    c.beginPath(); c.arc(236, 222, 10, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(272, 222, 10, 0, Math.PI * 2); c.stroke();
    // chest meter
    c.beginPath(); c.moveTo(224, 252); c.lineTo(296, 252); c.stroke();
    c.beginPath(); c.moveTo(260, 246); c.lineTo(260, 258); c.stroke();
    // left arm
    c.beginPath(); c.moveTo(182, 192); c.lineTo(134, 192); c.lineTo(134, 294); c.lineTo(158, 294); c.lineTo(158, 210); c.lineTo(182, 210); c.stroke();
    // left claw
    c.beginPath(); c.moveTo(122, 294); c.lineTo(122, 318); c.stroke();
    c.beginPath(); c.moveTo(158, 294); c.lineTo(158, 318); c.stroke();
    // right arm
    c.beginPath(); c.moveTo(338, 192); c.lineTo(386, 192); c.lineTo(386, 294); c.lineTo(362, 294); c.lineTo(362, 210); c.lineTo(338, 210); c.stroke();
    // right claw
    c.beginPath(); c.moveTo(362, 294); c.lineTo(362, 318); c.stroke();
    c.beginPath(); c.moveTo(398, 294); c.lineTo(398, 318); c.stroke();
    // left leg
    c.beginPath(); c.moveTo(212, 330); c.lineTo(212, 402); c.lineTo(188, 402); c.lineTo(188, 414); c.lineTo(242, 414); c.lineTo(242, 402); c.lineTo(236, 402); c.lineTo(236, 330); c.stroke();
    // right leg
    c.beginPath(); c.moveTo(284, 330); c.lineTo(284, 402); c.lineTo(278, 402); c.lineTo(278, 414); c.lineTo(332, 414); c.lineTo(332, 402); c.lineTo(308, 402); c.lineTo(308, 330); c.stroke();
    // bolt on head
    c.beginPath(); c.moveTo(194, 96); c.lineTo(206, 96); c.stroke();
    c.beginPath(); c.moveTo(200, 90); c.lineTo(200, 102); c.stroke();
  },
  flamingo(c) {
    // body
    c.beginPath(); c.ellipse(285, 248, 75, 50, 0.3, 0, Math.PI * 2); c.stroke();
    // tail feathers
    c.beginPath(); c.moveTo(354, 229); c.quadraticCurveTo(398, 210, 410, 223); c.stroke();
    c.beginPath(); c.moveTo(354, 241); c.quadraticCurveTo(404, 229, 416, 241); c.stroke();
    // neck
    c.beginPath(); c.moveTo(229, 216);
    c.bezierCurveTo(198, 185, 173, 135, 179, 85);
    c.quadraticCurveTo(183, 54, 204, 48); c.stroke();
    c.beginPath(); c.moveTo(241, 223);
    c.bezierCurveTo(216, 191, 198, 141, 204, 91);
    c.quadraticCurveTo(208, 63, 223, 56); c.stroke();
    // head
    c.beginPath(); c.arc(213, 45, 23, 0, Math.PI * 2); c.stroke();
    // eye
    c.beginPath(); c.arc(204, 40, 5, 0, Math.PI * 2); c.stroke();
    // beak
    c.beginPath(); c.moveTo(193, 50); c.lineTo(158, 60); c.lineTo(158, 54);
    c.lineTo(185, 45); c.stroke();
    // beak bend
    c.beginPath(); c.moveTo(158, 54); c.quadraticCurveTo(150, 58, 148, 63); c.stroke();
    // front leg
    c.beginPath(); c.moveTo(273, 291); c.lineTo(266, 373);
    c.quadraticCurveTo(260, 391, 266, 398); c.stroke();
    c.beginPath(); c.moveTo(254, 398); c.lineTo(285, 398); c.stroke();
    // back leg (bent)
    c.beginPath(); c.moveTo(298, 291); c.lineTo(310, 348);
    c.lineTo(298, 398); c.stroke();
    c.beginPath(); c.moveTo(285, 398); c.lineTo(316, 398); c.stroke();
    // wing detail
    c.beginPath(); c.moveTo(248, 229); c.quadraticCurveTo(285, 216, 335, 229); c.stroke();
    c.beginPath(); c.moveTo(254, 241); c.quadraticCurveTo(291, 233, 341, 245); c.stroke();
  },
  volcano(c) {
    // mountain left slope
    c.beginPath(); c.moveTo(50, 378); c.lineTo(197, 137); c.stroke();
    // mountain right slope
    c.beginPath(); c.moveTo(470, 378); c.lineTo(323, 137); c.stroke();
    // crater rim
    c.beginPath(); c.moveTo(197, 137); c.quadraticCurveTo(260, 158, 323, 137); c.stroke();
    // ground line
    c.beginPath(); c.moveTo(29, 378); c.lineTo(491, 378); c.stroke();
    // lava flow left
    c.beginPath(); c.moveTo(229, 142);
    c.bezierCurveTo(218, 179, 197, 221, 176, 273);
    c.quadraticCurveTo(166, 305, 171, 326); c.stroke();
    // lava flow right
    c.beginPath(); c.moveTo(281, 145);
    c.bezierCurveTo(292, 189, 313, 242, 323, 294);
    c.quadraticCurveTo(328, 326, 323, 347); c.stroke();
    // eruption rocks
    c.beginPath(); c.arc(239, 84, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(276, 63, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(302, 89, 7, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(218, 53, 5, 0, Math.PI * 2); c.stroke();
    // smoke clouds
    c.beginPath(); c.arc(250, 37, 19, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(276, 26, 23, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(302, 42, 17, 0, Math.PI * 2); c.stroke();
    // mountain texture lines
    c.beginPath(); c.moveTo(134, 284); c.lineTo(160, 284); c.stroke();
    c.beginPath(); c.moveTo(355, 294); c.lineTo(386, 294); c.stroke();
    c.beginPath(); c.moveTo(113, 336); c.lineTo(150, 336); c.stroke();
    c.beginPath(); c.moveTo(376, 347); c.lineTo(407, 347); c.stroke();
  },
  sword(c) {
    // blade
    c.beginPath(); c.moveTo(260, -15); c.lineTo(238, 255); c.stroke();
    c.beginPath(); c.moveTo(260, -15); c.lineTo(283, 255); c.stroke();
    // blade tip
    c.beginPath(); c.moveTo(260, -15); c.lineTo(260, -37); c.stroke();
    // blade center line
    c.beginPath(); c.moveTo(260, 0); c.lineTo(260, 248); c.stroke();
    // cross guard
    c.beginPath(); c.moveTo(170, 255); c.lineTo(350, 255); c.stroke();
    c.beginPath(); c.moveTo(170, 255); c.quadraticCurveTo(163, 270, 170, 278); c.stroke();
    c.beginPath(); c.moveTo(350, 255); c.quadraticCurveTo(358, 270, 350, 278); c.stroke();
    c.beginPath(); c.moveTo(170, 278); c.lineTo(350, 278); c.stroke();
    // grip
    c.beginPath(); c.moveTo(242, 278); c.lineTo(242, 405); c.stroke();
    c.beginPath(); c.moveTo(278, 278); c.lineTo(278, 405); c.stroke();
    // grip wrapping
    c.beginPath(); c.moveTo(242, 308); c.lineTo(278, 323); c.stroke();
    c.beginPath(); c.moveTo(242, 338); c.lineTo(278, 353); c.stroke();
    c.beginPath(); c.moveTo(242, 368); c.lineTo(278, 383); c.stroke();
    // pommel
    c.beginPath(); c.arc(260, 420, 23, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 420, 9, 0, Math.PI * 2); c.stroke();
    // blade shine
    c.beginPath(); c.moveTo(248, 45); c.lineTo(245, 120); c.stroke();
  },
  mushroom(c) {
    // cap
    c.beginPath(); c.arc(260, 185, 125, Math.PI, 0); c.stroke();
    // cap underside
    c.beginPath(); c.moveTo(135, 185); c.quadraticCurveTo(260, 223, 385, 185); c.stroke();
    // stem
    c.beginPath(); c.moveTo(216, 198); c.quadraticCurveTo(210, 323, 216, 410); c.stroke();
    c.beginPath(); c.moveTo(304, 198); c.quadraticCurveTo(310, 323, 304, 410); c.stroke();
    // stem base
    c.beginPath(); c.moveTo(216, 410); c.quadraticCurveTo(198, 423, 198, 435); c.stroke();
    c.beginPath(); c.moveTo(304, 410); c.quadraticCurveTo(323, 423, 323, 435); c.stroke();
    c.beginPath(); c.moveTo(198, 435); c.lineTo(323, 435); c.stroke();
    // cap spots
    c.beginPath(); c.arc(210, 135, 23, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(310, 129, 19, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 98, 25, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(173, 160, 15, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(348, 158, 16, 0, Math.PI * 2); c.stroke();
    // gills under cap
    c.beginPath(); c.moveTo(235, 195); c.lineTo(235, 210); c.stroke();
    c.beginPath(); c.moveTo(260, 198); c.lineTo(260, 216); c.stroke();
    c.beginPath(); c.moveTo(285, 195); c.lineTo(285, 210); c.stroke();
  },
  icecream(c) {
    // cone
    c.beginPath(); c.moveTo(190, 238); c.lineTo(260, 462); c.lineTo(330, 238); c.stroke();
    // cone cross pattern
    c.beginPath(); c.moveTo(204, 259); c.lineTo(288, 385); c.stroke();
    c.beginPath(); c.moveTo(232, 252); c.lineTo(302, 350); c.stroke();
    c.beginPath(); c.moveTo(316, 259); c.lineTo(232, 385); c.stroke();
    c.beginPath(); c.moveTo(288, 252); c.lineTo(218, 350); c.stroke();
    // bottom scoop
    c.beginPath(); c.arc(260, 196, 77, 0, Math.PI * 2); c.stroke();
    // top scoop
    c.beginPath(); c.arc(260, 98, 70, 0, Math.PI * 2); c.stroke();
    // cherry
    c.beginPath(); c.arc(260, 21, 20, 0, Math.PI * 2); c.stroke();
    // cherry stem
    c.beginPath(); c.moveTo(260, 1); c.quadraticCurveTo(274, -21, 267, -31); c.stroke();
    // drip left
    c.beginPath(); c.moveTo(197, 189); c.quadraticCurveTo(190, 217, 197, 231); c.stroke();
    // drip right
    c.beginPath(); c.moveTo(323, 189); c.quadraticCurveTo(330, 217, 323, 231); c.stroke();
    // scoop texture
    c.beginPath(); c.arc(232, 189, 7, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(288, 196, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(246, 91, 7, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(281, 105, 6, 0, Math.PI * 2); c.stroke();
  },
  castle(c) {
    // main wall
    c.beginPath(); c.rect(145, 176, 230, 230); c.stroke();
    // left tower
    c.beginPath(); c.rect(111, 107, 69, 299); c.stroke();
    // right tower
    c.beginPath(); c.rect(341, 107, 69, 299); c.stroke();
    // left tower battlement
    c.beginPath(); c.moveTo(105, 107); c.lineTo(105, 84); c.lineTo(124, 84); c.lineTo(124, 107); c.stroke();
    c.beginPath(); c.moveTo(136, 107); c.lineTo(136, 84); c.lineTo(154, 84); c.lineTo(154, 107); c.stroke();
    c.beginPath(); c.moveTo(166, 107); c.lineTo(166, 84); c.lineTo(185, 84); c.lineTo(185, 107); c.stroke();
    // right tower battlement
    c.beginPath(); c.moveTo(335, 107); c.lineTo(335, 84); c.lineTo(354, 84); c.lineTo(354, 107); c.stroke();
    c.beginPath(); c.moveTo(366, 107); c.lineTo(366, 84); c.lineTo(384, 84); c.lineTo(384, 107); c.stroke();
    c.beginPath(); c.moveTo(396, 107); c.lineTo(396, 84); c.lineTo(415, 84); c.lineTo(415, 107); c.stroke();
    // center battlements
    c.beginPath(); c.moveTo(162, 176); c.lineTo(162, 155); c.lineTo(185, 155); c.lineTo(185, 176); c.stroke();
    c.beginPath(); c.moveTo(203, 176); c.lineTo(203, 155); c.lineTo(226, 155); c.lineTo(226, 176); c.stroke();
    c.beginPath(); c.moveTo(243, 176); c.lineTo(243, 155); c.lineTo(266, 155); c.lineTo(266, 176); c.stroke();
    c.beginPath(); c.moveTo(283, 176); c.lineTo(283, 155); c.lineTo(306, 155); c.lineTo(306, 176); c.stroke();
    c.beginPath(); c.moveTo(323, 176); c.lineTo(323, 155); c.lineTo(346, 155); c.lineTo(346, 176); c.stroke();
    // gate
    c.beginPath(); c.moveTo(226, 406); c.lineTo(226, 325);
    c.arc(260, 325, 35, Math.PI, 0); c.lineTo(295, 406); c.stroke();
    // gate bars
    c.beginPath(); c.moveTo(249, 325); c.lineTo(249, 406); c.stroke();
    c.beginPath(); c.moveTo(272, 325); c.lineTo(272, 406); c.stroke();
    // tower windows
    c.beginPath(); c.arc(145, 199, 14, Math.PI, 0); c.lineTo(159, 227); c.lineTo(131, 227); c.closePath(); c.stroke();
    c.beginPath(); c.arc(375, 199, 14, Math.PI, 0); c.lineTo(389, 227); c.lineTo(361, 227); c.closePath(); c.stroke();
    // flag
    c.beginPath(); c.moveTo(260, 155); c.lineTo(260, 112); c.stroke();
    c.beginPath(); c.moveTo(260, 112); c.lineTo(289, 124); c.lineTo(260, 135); c.stroke();
  },
  cat(c) {
    // head
    c.beginPath(); c.arc(260, 148, 75, 0, Math.PI * 2); c.stroke();
    // left ear
    c.beginPath(); c.moveTo(204, 91); c.lineTo(185, 35); c.lineTo(229, 73); c.stroke();
    // right ear
    c.beginPath(); c.moveTo(316, 91); c.lineTo(335, 35); c.lineTo(291, 73); c.stroke();
    // inner ear left
    c.beginPath(); c.moveTo(208, 85); c.lineTo(198, 50); c.lineTo(223, 76); c.stroke();
    // inner ear right
    c.beginPath(); c.moveTo(313, 85); c.lineTo(323, 50); c.lineTo(298, 76); c.stroke();
    // left eye
    c.beginPath(); c.ellipse(233, 135, 15, 18, 0, 0, Math.PI * 2); c.stroke();
    // right eye
    c.beginPath(); c.ellipse(288, 135, 15, 18, 0, 0, Math.PI * 2); c.stroke();
    // pupils (slits)
    c.beginPath(); c.moveTo(233, 125); c.lineTo(233, 145); c.stroke();
    c.beginPath(); c.moveTo(288, 125); c.lineTo(288, 145); c.stroke();
    // nose
    c.beginPath(); c.moveTo(253, 163); c.lineTo(260, 173); c.lineTo(268, 163); c.closePath(); c.stroke();
    // mouth
    c.beginPath(); c.moveTo(260, 173); c.lineTo(260, 183); c.stroke();
    c.beginPath(); c.moveTo(260, 183); c.quadraticCurveTo(245, 191, 238, 183); c.stroke();
    c.beginPath(); c.moveTo(260, 183); c.quadraticCurveTo(275, 191, 283, 183); c.stroke();
    // whiskers left
    c.beginPath(); c.moveTo(210, 160); c.lineTo(154, 150); c.stroke();
    c.beginPath(); c.moveTo(210, 169); c.lineTo(154, 169); c.stroke();
    c.beginPath(); c.moveTo(210, 178); c.lineTo(154, 188); c.stroke();
    // whiskers right
    c.beginPath(); c.moveTo(310, 160); c.lineTo(366, 150); c.stroke();
    c.beginPath(); c.moveTo(310, 169); c.lineTo(366, 169); c.stroke();
    c.beginPath(); c.moveTo(310, 178); c.lineTo(366, 188); c.stroke();
    // body
    c.beginPath(); c.ellipse(260, 310, 69, 88, 0, 0, Math.PI * 2); c.stroke();
    // front paws
    c.beginPath(); c.arc(223, 391, 19, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(298, 391, 19, 0, Math.PI * 2); c.stroke();
    // tail
    c.beginPath(); c.moveTo(323, 323);
    c.bezierCurveTo(385, 310, 423, 273, 410, 235);
    c.quadraticCurveTo(404, 216, 391, 223); c.stroke();
  },
  anchor(c) {
    // ring at top
    c.beginPath(); c.arc(260, 60, 30, 0, Math.PI * 2); c.stroke();
    // vertical shaft
    c.beginPath(); c.moveTo(260, 90); c.lineTo(260, 366); c.stroke();
    // cross bar
    c.beginPath(); c.moveTo(188, 150); c.lineTo(332, 150); c.stroke();
    // left fluke
    c.beginPath(); c.moveTo(260, 366);
    c.quadraticCurveTo(164, 366, 128, 306);
    c.quadraticCurveTo(116, 282, 134, 270); c.stroke();
    // left fluke tip
    c.beginPath(); c.moveTo(134, 270); c.lineTo(122, 260); c.lineTo(126, 280); c.stroke();
    // right fluke
    c.beginPath(); c.moveTo(260, 366);
    c.quadraticCurveTo(356, 366, 392, 306);
    c.quadraticCurveTo(404, 282, 386, 270); c.stroke();
    // right fluke tip
    c.beginPath(); c.moveTo(386, 270); c.lineTo(398, 260); c.lineTo(394, 280); c.stroke();
    // shaft detail
    c.beginPath(); c.moveTo(254, 126); c.lineTo(266, 126); c.stroke();
    c.beginPath(); c.moveTo(254, 198); c.lineTo(266, 198); c.stroke();
    c.beginPath(); c.moveTo(254, 270); c.lineTo(266, 270); c.stroke();
    // rope on ring
    c.beginPath(); c.moveTo(242, 36); c.quadraticCurveTo(224, 24, 230, 12); c.stroke();
  },
  lightning(c) {
    // main bolt
    c.beginPath(); c.moveTo(286, 2); c.lineTo(208, 184); c.lineTo(273, 184);
    c.lineTo(195, 418); c.stroke();
    // right edge
    c.beginPath(); c.moveTo(338, 2); c.lineTo(260, 184); c.lineTo(325, 184);
    c.lineTo(247, 418); c.stroke();
    // top connection
    c.beginPath(); c.moveTo(286, 2); c.lineTo(338, 2); c.stroke();
    // bottom connection
    c.beginPath(); c.moveTo(195, 418); c.lineTo(247, 418); c.stroke();
    // middle connections
    c.beginPath(); c.moveTo(208, 184); c.lineTo(260, 184); c.stroke();
    c.beginPath(); c.moveTo(273, 184); c.lineTo(325, 184); c.stroke();
    // spark details
    c.beginPath(); c.moveTo(169, 145); c.lineTo(150, 139); c.stroke();
    c.beginPath(); c.moveTo(163, 165); c.lineTo(143, 165); c.stroke();
    c.beginPath(); c.moveTo(364, 158); c.lineTo(384, 152); c.stroke();
    c.beginPath(); c.moveTo(358, 178); c.lineTo(377, 178); c.stroke();
    // glow lines
    c.beginPath(); c.moveTo(143, 275); c.lineTo(124, 269); c.stroke();
    c.beginPath(); c.moveTo(351, 301); c.lineTo(371, 295); c.stroke();
  },
  crown(c) {
    // base
    c.beginPath(); c.moveTo(98, 305); c.lineTo(422, 305); c.stroke();
    c.beginPath(); c.moveTo(98, 332); c.lineTo(422, 332); c.stroke();
    c.beginPath(); c.moveTo(98, 305); c.lineTo(98, 332); c.stroke();
    c.beginPath(); c.moveTo(422, 305); c.lineTo(422, 332); c.stroke();
    // crown body
    c.beginPath(); c.moveTo(98, 305); c.lineTo(112, 116);
    c.lineTo(179, 210); c.lineTo(260, 75); c.lineTo(341, 210);
    c.lineTo(409, 116); c.lineTo(422, 305); c.stroke();
    // jewels on points
    c.beginPath(); c.arc(112, 109, 11, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 68, 14, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(409, 109, 11, 0, Math.PI * 2); c.stroke();
    // jewels on band
    c.beginPath(); c.arc(179, 311, 8, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 311, 11, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(341, 311, 8, 0, Math.PI * 2); c.stroke();
    // cross-hatch on body
    c.beginPath(); c.moveTo(132, 251); c.lineTo(145, 197); c.stroke();
    c.beginPath(); c.moveTo(179, 264); c.lineTo(206, 197); c.stroke();
    c.beginPath(); c.moveTo(314, 264); c.lineTo(341, 197); c.stroke();
    c.beginPath(); c.moveTo(388, 251); c.lineTo(375, 197); c.stroke();
  },
  ghost(c) {
    // head/body top
    c.beginPath(); c.arc(260, 160, 100, Math.PI, 0); c.stroke();
    // left side
    c.beginPath(); c.moveTo(160, 160); c.lineTo(160, 373); c.stroke();
    // right side
    c.beginPath(); c.moveTo(360, 160); c.lineTo(360, 373); c.stroke();
    // wavy bottom
    c.beginPath(); c.moveTo(160, 373);
    c.quadraticCurveTo(185, 335, 210, 373);
    c.quadraticCurveTo(235, 410, 260, 373);
    c.quadraticCurveTo(285, 335, 310, 373);
    c.quadraticCurveTo(335, 410, 360, 373); c.stroke();
    // left eye
    c.beginPath(); c.ellipse(223, 173, 23, 28, 0, 0, Math.PI * 2); c.stroke();
    // right eye
    c.beginPath(); c.ellipse(298, 173, 23, 28, 0, 0, Math.PI * 2); c.stroke();
    // left pupil
    c.beginPath(); c.arc(226, 178, 9, 0, Math.PI * 2); c.stroke();
    // right pupil
    c.beginPath(); c.arc(301, 178, 9, 0, Math.PI * 2); c.stroke();
    // mouth
    c.beginPath(); c.ellipse(260, 248, 23, 18, 0, 0, Math.PI * 2); c.stroke();
    // arms
    c.beginPath(); c.moveTo(160, 235); c.quadraticCurveTo(116, 248, 110, 273); c.stroke();
    c.beginPath(); c.moveTo(360, 235); c.quadraticCurveTo(404, 248, 410, 273); c.stroke();
  },
  hotdog(c) {
    // bun top
    c.beginPath(); c.moveTo(44, 210);
    c.quadraticCurveTo(37, 170, 85, 156);
    c.lineTo(436, 156);
    c.quadraticCurveTo(483, 170, 476, 210); c.stroke();
    // bun bottom
    c.beginPath(); c.moveTo(44, 237);
    c.quadraticCurveTo(37, 278, 85, 291);
    c.lineTo(436, 291);
    c.quadraticCurveTo(483, 278, 476, 237); c.stroke();
    // sausage visible top
    c.beginPath(); c.moveTo(58, 210);
    c.lineTo(463, 210); c.stroke();
    // sausage visible bottom
    c.beginPath(); c.moveTo(58, 237);
    c.lineTo(463, 237); c.stroke();
    // sausage ends
    c.beginPath(); c.arc(64, 224, 16, Math.PI * 0.5, Math.PI * 1.5); c.stroke();
    c.beginPath(); c.arc(456, 224, 16, -Math.PI * 0.5, Math.PI * 0.5); c.stroke();
    // mustard zigzag
    c.beginPath(); c.moveTo(85, 217);
    c.lineTo(118, 230); c.lineTo(152, 217); c.lineTo(186, 230);
    c.lineTo(220, 217); c.lineTo(253, 230); c.lineTo(287, 217);
    c.lineTo(321, 230); c.lineTo(355, 217); c.lineTo(388, 230);
    c.lineTo(422, 217); c.stroke();
    // bun texture
    c.beginPath(); c.moveTo(112, 176); c.lineTo(152, 176); c.stroke();
    c.beginPath(); c.moveTo(247, 172); c.lineTo(287, 172); c.stroke();
    c.beginPath(); c.moveTo(368, 176); c.lineTo(409, 176); c.stroke();
    // sesame seeds
    c.beginPath(); c.ellipse(179, 170, 8, 4, 0.3, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.ellipse(328, 167, 8, 4, -0.2, 0, Math.PI * 2); c.stroke();
  },
  dinosaur(c) {
    // head
    c.beginPath(); c.moveTo(320, 78); c.lineTo(416, 78); c.lineTo(428, 90);
    c.lineTo(428, 126); c.lineTo(320, 126);
    c.quadraticCurveTo(302, 102, 320, 78); c.stroke();
    // eye
    c.beginPath(); c.arc(356, 96, 10, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(358, 95, 4, 0, Math.PI * 2); c.stroke();
    // nostril
    c.beginPath(); c.arc(410, 90, 5, 0, Math.PI * 2); c.stroke();
    // mouth
    c.beginPath(); c.moveTo(320, 126); c.lineTo(428, 126); c.stroke();
    // teeth
    c.beginPath(); c.moveTo(356, 126); c.lineTo(362, 136); c.lineTo(368, 126); c.stroke();
    c.beginPath(); c.moveTo(380, 126); c.lineTo(386, 136); c.lineTo(392, 126); c.stroke();
    c.beginPath(); c.moveTo(404, 126); c.lineTo(410, 136); c.lineTo(416, 126); c.stroke();
    // neck
    c.beginPath(); c.moveTo(320, 90); c.quadraticCurveTo(284, 114, 272, 162); c.stroke();
    c.beginPath(); c.moveTo(320, 120); c.quadraticCurveTo(296, 138, 290, 168); c.stroke();
    // body
    c.beginPath(); c.moveTo(272, 162);
    c.bezierCurveTo(224, 162, 164, 186, 152, 234);
    c.quadraticCurveTo(140, 282, 164, 312); c.stroke();
    c.beginPath(); c.moveTo(290, 168);
    c.bezierCurveTo(332, 198, 356, 246, 332, 306);
    c.quadraticCurveTo(320, 330, 284, 330); c.stroke();
    // belly
    c.beginPath(); c.moveTo(164, 312); c.lineTo(284, 330); c.stroke();
    // back bumps
    c.beginPath(); c.moveTo(236, 164); c.lineTo(230, 150); c.lineTo(248, 162); c.stroke();
    c.beginPath(); c.moveTo(206, 174); c.lineTo(198, 160); c.lineTo(218, 172); c.stroke();
    // tiny arms!
    c.beginPath(); c.moveTo(296, 210); c.lineTo(320, 228); c.lineTo(308, 234); c.stroke();
    c.beginPath(); c.moveTo(296, 210); c.lineTo(326, 216); c.lineTo(318, 224); c.stroke();
    // left leg
    c.beginPath(); c.moveTo(200, 306); c.lineTo(188, 378); c.lineTo(164, 390);
    c.moveTo(188, 378); c.lineTo(206, 390); c.stroke();
    // right leg
    c.beginPath(); c.moveTo(284, 324); c.lineTo(296, 378); c.lineTo(278, 390);
    c.moveTo(296, 378); c.lineTo(318, 390); c.stroke();
    // tail
    c.beginPath(); c.moveTo(152, 240);
    c.bezierCurveTo(116, 222, 80, 234, 56, 210);
    c.quadraticCurveTo(38, 192, 44, 180); c.stroke();
  },
  sailboat(c) {
    // hull
    c.beginPath(); c.moveTo(84, 309); c.lineTo(117, 364); c.lineTo(403, 364); c.lineTo(436, 309); c.stroke();
    c.beginPath(); c.moveTo(84, 309); c.lineTo(436, 309); c.stroke();
    // mast
    c.beginPath(); c.moveTo(260, 309); c.lineTo(260, 67); c.stroke();
    // main sail
    c.beginPath(); c.moveTo(260, 78); c.lineTo(392, 298); c.lineTo(260, 298); c.stroke();
    // sail curve
    c.beginPath(); c.moveTo(260, 78);
    c.quadraticCurveTo(348, 177, 392, 298); c.stroke();
    // jib sail
    c.beginPath(); c.moveTo(260, 89); c.lineTo(150, 298); c.lineTo(260, 298); c.stroke();
    c.beginPath(); c.moveTo(260, 89);
    c.quadraticCurveTo(194, 188, 150, 298); c.stroke();
    // flag
    c.beginPath(); c.moveTo(260, 67); c.lineTo(238, 78); c.lineTo(260, 89); c.stroke();
    // hull detail
    c.beginPath(); c.moveTo(128, 331); c.lineTo(392, 331); c.stroke();
    // porthole
    c.beginPath(); c.arc(216, 329, 9, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(304, 329, 9, 0, Math.PI * 2); c.stroke();
    // water
    c.beginPath(); c.moveTo(51, 381); c.quadraticCurveTo(117, 370, 183, 381); c.stroke();
    c.beginPath(); c.moveTo(238, 386); c.quadraticCurveTo(304, 375, 370, 386); c.stroke();
    c.beginPath(); c.moveTo(403, 381); c.quadraticCurveTo(436, 373, 469, 381); c.stroke();
  },
  owl(c) {
    // body
    c.beginPath(); c.ellipse(260, 270, 90, 120, 0, 0, Math.PI * 2); c.stroke();
    // head
    c.beginPath(); c.arc(260, 144, 66, 0, Math.PI * 2); c.stroke();
    // left ear tuft
    c.beginPath(); c.moveTo(212, 96); c.lineTo(188, 48); c.lineTo(224, 84); c.stroke();
    // right ear tuft
    c.beginPath(); c.moveTo(308, 96); c.lineTo(332, 48); c.lineTo(296, 84); c.stroke();
    // left eye circle
    c.beginPath(); c.arc(234, 144, 26, 0, Math.PI * 2); c.stroke();
    // right eye circle
    c.beginPath(); c.arc(286, 144, 26, 0, Math.PI * 2); c.stroke();
    // left pupil
    c.beginPath(); c.arc(234, 144, 12, 0, Math.PI * 2); c.stroke();
    // right pupil
    c.beginPath(); c.arc(286, 144, 12, 0, Math.PI * 2); c.stroke();
    // beak
    c.beginPath(); c.moveTo(252, 162); c.lineTo(260, 186); c.lineTo(268, 162); c.stroke();
    // chest feather pattern V shapes
    c.beginPath(); c.moveTo(236, 234); c.lineTo(248, 246); c.lineTo(260, 234); c.stroke();
    c.beginPath(); c.moveTo(260, 234); c.lineTo(272, 246); c.lineTo(284, 234); c.stroke();
    c.beginPath(); c.moveTo(230, 264); c.lineTo(246, 276); c.lineTo(260, 264); c.stroke();
    c.beginPath(); c.moveTo(260, 264); c.lineTo(274, 276); c.lineTo(290, 264); c.stroke();
    c.beginPath(); c.moveTo(236, 294); c.lineTo(248, 306); c.lineTo(260, 294); c.stroke();
    c.beginPath(); c.moveTo(260, 294); c.lineTo(272, 306); c.lineTo(284, 294); c.stroke();
    // left wing
    c.beginPath(); c.moveTo(174, 222); c.quadraticCurveTo(122, 282, 140, 354); c.stroke();
    // right wing
    c.beginPath(); c.moveTo(346, 222); c.quadraticCurveTo(398, 282, 380, 354); c.stroke();
    // feet/talons
    c.beginPath(); c.moveTo(230, 384); c.lineTo(212, 408); c.moveTo(230, 384); c.lineTo(230, 412);
    c.moveTo(230, 384); c.lineTo(248, 408); c.stroke();
    c.beginPath(); c.moveTo(290, 384); c.lineTo(272, 408); c.moveTo(290, 384); c.lineTo(290, 412);
    c.moveTo(290, 384); c.lineTo(308, 408); c.stroke();
    // branch
    c.beginPath(); c.moveTo(128, 396); c.lineTo(392, 396); c.stroke();
  },
  diamond(c) {
    // top facet
    c.beginPath(); c.moveTo(164, 162); c.lineTo(260, 54); c.lineTo(356, 162); c.stroke();
    // top flat
    c.beginPath(); c.moveTo(164, 162); c.lineTo(356, 162); c.stroke();
    // bottom point
    c.beginPath(); c.moveTo(164, 162); c.lineTo(260, 402); c.lineTo(356, 162); c.stroke();
    // upper facet lines
    c.beginPath(); c.moveTo(212, 54); c.lineTo(200, 162); c.stroke();
    c.beginPath(); c.moveTo(260, 54); c.lineTo(260, 162); c.stroke();
    c.beginPath(); c.moveTo(308, 54); c.lineTo(320, 162); c.stroke();
    // crown top edge
    c.beginPath(); c.moveTo(212, 54); c.lineTo(308, 54); c.stroke();
    c.beginPath(); c.moveTo(164, 162); c.lineTo(212, 54); c.stroke();
    c.beginPath(); c.moveTo(356, 162); c.lineTo(308, 54); c.stroke();
    // lower facet lines
    c.beginPath(); c.moveTo(200, 162); c.lineTo(260, 402); c.stroke();
    c.beginPath(); c.moveTo(260, 162); c.lineTo(260, 402); c.stroke();
    c.beginPath(); c.moveTo(320, 162); c.lineTo(260, 402); c.stroke();
    // sparkle left
    c.beginPath(); c.moveTo(116, 102); c.lineTo(128, 114); c.stroke();
    c.beginPath(); c.moveTo(128, 102); c.lineTo(116, 114); c.stroke();
    // sparkle right
    c.beginPath(); c.moveTo(392, 126); c.lineTo(404, 138); c.stroke();
    c.beginPath(); c.moveTo(404, 126); c.lineTo(392, 138); c.stroke();
    // sparkle top
    c.beginPath(); c.moveTo(290, 24); c.lineTo(296, 36); c.stroke();
    c.beginPath(); c.moveTo(296, 24); c.lineTo(290, 36); c.stroke();
  },
  butterfly(c) {
    // body
    c.beginPath(); c.moveTo(260, 84); c.lineTo(260, 337); c.stroke();
    // head
    c.beginPath(); c.arc(260, 84, 16, 0, Math.PI * 2); c.stroke();
    // left antenna
    c.beginPath(); c.moveTo(251, 72); c.quadraticCurveTo(214, 26, 203, 20); c.stroke();
    c.beginPath(); c.arc(199, 18, 6, 0, Math.PI * 2); c.stroke();
    // right antenna
    c.beginPath(); c.moveTo(269, 72); c.quadraticCurveTo(306, 26, 318, 20); c.stroke();
    c.beginPath(); c.arc(321, 18, 6, 0, Math.PI * 2); c.stroke();
    // upper left wing
    c.beginPath(); c.moveTo(260, 118);
    c.bezierCurveTo(191, 61, 88, 84, 88, 164);
    c.bezierCurveTo(88, 222, 168, 233, 260, 210); c.stroke();
    // upper right wing
    c.beginPath(); c.moveTo(260, 118);
    c.bezierCurveTo(329, 61, 433, 84, 433, 164);
    c.bezierCurveTo(433, 222, 352, 233, 260, 210); c.stroke();
    // lower left wing
    c.beginPath(); c.moveTo(260, 222);
    c.bezierCurveTo(191, 222, 111, 268, 122, 337);
    c.bezierCurveTo(134, 371, 214, 360, 260, 325); c.stroke();
    // lower right wing
    c.beginPath(); c.moveTo(260, 222);
    c.bezierCurveTo(329, 222, 410, 268, 398, 337);
    c.bezierCurveTo(387, 371, 306, 360, 260, 325); c.stroke();
    // wing pattern left upper
    c.beginPath(); c.arc(174, 153, 23, 0, Math.PI * 2); c.stroke();
    // wing pattern right upper
    c.beginPath(); c.arc(346, 153, 23, 0, Math.PI * 2); c.stroke();
    // wing pattern left lower
    c.beginPath(); c.arc(185, 296, 16, 0, Math.PI * 2); c.stroke();
    // wing pattern right lower
    c.beginPath(); c.arc(335, 296, 16, 0, Math.PI * 2); c.stroke();
  },
  guitar(c) {
    // headstock
    c.beginPath(); c.moveTo(236, 24); c.lineTo(236, 90); c.lineTo(284, 90); c.lineTo(284, 24); c.stroke();
    c.beginPath(); c.moveTo(236, 24); c.quadraticCurveTo(260, 12, 284, 24); c.stroke();
    // tuning pegs left
    c.beginPath(); c.moveTo(236, 40); c.lineTo(218, 40); c.stroke();
    c.beginPath(); c.arc(214, 40, 5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(236, 56); c.lineTo(218, 56); c.stroke();
    c.beginPath(); c.arc(214, 56, 5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(236, 73); c.lineTo(218, 73); c.stroke();
    c.beginPath(); c.arc(214, 73, 5, 0, Math.PI * 2); c.stroke();
    // tuning pegs right
    c.beginPath(); c.moveTo(284, 40); c.lineTo(302, 40); c.stroke();
    c.beginPath(); c.arc(306, 40, 5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(284, 56); c.lineTo(302, 56); c.stroke();
    c.beginPath(); c.arc(306, 56, 5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(284, 73); c.lineTo(302, 73); c.stroke();
    c.beginPath(); c.arc(306, 73, 5, 0, Math.PI * 2); c.stroke();
    // nut
    c.beginPath(); c.moveTo(236, 90); c.lineTo(284, 90); c.stroke();
    // neck
    c.beginPath(); c.moveTo(246, 90); c.lineTo(246, 234); c.stroke();
    c.beginPath(); c.moveTo(274, 90); c.lineTo(274, 234); c.stroke();
    // frets
    c.beginPath(); c.moveTo(246, 120); c.lineTo(274, 120); c.stroke();
    c.beginPath(); c.moveTo(246, 148); c.lineTo(274, 148); c.stroke();
    c.beginPath(); c.moveTo(246, 172); c.lineTo(274, 172); c.stroke();
    c.beginPath(); c.moveTo(246, 193); c.lineTo(274, 193); c.stroke();
    c.beginPath(); c.moveTo(246, 212); c.lineTo(274, 212); c.stroke();
    // body upper bout
    c.beginPath(); c.moveTo(246, 234);
    c.bezierCurveTo(188, 234, 152, 270, 152, 306); c.stroke();
    c.beginPath(); c.moveTo(274, 234);
    c.bezierCurveTo(332, 234, 368, 270, 368, 306); c.stroke();
    // waist
    c.beginPath(); c.moveTo(152, 306); c.quadraticCurveTo(170, 330, 158, 354); c.stroke();
    c.beginPath(); c.moveTo(368, 306); c.quadraticCurveTo(350, 330, 362, 354); c.stroke();
    // lower bout
    c.beginPath(); c.moveTo(158, 354);
    c.bezierCurveTo(146, 402, 188, 438, 260, 438);
    c.bezierCurveTo(332, 438, 374, 402, 362, 354); c.stroke();
    // sound hole
    c.beginPath(); c.arc(260, 330, 36, 0, Math.PI * 2); c.stroke();
    // bridge
    c.beginPath(); c.moveTo(230, 396); c.lineTo(290, 396); c.stroke();
    // strings hint
    c.beginPath(); c.moveTo(254, 90); c.lineTo(254, 396); c.stroke();
    c.beginPath(); c.moveTo(266, 90); c.lineTo(266, 396); c.stroke();
  },
  jellyfish(c) {
    // bell/dome
    c.beginPath(); c.arc(260, 158, 117, Math.PI, 0); c.stroke();
    // bell bottom
    c.beginPath(); c.moveTo(143, 158);
    c.quadraticCurveTo(176, 191, 208, 165);
    c.quadraticCurveTo(234, 152, 260, 171);
    c.quadraticCurveTo(286, 152, 312, 165);
    c.quadraticCurveTo(345, 191, 377, 158); c.stroke();
    // bell inner pattern
    c.beginPath(); c.arc(260, 139, 52, Math.PI + 0.3, -0.3); c.stroke();
    // eyes
    c.beginPath(); c.arc(231, 126, 10, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(289, 126, 10, 0, Math.PI * 2); c.stroke();
    // smile
    c.beginPath(); c.arc(260, 142, 16, 0.3, Math.PI - 0.3); c.stroke();
    // tentacle 1
    c.beginPath(); c.moveTo(169, 178);
    c.bezierCurveTo(156, 236, 176, 301, 150, 379);
    c.quadraticCurveTo(143, 405, 156, 418); c.stroke();
    // tentacle 2
    c.beginPath(); c.moveTo(208, 171);
    c.bezierCurveTo(202, 249, 221, 314, 195, 405);
    c.quadraticCurveTo(189, 431, 202, 438); c.stroke();
    // tentacle 3
    c.beginPath(); c.moveTo(247, 174);
    c.bezierCurveTo(244, 236, 254, 314, 234, 418);
    c.quadraticCurveTo(230, 444, 244, 444); c.stroke();
    // tentacle 4
    c.beginPath(); c.moveTo(273, 174);
    c.bezierCurveTo(280, 236, 273, 314, 293, 418);
    c.quadraticCurveTo(299, 444, 286, 444); c.stroke();
    // tentacle 5
    c.beginPath(); c.moveTo(312, 171);
    c.bezierCurveTo(325, 249, 306, 314, 332, 405);
    c.quadraticCurveTo(338, 431, 325, 438); c.stroke();
    // tentacle 6
    c.beginPath(); c.moveTo(351, 178);
    c.bezierCurveTo(364, 236, 345, 301, 371, 379);
    c.quadraticCurveTo(377, 405, 364, 418); c.stroke();
    // dots on bell
    c.beginPath(); c.arc(208, 93, 7, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 80, 7, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(312, 93, 7, 0, Math.PI * 2); c.stroke();
  },
  sunflower(c) {
    // center
    c.beginPath(); c.arc(260, 184, 52, 0, Math.PI * 2); c.stroke();
    // inner center
    c.beginPath(); c.arc(260, 184, 33, 0, Math.PI * 2); c.stroke();
    // center dots
    c.beginPath(); c.arc(247, 174, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(273, 174, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 194, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(244, 191, 4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(276, 191, 4, 0, Math.PI * 2); c.stroke();
    // petals (12 around)
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
      const px = 260 + 59 * Math.cos(a);
      const py = 184 + 59 * Math.sin(a);
      const ex = 260 + 111 * Math.cos(a);
      const ey = 184 + 111 * Math.sin(a);
      const cpx1 = 260 + 85 * Math.cos(a - 0.25);
      const cpy1 = 184 + 85 * Math.sin(a - 0.25);
      const cpx2 = 260 + 85 * Math.cos(a + 0.25);
      const cpy2 = 184 + 85 * Math.sin(a + 0.25);
      c.beginPath(); c.moveTo(px, py);
      c.quadraticCurveTo(cpx1, cpy1, ex, ey);
      c.quadraticCurveTo(cpx2, cpy2, px, py); c.stroke();
    }
    // stem
    c.beginPath(); c.moveTo(254, 295); c.quadraticCurveTo(247, 379, 254, 457); c.stroke();
    c.beginPath(); c.moveTo(267, 295); c.quadraticCurveTo(273, 379, 267, 457); c.stroke();
    // leaf left
    c.beginPath(); c.moveTo(254, 366);
    c.quadraticCurveTo(182, 340, 156, 366);
    c.quadraticCurveTo(182, 386, 254, 379); c.stroke();
    // leaf right
    c.beginPath(); c.moveTo(267, 392);
    c.quadraticCurveTo(338, 373, 364, 392);
    c.quadraticCurveTo(338, 412, 267, 402); c.stroke();
    // leaf veins
    c.beginPath(); c.moveTo(254, 373); c.lineTo(176, 366); c.stroke();
    c.beginPath(); c.moveTo(267, 397); c.lineTo(345, 392); c.stroke();
  },
  pirateship(c) {
    // hull
    c.beginPath(); c.moveTo(71, 284); c.lineTo(50, 326);
    c.lineTo(92, 357); c.lineTo(428, 357); c.lineTo(470, 326); c.lineTo(449, 284); c.stroke();
    c.beginPath(); c.moveTo(71, 284); c.lineTo(449, 284); c.stroke();
    // hull stripes
    c.beginPath(); c.moveTo(66, 310); c.lineTo(454, 310); c.stroke();
    // bow decoration
    c.beginPath(); c.moveTo(71, 284); c.quadraticCurveTo(40, 263, 29, 242); c.stroke();
    // stern decoration
    c.beginPath(); c.moveTo(449, 284); c.lineTo(470, 263); c.lineTo(470, 294); c.stroke();
    // main mast
    c.beginPath(); c.moveTo(260, 284); c.lineTo(260, 53); c.stroke();
    // fore mast
    c.beginPath(); c.moveTo(155, 284); c.lineTo(155, 105); c.stroke();
    // main sail
    c.beginPath(); c.moveTo(197, 84); c.lineTo(323, 84); c.stroke();
    c.beginPath(); c.moveTo(192, 179); c.lineTo(328, 179); c.stroke();
    c.beginPath(); c.moveTo(197, 84); c.quadraticCurveTo(192, 131, 192, 179); c.stroke();
    c.beginPath(); c.moveTo(323, 84); c.quadraticCurveTo(328, 131, 328, 179); c.stroke();
    // fore sail
    c.beginPath(); c.moveTo(108, 126); c.lineTo(202, 126); c.stroke();
    c.beginPath(); c.moveTo(103, 210); c.lineTo(208, 210); c.stroke();
    c.beginPath(); c.moveTo(108, 126); c.quadraticCurveTo(103, 168, 103, 210); c.stroke();
    c.beginPath(); c.moveTo(202, 126); c.quadraticCurveTo(208, 168, 208, 210); c.stroke();
    // crow's nest
    c.beginPath(); c.moveTo(244, 58); c.lineTo(276, 58); c.lineTo(279, 74); c.lineTo(241, 74); c.closePath(); c.stroke();
    // jolly roger flag
    c.beginPath(); c.moveTo(260, 53); c.lineTo(260, 26); c.stroke();
    c.beginPath(); c.moveTo(260, 26); c.lineTo(297, 26); c.lineTo(297, 47); c.lineTo(260, 47); c.stroke();
    // skull on flag
    c.beginPath(); c.arc(279, 35, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(273, 41); c.lineTo(285, 41); c.stroke();
    // water
    c.beginPath(); c.moveTo(29, 373); c.quadraticCurveTo(103, 362, 176, 373); c.stroke();
    c.beginPath(); c.moveTo(229, 378); c.quadraticCurveTo(302, 368, 376, 378); c.stroke();
    c.beginPath(); c.moveTo(407, 373); c.quadraticCurveTo(449, 365, 491, 373); c.stroke();
    // cannon holes
    c.beginPath(); c.arc(176, 305, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(260, 305, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(344, 305, 6, 0, Math.PI * 2); c.stroke();
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
  const refTight = dilateMask(refMask, 2);

  let refPixels = 0;
  let overlap = 0;
  let userPixels = 0;
  let strayPixels = 0;

  for (let i = 0; i < refMask.length; i += 1) {
    if (refMask[i]) refPixels += 1;
    if (alignedUser[i]) {
      userPixels += 1;
      if (refTight[i]) {
        overlap += 1;
      } else {
        strayPixels += 1;
      }
    }
  }

  if (refPixels === 0 || userPixels === 0) return 0;

  const recall = overlap / refPixels;
  const precision = userPixels > 0 ? overlap / userPixels : 0;
  const strayRatio = userPixels > 0 ? strayPixels / userPixels : 0;
  const strayPenalty = Math.min(strayRatio * 0.8, 0.5);

  // F1-like harmonic mean so both recall and precision must be good
  const f1 = (precision + recall > 0) ? 2 * precision * recall / (precision + recall) : 0;
  const rawScore = Math.max(0, f1 - strayPenalty);
  const finalScore = Math.min(100, Math.round(rawScore * 105));

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
  rocket: `<path d="M 218 364 L 218 112 Q 218 28 260 -14 Q 302 28 302 112 L 302 364"/>
    <line x1="260" y1="-14" x2="246" y2="14"/><line x1="260" y1="-14" x2="274" y2="14"/>
    <path d="M 218 308 L 162 392 L 218 364"/><path d="M 302 308 L 358 392 L 302 364"/>
    <circle cx="260" cy="168" r="31"/><circle cx="260" cy="168" r="20"/>
    <line x1="218" y1="266" x2="302" y2="266"/><line x1="218" y1="287" x2="302" y2="287"/>
    <path d="M 232 364 Q 239 420 260 462"/><path d="M 288 364 Q 281 420 260 462"/>
    <path d="M 246 364 Q 253 406 260 434"/><path d="M 274 364 Q 267 406 260 434"/>
    <circle cx="120" cy="56" r="4"/><circle cx="414" cy="126" r="4"/><circle cx="106" cy="266" r="4"/>`,
  octopus: `<ellipse cx="260" cy="135" rx="100" ry="88"/>
    <circle cx="223" cy="123" r="19"/><circle cx="298" cy="123" r="19"/>
    <circle cx="226" cy="120" r="8"/><circle cx="301" cy="120" r="8"/>
    <path d="M 248 160 A 13 13 0 0 1 273 160"/>
    <path d="M 179 198 C 123 260 85 323 110 385 Q 123 410 141 391"/>
    <path d="M 198 210 C 160 285 135 360 173 410 Q 185 429 198 410"/>
    <path d="M 229 216 C 210 298 198 373 223 423 Q 235 441 248 423"/>
    <path d="M 254 220 C 248 298 241 385 266 435 Q 279 448 285 429"/>
    <path d="M 279 220 C 291 298 304 385 316 429 Q 329 448 335 423"/>
    <path d="M 304 216 C 335 285 360 360 348 410 Q 341 429 329 404"/>
    <path d="M 323 210 C 360 273 398 335 391 391 Q 388 416 373 391"/>
    <path d="M 341 198 C 398 248 435 310 416 373 Q 410 398 398 373"/>
    <circle cx="116" cy="335" r="5"/><circle cx="108" cy="366" r="5"/>`,
  pizza: `<path d="M 116 78 L 260 414 L 404 78"/>
    <path d="M 116 78 A 144 144 0 0 1 404 78"/>
    <path d="M 130 88 A 130 130 0 0 1 390 88"/>
    <circle cx="236" cy="174" r="19"/><circle cx="296" cy="222" r="17"/>
    <circle cx="212" cy="270" r="18"/><circle cx="272" cy="318" r="16"/>
    <path d="M 306 150 A 14 14 0 0 1 334 150"/><line x1="313" y1="150" x2="315" y2="168"/><line x1="327" y1="150" x2="325" y2="168"/>
    <circle cx="188" cy="186" r="12"/><circle cx="188" cy="186" r="5"/>
    <path d="M 260 408 Q 254 432 260 438"/>`,
  dragon: `<ellipse cx="145" cy="118" rx="52" ry="40" transform="rotate(-11 145 118)"/>
    <path d="M 97 107 L 70 101 L 70 124 L 97 127"/>
    <circle cx="134" cy="107" r="9"/><circle cx="136" cy="105" r="3"/>
    <path d="M 134 84 L 116 43 L 139 72"/><path d="M 162 81 L 174 38 L 168 74"/>
    <path d="M 70 107 Q 42 95 30 112 Q 24 130 47 130"/>
    <path d="M 180 141 Q 214 176 237 199"/><path d="M 162 153 Q 203 193 226 216"/>
    <path d="M 237 199 C 306 187 364 210 387 256 Q 404 296 387 325"/>
    <path d="M 226 216 C 283 222 352 245 375 291 Q 387 325 369 342"/>
    <path d="M 272 199 L 318 95 L 375 118 L 421 84 L 398 176 L 364 210"/>
    <line x1="318" y1="95" x2="341" y2="187"/><line x1="375" y1="118" x2="375" y2="199"/>
    <line x1="260" y1="227" x2="260" y2="262"/><line x1="283" y1="233" x2="283" y2="273"/><line x1="306" y1="239" x2="306" y2="285"/>
    <path d="M 272 256 L 260 337 L 237 348 M 260 337 L 272 354"/>
    <path d="M 352 291 L 364 360 L 346 371 M 364 360 L 381 371"/>
    <path d="M 387 325 C 410 360 444 371 467 348 Q 490 325 479 308"/>
    <path d="M 479 308 L 496 291 L 473 302"/>
    <line x1="191" y1="153" x2="185" y2="139"/><line x1="208" y1="170" x2="200" y2="156"/>`,
  penguin: `<ellipse cx="260" cy="264" rx="95" ry="149"/>
    <ellipse cx="260" cy="284" rx="61" ry="115"/>
    <circle cx="260" cy="116" r="61"/>
    <circle cx="236" cy="105" r="11"/><circle cx="238" cy="103" r="4"/>
    <circle cx="284" cy="105" r="11"/><circle cx="287" cy="103" r="4"/>
    <path d="M 249 126 L 260 153 L 271 126"/>
    <path d="M 168 197 Q 118 278 139 359"/>
    <path d="M 352 197 Q 402 278 382 359"/>
    <path d="M 220 406 L 193 433 L 233 433 L 247 410"/>
    <path d="M 301 406 L 287 433 L 328 433 L 301 410"/>
    <path d="M 260 176 L 240 163 L 240 190 L 260 176 L 280 163 L 280 190 Z"/>`,
  ufo: `<path d="M 188 186 A 72 72 0 0 1 332 186"/>
    <path d="M 198 186 A 54 54 0 0 1 322 186"/>
    <ellipse cx="260" cy="198" rx="168" ry="42"/>
    <path d="M 116 210 A 144 30 0 0 0 404 210"/>
    <circle cx="224" cy="168" r="10"/><circle cx="260" cy="162" r="10"/><circle cx="296" cy="168" r="10"/>
    <circle cx="152" cy="198" r="7"/><circle cx="206" cy="206" r="7"/><circle cx="260" cy="210" r="7"/>
    <circle cx="314" cy="206" r="7"/><circle cx="368" cy="198" r="7"/>
    <line x1="212" y1="234" x2="164" y2="414"/><line x1="308" y1="234" x2="356" y2="414"/>
    <line x1="164" y1="414" x2="356" y2="414"/>
    <line x1="230" y1="270" x2="290" y2="270"/><line x1="206" y1="342" x2="314" y2="342"/>
    <line x1="260" y1="114" x2="260" y2="90"/><circle cx="260" cy="85" r="6"/>`,
  skull: `<path d="M 143 171 A 117 117 0 0 1 377 171"/>
    <path d="M 143 171 L 143 249 Q 143 288 169 301"/>
    <path d="M 377 171 L 377 249 Q 377 288 351 301"/>
    <path d="M 169 301 L 176 288 L 208 301"/><path d="M 351 301 L 345 288 L 312 301"/>
    <path d="M 208 301 L 195 340 Q 195 379 221 379 L 299 379 Q 325 379 325 340 L 312 301"/>
    <ellipse cx="215" cy="197" rx="36" ry="39"/><ellipse cx="306" cy="197" rx="36" ry="39"/>
    <path d="M 250 249 L 244 282 L 260 288 L 276 282 L 270 249"/>
    <line x1="208" y1="327" x2="312" y2="327"/>
    <line x1="228" y1="327" x2="228" y2="379"/><line x1="250" y1="327" x2="250" y2="379"/>
    <line x1="270" y1="327" x2="270" y2="379"/><line x1="293" y1="327" x2="293" y2="379"/>
    <path d="M 150 145 Q 156 158 153 178"/><path d="M 371 145 Q 364 158 367 178"/>`,
  palmtree: `<path d="M 243 417 Q 237 314 254 199 Q 266 153 260 130"/>
    <path d="M 277 417 Q 272 314 277 199 Q 283 153 272 130"/>
    <line x1="245" y1="371" x2="275" y2="371"/><line x1="246" y1="325" x2="276" y2="325"/>
    <line x1="251" y1="279" x2="278" y2="279"/><line x1="255" y1="233" x2="278" y2="233"/>
    <line x1="259" y1="193" x2="277" y2="193"/>
    <path d="M 266 130 C 329 95 410 84 456 118"/>
    <line x1="341" y1="89" x2="352" y2="107"/><line x1="387" y1="84" x2="392" y2="104"/><line x1="427" y1="93" x2="427" y2="113"/>
    <path d="M 266 130 C 191 95 111 89 65 130"/>
    <line x1="180" y1="93" x2="174" y2="112"/><line x1="134" y1="89" x2="131" y2="109"/><line x1="93" y1="101" x2="93" y2="120"/>
    <path d="M 266 130 C 318 130 398 153 433 199"/>
    <line x1="352" y1="139" x2="358" y2="158"/><line x1="392" y1="155" x2="396" y2="176"/>
    <path d="M 266 130 C 214 130 134 158 99 204"/>
    <line x1="168" y1="147" x2="165" y2="166"/><line x1="128" y1="166" x2="125" y2="187"/>
    <circle cx="254" cy="141" r="12"/><circle cx="277" cy="139" r="12"/>`,
  robot: `<rect x="200" y="54" width="120" height="96"/>
    <line x1="260" y1="54" x2="260" y2="24"/><circle cx="260" cy="16" r="8"/>
    <rect x="222" y="84" width="24" height="24"/><rect x="274" y="84" width="24" height="24"/>
    <circle cx="234" cy="96" r="6"/><circle cx="286" cy="96" r="6"/>
    <line x1="230" y1="126" x2="290" y2="126"/>
    <line x1="242" y1="126" x2="242" y2="136"/><line x1="260" y1="126" x2="260" y2="136"/><line x1="278" y1="126" x2="278" y2="136"/>
    <path d="M 242 150 L 242 174 L 278 174 L 278 150"/>
    <rect x="182" y="174" width="156" height="156"/>
    <rect x="212" y="198" width="96" height="72"/>
    <circle cx="236" cy="222" r="10"/><circle cx="272" cy="222" r="10"/>
    <line x1="224" y1="252" x2="296" y2="252"/><line x1="260" y1="246" x2="260" y2="258"/>
    <path d="M 182 192 L 134 192 L 134 294 L 158 294 L 158 210 L 182 210"/>
    <line x1="122" y1="294" x2="122" y2="318"/><line x1="158" y1="294" x2="158" y2="318"/>
    <path d="M 338 192 L 386 192 L 386 294 L 362 294 L 362 210 L 338 210"/>
    <line x1="362" y1="294" x2="362" y2="318"/><line x1="398" y1="294" x2="398" y2="318"/>
    <path d="M 212 330 L 212 402 L 188 402 L 188 414 L 242 414 L 242 402 L 236 402 L 236 330"/>
    <path d="M 284 330 L 284 402 L 278 402 L 278 414 L 332 414 L 332 402 L 308 402 L 308 330"/>
    <line x1="194" y1="96" x2="206" y2="96"/><line x1="200" y1="90" x2="200" y2="102"/>`,
  flamingo: `<ellipse cx="285" cy="248" rx="75" ry="50" transform="rotate(17 285 248)"/>
    <path d="M 354 229 Q 398 210 410 223"/><path d="M 354 241 Q 404 229 416 241"/>
    <path d="M 229 216 C 198 185 173 135 179 85 Q 183 54 204 48"/>
    <path d="M 241 223 C 216 191 198 141 204 91 Q 208 63 223 56"/>
    <circle cx="213" cy="45" r="23"/>
    <circle cx="204" cy="40" r="5"/>
    <path d="M 193 50 L 158 60 L 158 54 L 185 45"/>
    <path d="M 158 54 Q 150 58 148 63"/>
    <path d="M 273 291 L 266 373 Q 260 391 266 398"/><line x1="254" y1="398" x2="285" y2="398"/>
    <path d="M 298 291 L 310 348 L 298 398"/><line x1="285" y1="398" x2="316" y2="398"/>
    <path d="M 248 229 Q 285 216 335 229"/><path d="M 254 241 Q 291 233 341 245"/>`,
  volcano: `<line x1="50" y1="378" x2="197" y2="137"/><line x1="470" y1="378" x2="323" y2="137"/>
    <path d="M 197 137 Q 260 158 323 137"/>
    <line x1="29" y1="378" x2="491" y2="378"/>
    <path d="M 229 142 C 218 179 197 221 176 273 Q 166 305 171 326"/>
    <path d="M 281 145 C 292 189 313 242 323 294 Q 328 326 323 347"/>
    <circle cx="239" cy="84" r="8"/><circle cx="276" cy="63" r="6"/>
    <circle cx="302" cy="89" r="7"/><circle cx="218" cy="53" r="5"/>
    <circle cx="250" cy="37" r="19"/><circle cx="276" cy="26" r="23"/><circle cx="302" cy="42" r="17"/>
    <line x1="134" y1="284" x2="160" y2="284"/><line x1="355" y1="294" x2="386" y2="294"/>
    <line x1="113" y1="336" x2="150" y2="336"/><line x1="376" y1="347" x2="407" y2="347"/>`,
  sword: `<line x1="260" y1="-15" x2="238" y2="255"/><line x1="260" y1="-15" x2="283" y2="255"/>
    <line x1="260" y1="-15" x2="260" y2="-37"/>
    <line x1="260" y1="0" x2="260" y2="248"/>
    <line x1="170" y1="255" x2="350" y2="255"/>
    <path d="M 170 255 Q 163 270 170 278"/><path d="M 350 255 Q 358 270 350 278"/>
    <line x1="170" y1="278" x2="350" y2="278"/>
    <line x1="242" y1="278" x2="242" y2="405"/><line x1="278" y1="278" x2="278" y2="405"/>
    <line x1="242" y1="308" x2="278" y2="323"/><line x1="242" y1="338" x2="278" y2="353"/><line x1="242" y1="368" x2="278" y2="383"/>
    <circle cx="260" cy="420" r="23"/><circle cx="260" cy="420" r="9"/>
    <line x1="248" y1="45" x2="245" y2="120"/>`,
  mushroom: `<path d="M 135 185 A 125 125 0 0 1 385 185"/>
    <path d="M 135 185 Q 260 223 385 185"/>
    <path d="M 216 198 Q 210 323 216 410"/><path d="M 304 198 Q 310 323 304 410"/>
    <path d="M 216 410 Q 198 423 198 435"/><path d="M 304 410 Q 323 423 323 435"/>
    <line x1="198" y1="435" x2="323" y2="435"/>
    <circle cx="210" cy="135" r="23"/><circle cx="310" cy="129" r="19"/>
    <circle cx="260" cy="98" r="25"/><circle cx="173" cy="160" r="15"/><circle cx="348" cy="158" r="16"/>
    <line x1="235" y1="195" x2="235" y2="210"/><line x1="260" y1="198" x2="260" y2="216"/><line x1="285" y1="195" x2="285" y2="210"/>`,
  icecream: `<path d="M 190 238 L 260 462 L 330 238"/>
    <line x1="204" y1="259" x2="288" y2="385"/><line x1="232" y1="252" x2="302" y2="350"/>
    <line x1="316" y1="259" x2="232" y2="385"/><line x1="288" y1="252" x2="218" y2="350"/>
    <circle cx="260" cy="196" r="77"/><circle cx="260" cy="98" r="70"/>
    <circle cx="260" cy="21" r="20"/>
    <path d="M 260 1 Q 274 -21 267 -31"/>
    <path d="M 197 189 Q 190 217 197 231"/><path d="M 323 189 Q 330 217 323 231"/>
    <circle cx="232" cy="189" r="7"/><circle cx="288" cy="196" r="6"/>
    <circle cx="246" cy="91" r="7"/><circle cx="281" cy="105" r="6"/>`,
  castle: `<rect x="145" y="176" width="230" height="230"/>
    <rect x="111" y="107" width="69" height="299"/><rect x="341" y="107" width="69" height="299"/>
    <path d="M 105 107 L 105 84 L 124 84 L 124 107"/><path d="M 136 107 L 136 84 L 154 84 L 154 107"/><path d="M 166 107 L 166 84 L 185 84 L 185 107"/>
    <path d="M 335 107 L 335 84 L 354 84 L 354 107"/><path d="M 366 107 L 366 84 L 384 84 L 384 107"/><path d="M 396 107 L 396 84 L 415 84 L 415 107"/>
    <path d="M 162 176 L 162 155 L 185 155 L 185 176"/><path d="M 203 176 L 203 155 L 226 155 L 226 176"/>
    <path d="M 243 176 L 243 155 L 266 155 L 266 176"/><path d="M 283 176 L 283 155 L 306 155 L 306 176"/>
    <path d="M 323 176 L 323 155 L 346 155 L 346 176"/>
    <path d="M 226 406 L 226 325 A 35 35 0 0 1 295 325 L 295 406"/>
    <line x1="249" y1="325" x2="249" y2="406"/><line x1="272" y1="325" x2="272" y2="406"/>
    <path d="M 131 199 A 14 14 0 0 1 159 199 L 159 227 L 131 227 Z"/>
    <path d="M 361 199 A 14 14 0 0 1 389 199 L 389 227 L 361 227 Z"/>
    <line x1="260" y1="155" x2="260" y2="112"/>
    <path d="M 260 112 L 289 124 L 260 135"/>`,
  cat: `<circle cx="260" cy="148" r="75"/>
    <path d="M 204 91 L 185 35 L 229 73"/><path d="M 316 91 L 335 35 L 291 73"/>
    <path d="M 208 85 L 198 50 L 223 76"/><path d="M 313 85 L 323 50 L 298 76"/>
    <ellipse cx="233" cy="135" rx="15" ry="18"/><ellipse cx="288" cy="135" rx="15" ry="18"/>
    <line x1="233" y1="125" x2="233" y2="145"/><line x1="288" y1="125" x2="288" y2="145"/>
    <path d="M 253 163 L 260 173 L 268 163 Z"/>
    <line x1="260" y1="173" x2="260" y2="183"/>
    <path d="M 260 183 Q 245 191 238 183"/><path d="M 260 183 Q 275 191 283 183"/>
    <line x1="210" y1="160" x2="154" y2="150"/><line x1="210" y1="169" x2="154" y2="169"/><line x1="210" y1="178" x2="154" y2="188"/>
    <line x1="310" y1="160" x2="366" y2="150"/><line x1="310" y1="169" x2="366" y2="169"/><line x1="310" y1="178" x2="366" y2="188"/>
    <ellipse cx="260" cy="310" rx="69" ry="88"/>
    <circle cx="223" cy="391" r="19"/><circle cx="298" cy="391" r="19"/>
    <path d="M 323 323 C 385 310 423 273 410 235 Q 404 216 391 223"/>`,
  anchor: `<circle cx="260" cy="60" r="30"/>
    <line x1="260" y1="90" x2="260" y2="366"/>
    <line x1="188" y1="150" x2="332" y2="150"/>
    <path d="M 260 366 Q 164 366 128 306 Q 116 282 134 270"/>
    <path d="M 134 270 L 122 260 L 126 280"/>
    <path d="M 260 366 Q 356 366 392 306 Q 404 282 386 270"/>
    <path d="M 386 270 L 398 260 L 394 280"/>
    <line x1="254" y1="126" x2="266" y2="126"/><line x1="254" y1="198" x2="266" y2="198"/><line x1="254" y1="270" x2="266" y2="270"/>
    <path d="M 242 36 Q 224 24 230 12"/>`,
  lightning: `<path d="M 286 2 L 208 184 L 273 184 L 195 418"/>
    <path d="M 338 2 L 260 184 L 325 184 L 247 418"/>
    <line x1="286" y1="2" x2="338" y2="2"/><line x1="195" y1="418" x2="247" y2="418"/>
    <line x1="208" y1="184" x2="260" y2="184"/><line x1="273" y1="184" x2="325" y2="184"/>
    <line x1="169" y1="145" x2="150" y2="139"/><line x1="163" y1="165" x2="143" y2="165"/>
    <line x1="364" y1="158" x2="384" y2="152"/><line x1="358" y1="178" x2="377" y2="178"/>
    <line x1="143" y1="275" x2="124" y2="269"/><line x1="351" y1="301" x2="371" y2="295"/>`,
  crown: `<line x1="98" y1="305" x2="422" y2="305"/><line x1="98" y1="332" x2="422" y2="332"/>
    <line x1="98" y1="305" x2="98" y2="332"/><line x1="422" y1="305" x2="422" y2="332"/>
    <path d="M 98 305 L 112 116 L 179 210 L 260 75 L 341 210 L 409 116 L 422 305"/>
    <circle cx="112" cy="109" r="11"/><circle cx="260" cy="68" r="14"/><circle cx="409" cy="109" r="11"/>
    <circle cx="179" cy="311" r="8"/><circle cx="260" cy="311" r="11"/><circle cx="341" cy="311" r="8"/>
    <line x1="132" y1="251" x2="145" y2="197"/><line x1="179" y1="264" x2="206" y2="197"/>
    <line x1="314" y1="264" x2="341" y2="197"/><line x1="388" y1="251" x2="375" y2="197"/>`,
  ghost: `<path d="M 160 160 A 100 100 0 0 1 360 160"/>
    <line x1="160" y1="160" x2="160" y2="373"/><line x1="360" y1="160" x2="360" y2="373"/>
    <path d="M 160 373 Q 185 335 210 373 Q 235 410 260 373 Q 285 335 310 373 Q 335 410 360 373"/>
    <ellipse cx="223" cy="173" rx="23" ry="28"/><ellipse cx="298" cy="173" rx="23" ry="28"/>
    <circle cx="226" cy="178" r="9"/><circle cx="301" cy="178" r="9"/>
    <ellipse cx="260" cy="248" rx="23" ry="18"/>
    <path d="M 160 235 Q 116 248 110 273"/><path d="M 360 235 Q 404 248 410 273"/>`,
  hotdog: `<path d="M 44 210 Q 37 170 85 156 L 436 156 Q 483 170 476 210"/>
    <path d="M 44 237 Q 37 278 85 291 L 436 291 Q 483 278 476 237"/>
    <line x1="58" y1="210" x2="463" y2="210"/><line x1="58" y1="237" x2="463" y2="237"/>
    <path d="M 48 224 A 16 16 0 0 0 48 224" /><path d="M 64 207 A 16 16 0 1 0 64 240"/>
    <path d="M 456 207 A 16 16 0 1 1 456 240"/>
    <path d="M 85 217 L 118 230 L 152 217 L 186 230 L 220 217 L 253 230 L 287 217 L 321 230 L 355 217 L 388 230 L 422 217"/>
    <line x1="112" y1="176" x2="152" y2="176"/><line x1="247" y1="172" x2="287" y2="172"/><line x1="368" y1="176" x2="409" y2="176"/>
    <ellipse cx="179" cy="170" rx="8" ry="4" transform="rotate(17 179 170)"/>
    <ellipse cx="328" cy="167" rx="8" ry="4" transform="rotate(-11 328 167)"/>`,
  dinosaur: `<path d="M 320 78 L 416 78 L 428 90 L 428 126 L 320 126 Q 302 102 320 78"/>
    <circle cx="356" cy="96" r="10"/><circle cx="358" cy="95" r="4"/>
    <circle cx="410" cy="90" r="5"/>
    <line x1="320" y1="126" x2="428" y2="126"/>
    <path d="M 356 126 L 362 136 L 368 126"/><path d="M 380 126 L 386 136 L 392 126"/><path d="M 404 126 L 410 136 L 416 126"/>
    <path d="M 320 90 Q 284 114 272 162"/><path d="M 320 120 Q 296 138 290 168"/>
    <path d="M 272 162 C 224 162 164 186 152 234 Q 140 282 164 312"/>
    <path d="M 290 168 C 332 198 356 246 332 306 Q 320 330 284 330"/>
    <line x1="164" y1="312" x2="284" y2="330"/>
    <path d="M 236 164 L 230 150 L 248 162"/><path d="M 206 174 L 198 160 L 218 172"/>
    <path d="M 296 210 L 320 228 L 308 234"/><path d="M 296 210 L 326 216 L 318 224"/>
    <path d="M 200 306 L 188 378 L 164 390 M 188 378 L 206 390"/>
    <path d="M 284 324 L 296 378 L 278 390 M 296 378 L 318 390"/>
    <path d="M 152 240 C 116 222 80 234 56 210 Q 38 192 44 180"/>`,
  sailboat: `<path d="M 84 309 L 117 364 L 403 364 L 436 309"/>
    <line x1="84" y1="309" x2="436" y2="309"/>
    <line x1="260" y1="309" x2="260" y2="67"/>
    <path d="M 260 78 L 392 298 L 260 298"/>
    <path d="M 260 78 Q 348 177 392 298"/>
    <path d="M 260 89 L 150 298 L 260 298"/>
    <path d="M 260 89 Q 194 188 150 298"/>
    <path d="M 260 67 L 238 78 L 260 89"/>
    <line x1="128" y1="331" x2="392" y2="331"/>
    <circle cx="216" cy="329" r="9"/><circle cx="304" cy="329" r="9"/>
    <path d="M 51 381 Q 117 370 183 381"/><path d="M 238 386 Q 304 375 370 386"/><path d="M 403 381 Q 436 373 469 381"/>`,
  owl: `<ellipse cx="260" cy="270" rx="90" ry="120"/>
    <circle cx="260" cy="144" r="66"/>
    <path d="M 212 96 L 188 48 L 224 84"/><path d="M 308 96 L 332 48 L 296 84"/>
    <circle cx="234" cy="144" r="26"/><circle cx="286" cy="144" r="26"/>
    <circle cx="234" cy="144" r="12"/><circle cx="286" cy="144" r="12"/>
    <path d="M 252 162 L 260 186 L 268 162"/>
    <path d="M 236 234 L 248 246 L 260 234"/><path d="M 260 234 L 272 246 L 284 234"/>
    <path d="M 230 264 L 246 276 L 260 264"/><path d="M 260 264 L 274 276 L 290 264"/>
    <path d="M 236 294 L 248 306 L 260 294"/><path d="M 260 294 L 272 306 L 284 294"/>
    <path d="M 174 222 Q 122 282 140 354"/><path d="M 346 222 Q 398 282 380 354"/>
    <path d="M 230 384 L 212 408 M 230 384 L 230 412 M 230 384 L 248 408"/>
    <path d="M 290 384 L 272 408 M 290 384 L 290 412 M 290 384 L 308 408"/>
    <line x1="128" y1="396" x2="392" y2="396"/>`,
  diamond: `<path d="M 164 162 L 260 54 L 356 162"/>
    <line x1="164" y1="162" x2="356" y2="162"/>
    <path d="M 164 162 L 260 402 L 356 162"/>
    <line x1="212" y1="54" x2="200" y2="162"/><line x1="260" y1="54" x2="260" y2="162"/><line x1="308" y1="54" x2="320" y2="162"/>
    <line x1="212" y1="54" x2="308" y2="54"/>
    <line x1="164" y1="162" x2="212" y2="54"/><line x1="356" y1="162" x2="308" y2="54"/>
    <line x1="200" y1="162" x2="260" y2="402"/><line x1="260" y1="162" x2="260" y2="402"/><line x1="320" y1="162" x2="260" y2="402"/>
    <line x1="116" y1="102" x2="128" y2="114"/><line x1="128" y1="102" x2="116" y2="114"/>
    <line x1="392" y1="126" x2="404" y2="138"/><line x1="404" y1="126" x2="392" y2="138"/>
    <line x1="290" y1="24" x2="296" y2="36"/><line x1="296" y1="24" x2="290" y2="36"/>`,
  butterfly: `<line x1="260" y1="84" x2="260" y2="337"/>
    <circle cx="260" cy="84" r="16"/>
    <path d="M 251 72 Q 214 26 203 20"/><circle cx="199" cy="18" r="6"/>
    <path d="M 269 72 Q 306 26 318 20"/><circle cx="321" cy="18" r="6"/>
    <path d="M 260 118 C 191 61 88 84 88 164 C 88 222 168 233 260 210"/>
    <path d="M 260 118 C 329 61 433 84 433 164 C 433 222 352 233 260 210"/>
    <path d="M 260 222 C 191 222 111 268 122 337 C 134 371 214 360 260 325"/>
    <path d="M 260 222 C 329 222 410 268 398 337 C 387 371 306 360 260 325"/>
    <circle cx="174" cy="153" r="23"/><circle cx="346" cy="153" r="23"/>
    <circle cx="185" cy="296" r="16"/><circle cx="335" cy="296" r="16"/>`,
  guitar: `<path d="M 236 24 L 236 90 L 284 90 L 284 24"/><path d="M 236 24 Q 260 12 284 24"/>
    <line x1="236" y1="40" x2="218" y2="40"/><circle cx="214" cy="40" r="5"/>
    <line x1="236" y1="56" x2="218" y2="56"/><circle cx="214" cy="56" r="5"/>
    <line x1="236" y1="73" x2="218" y2="73"/><circle cx="214" cy="73" r="5"/>
    <line x1="284" y1="40" x2="302" y2="40"/><circle cx="306" cy="40" r="5"/>
    <line x1="284" y1="56" x2="302" y2="56"/><circle cx="306" cy="56" r="5"/>
    <line x1="284" y1="73" x2="302" y2="73"/><circle cx="306" cy="73" r="5"/>
    <line x1="236" y1="90" x2="284" y2="90"/>
    <line x1="246" y1="90" x2="246" y2="234"/><line x1="274" y1="90" x2="274" y2="234"/>
    <line x1="246" y1="120" x2="274" y2="120"/><line x1="246" y1="148" x2="274" y2="148"/>
    <line x1="246" y1="172" x2="274" y2="172"/><line x1="246" y1="193" x2="274" y2="193"/><line x1="246" y1="212" x2="274" y2="212"/>
    <path d="M 246 234 C 188 234 152 270 152 306"/><path d="M 274 234 C 332 234 368 270 368 306"/>
    <path d="M 152 306 Q 170 330 158 354"/><path d="M 368 306 Q 350 330 362 354"/>
    <path d="M 158 354 C 146 402 188 438 260 438 C 332 438 374 402 362 354"/>
    <circle cx="260" cy="330" r="36"/>
    <line x1="230" y1="396" x2="290" y2="396"/>
    <line x1="254" y1="90" x2="254" y2="396"/><line x1="266" y1="90" x2="266" y2="396"/>`,
  jellyfish: `<path d="M 143 158 A 117 117 0 0 1 377 158"/>
    <path d="M 143 158 Q 176 191 208 165 Q 234 152 260 171 Q 286 152 312 165 Q 345 191 377 158"/>
    <path d="M 208 139 A 52 52 0 0 1 312 139"/>
    <circle cx="231" cy="126" r="10"/><circle cx="289" cy="126" r="10"/>
    <path d="M 244 142 A 16 16 0 0 0 276 142"/>
    <path d="M 169 178 C 156 236 176 301 150 379 Q 143 405 156 418"/>
    <path d="M 208 171 C 202 249 221 314 195 405 Q 189 431 202 438"/>
    <path d="M 247 174 C 244 236 254 314 234 418 Q 230 444 244 444"/>
    <path d="M 273 174 C 280 236 273 314 293 418 Q 299 444 286 444"/>
    <path d="M 312 171 C 325 249 306 314 332 405 Q 338 431 325 438"/>
    <path d="M 351 178 C 364 236 345 301 371 379 Q 377 405 364 418"/>
    <circle cx="208" cy="93" r="7"/><circle cx="260" cy="80" r="7"/><circle cx="312" cy="93" r="7"/>`,
  get sunflower() {
    let petals = "";
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
      const px = 260 + 59 * Math.cos(a);
      const py = 184 + 59 * Math.sin(a);
      const ex = 260 + 111 * Math.cos(a);
      const ey = 184 + 111 * Math.sin(a);
      const cpx1 = 260 + 85 * Math.cos(a - 0.25);
      const cpy1 = 184 + 85 * Math.sin(a - 0.25);
      const cpx2 = 260 + 85 * Math.cos(a + 0.25);
      const cpy2 = 184 + 85 * Math.sin(a + 0.25);
      petals += `<path d="M${px} ${py} Q${cpx1} ${cpy1} ${ex} ${ey} Q${cpx2} ${cpy2} ${px} ${py}"/>`;
    }
    return `<circle cx="260" cy="184" r="52"/><circle cx="260" cy="184" r="33"/>
      <circle cx="247" cy="174" r="4"/><circle cx="273" cy="174" r="4"/>
      <circle cx="260" cy="194" r="4"/><circle cx="244" cy="191" r="4"/><circle cx="276" cy="191" r="4"/>
      ${petals}
      <path d="M 254 295 Q 247 379 254 457"/><path d="M 267 295 Q 273 379 267 457"/>
      <path d="M 254 366 Q 182 340 156 366 Q 182 386 254 379"/>
      <path d="M 267 392 Q 338 373 364 392 Q 338 412 267 402"/>
      <line x1="254" y1="373" x2="176" y2="366"/><line x1="267" y1="397" x2="345" y2="392"/>`;
  },
  pirateship: `<path d="M 71 284 L 50 326 L 92 357 L 428 357 L 470 326 L 449 284"/>
    <line x1="71" y1="284" x2="449" y2="284"/>
    <line x1="66" y1="310" x2="454" y2="310"/>
    <path d="M 71 284 Q 40 263 29 242"/>
    <path d="M 449 284 L 470 263 L 470 294"/>
    <line x1="260" y1="284" x2="260" y2="53"/><line x1="155" y1="284" x2="155" y2="105"/>
    <line x1="197" y1="84" x2="323" y2="84"/><line x1="192" y1="179" x2="328" y2="179"/>
    <path d="M 197 84 Q 192 131 192 179"/><path d="M 323 84 Q 328 131 328 179"/>
    <line x1="108" y1="126" x2="202" y2="126"/><line x1="103" y1="210" x2="208" y2="210"/>
    <path d="M 108 126 Q 103 168 103 210"/><path d="M 202 126 Q 208 168 208 210"/>
    <path d="M 244 58 L 276 58 L 279 74 L 241 74 Z"/>
    <line x1="260" y1="53" x2="260" y2="26"/>
    <path d="M 260 26 L 297 26 L 297 47 L 260 47"/>
    <circle cx="279" cy="35" r="6"/><line x1="273" y1="41" x2="285" y2="41"/>
    <path d="M 29 373 Q 103 362 176 373"/><path d="M 229 378 Q 302 368 376 378"/><path d="M 407 373 Q 449 365 491 373"/>
    <circle cx="176" cy="305" r="6"/><circle cx="260" cy="305" r="6"/><circle cx="344" cy="305" r="6"/>`,
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

  const frameCount = 1;
  const holdFrames = 8;
  const frames = [];

  const renderFrame = () => {
    ctxClip.clearRect(0, 0, width, height);
    ctxClip.fillStyle = "#121521";
    ctxClip.fillRect(0, 0, width, height);

    ctxClip.fillStyle = "#7bff93";
    ctxClip.font = "700 28px Space Grotesk, sans-serif";
    ctxClip.fillText("Drawdle", 32, 48);
    ctxClip.fillStyle = "#f4f4f6";
    ctxClip.font = "600 18px Space Grotesk, sans-serif";
    ctxClip.fillText(maskWord(dailyPrompt.title), 32, 76);
    ctxClip.fillStyle = "#9ca6bf";
    ctxClip.font = "500 14px Space Grotesk, sans-serif";
    ctxClip.fillText(`Score ${score}`, 32, 98);

    // Riddle hint as teaser
    ctxClip.fillStyle = "#f4f4f6";
    ctxClip.font = "italic 500 16px Space Grotesk, sans-serif";
    ctxClip.fillText(`"${dailyPrompt.hint}"`, 32, 130);

    // Centered score display (no drawings to avoid spoilers)
    const centerX = width / 2;
    const centerY = height / 2 + 30;

    ctxClip.fillStyle = "#7bff93";
    ctxClip.font = "800 120px Space Grotesk, sans-serif";
    const scoreStr = String(score);
    const scoreW = ctxClip.measureText(scoreStr).width;
    ctxClip.fillText(scoreStr, centerX - scoreW / 2, centerY);

    ctxClip.fillStyle = "#9ca6bf";
    ctxClip.font = "600 24px Space Grotesk, sans-serif";
    ctxClip.fillText("/ 100", centerX + scoreW / 2 + 8, centerY - 4);

    // "Can you guess?" teaser
    ctxClip.fillStyle = "#f4f4f6";
    ctxClip.font = "500 16px Space Grotesk, sans-serif";
    const teaser = "Can you guess the word? Try Drawdle!";
    const teaserW = ctxClip.measureText(teaser).width;
    ctxClip.fillText(teaser, centerX - teaserW / 2, height - 40);
  };

  renderFrame();
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
        text: `Drawdle · ${maskWord(dailyPrompt.title)} · Score ${score}`,
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

  // ── Centered score area (no drawings to avoid spoilers) ──
  const contentY = cardY + 96;

  // Prompt title (masked to avoid spoilers)
  c.fillStyle = textMuted;
  c.font = "600 15px system-ui, -apple-system, sans-serif";
  c.fillText("TODAY'S PROMPT", cardX + 44, contentY);

  c.fillStyle = text;
  c.font = "700 32px system-ui, -apple-system, sans-serif";
  c.fillText(maskWord(dailyPrompt.title), cardX + 44, contentY + 40);

  // Big score centered
  const scoreStr = String(score);
  c.font = "800 140px system-ui, -apple-system, sans-serif";
  const scoreTextW = c.measureText(scoreStr).width;
  const scoreCenterX = cardX + cardW / 2;
  const scoreX = scoreCenterX - scoreTextW / 2;
  const scoreBaseY = contentY + 190;

  // Green glow circle behind score
  const glowGrad = c.createRadialGradient(scoreCenterX, scoreBaseY - 50, 0, scoreCenterX, scoreBaseY - 50, 120);
  glowGrad.addColorStop(0, "rgba(16, 184, 86, 0.12)");
  glowGrad.addColorStop(1, "rgba(16, 184, 86, 0)");
  c.fillStyle = glowGrad;
  c.beginPath();
  c.arc(scoreCenterX, scoreBaseY - 50, 120, 0, Math.PI * 2);
  c.fill();

  c.fillStyle = green;
  c.font = "800 140px system-ui, -apple-system, sans-serif";
  c.fillText(scoreStr, scoreX, scoreBaseY);

  // /100
  c.fillStyle = textMuted;
  c.font = "600 28px system-ui, -apple-system, sans-serif";
  c.fillText("/ 100", scoreX + scoreTextW + 10, scoreBaseY - 4);

  // Feedback text
  const feedback = getScoreFeedbackText(score);
  c.fillStyle = textMuted;
  c.font = "italic 500 20px system-ui, -apple-system, sans-serif";
  const feedbackW = c.measureText(`"${feedback}"`).width;
  c.fillText(`"${feedback}"`, scoreCenterX - feedbackW / 2, scoreBaseY + 50);

  // Riddle hint (teaser for others)
  c.fillStyle = text;
  c.font = "italic 500 18px system-ui, -apple-system, sans-serif";
  const riddleText = `"${dailyPrompt.hint}"`;
  const riddleW = c.measureText(riddleText).width;
  c.fillText(riddleText, scoreCenterX - riddleW / 2, scoreBaseY + 90);

  // Grid blocks centered
  const blockSize = 32;
  const blockGap = 8;
  const totalBlockW = shareGridLength * blockSize + (shareGridLength - 1) * blockGap;
  const blockStartX = scoreCenterX - totalBlockW / 2;
  const blockY = scoreBaseY + 120;
  const filled = Math.min(shareGridLength, Math.max(0, Math.round((score / 100) * shareGridLength)));
  for (let i = 0; i < shareGridLength; i++) {
    const bx = blockStartX + i * (blockSize + blockGap);
    roundRect(c, bx, blockY, blockSize, blockSize, 6);
    c.fillStyle = i < filled ? green : greenDim;
    c.fill();
  }

  // Stats line centered
  const stats = loadStats();
  c.fillStyle = textMuted;
  c.font = "500 15px system-ui, -apple-system, sans-serif";
  const statsText = `Streak ${stats.streak}  ·  ${stats.plays} played`;
  const statsW = c.measureText(statsText).width;
  c.fillText(statsText, scoreCenterX - statsW / 2, blockY + blockSize + 30);

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
  const masked = maskWord(dailyPrompt.title);
  const shareText = `Drawdle · ${masked}\nScore: ${score}\n${buildShareGrid(score)}\nCan you guess the word?\nTry it: ${siteUrl}`;
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
  const text = `Drawdle · ${maskWord(dailyPrompt.title)}\nScore: ${score}\n${buildShareGrid(score)}\nCan you guess the word?\nTry it: ${siteUrl}`;
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
  const text = `Drawdle · ${maskWord(dailyPrompt.title)}\nScore: ${score}\n${buildShareGrid(score)}\nCan you guess the word?\nTry it: ${siteUrl}`;
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
const maskedTitle = maskWord(dailyPrompt.title);
promptTitleEl.textContent = maskedTitle;
promptHintEl.textContent = dailyPrompt.hint;
if (readyPromptLabel) readyPromptLabel.textContent = maskedTitle;
shareHeadline.textContent = `Drawdle · ${maskedTitle}`;
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
