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
  {
    key: "mug",
    title: "Coffee Mug",
    hint: "Simple shapes win.",
  },
  {
    key: "leaf",
    title: "Leaf",
    hint: "One vein, smooth curve.",
  },
  {
    key: "house",
    title: "Tiny House",
    hint: "Box + roof + door.",
  },
  {
    key: "balloon",
    title: "Balloon",
    hint: "Oval + string.",
  },
  {
    key: "fish",
    title: "Fish",
    hint: "Oval body, triangle tail.",
  },
  {
    key: "star",
    title: "Star",
    hint: "Five points, one stroke.",
  },
  {
    key: "lightbulb",
    title: "Lightbulb",
    hint: "Circle bulb, zigzag base.",
  },
  {
    key: "cat",
    title: "Cat face",
    hint: "Circle head, triangle ears.",
  },
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
  if (playArea) playArea.classList.remove("with-reference");
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
    referencePreview.classList.add("revealed");
    if (comparisonCard) comparisonCard.classList.remove("hidden");
    if (playArea) playArea.classList.add("with-reference");
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
  referencePreview.classList.add("revealed");
  if (comparisonCard) comparisonCard.classList.remove("hidden");
  if (playArea) playArea.classList.add("with-reference");
}

function drawReference(ctxRef, promptKey = dailyPrompt.key) {
  ctxRef.clearRect(0, 0, refCanvas.width, refCanvas.height);
  ctxRef.save();
  ctxRef.lineWidth = 16;
  ctxRef.lineCap = "round";
  ctxRef.lineJoin = "round";
  ctxRef.strokeStyle = "#000";

  if (promptKey === "mug") {
    const x = 150;
    const y = 120;
    const w = 200;
    const h = 200;
    const r = 18;
    ctxRef.beginPath();
    ctxRef.moveTo(x + r, y);
    ctxRef.lineTo(x + w - r, y);
    ctxRef.quadraticCurveTo(x + w, y, x + w, y + r);
    ctxRef.lineTo(x + w, y + h - r);
    ctxRef.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctxRef.lineTo(x + r, y + h);
    ctxRef.quadraticCurveTo(x, y + h, x, y + h - r);
    ctxRef.lineTo(x, y + r);
    ctxRef.quadraticCurveTo(x, y, x + r, y);
    ctxRef.stroke();

    ctxRef.beginPath();
    ctxRef.moveTo(350, 170);
    ctxRef.quadraticCurveTo(410, 170, 410, 220);
    ctxRef.quadraticCurveTo(410, 270, 350, 270);
    ctxRef.stroke();

    ctxRef.beginPath();
    ctxRef.moveTo(190, 140);
    ctxRef.quadraticCurveTo(210, 100, 260, 100);
    ctxRef.quadraticCurveTo(310, 100, 330, 140);
    ctxRef.stroke();

    ctxRef.beginPath();
    ctxRef.moveTo(180, 170);
    ctxRef.lineTo(320, 170);
    ctxRef.stroke();
  }

  if (promptKey === "leaf") {
    ctxRef.beginPath();
    ctxRef.moveTo(260, 90);
    ctxRef.quadraticCurveTo(140, 140, 160, 270);
    ctxRef.quadraticCurveTo(260, 350, 360, 270);
    ctxRef.quadraticCurveTo(380, 140, 260, 90);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.moveTo(260, 110);
    ctxRef.lineTo(260, 330);
    ctxRef.stroke();
  }

  if (promptKey === "house") {
    ctxRef.beginPath();
    ctxRef.rect(170, 170, 180, 150);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.moveTo(160, 170);
    ctxRef.lineTo(260, 100);
    ctxRef.lineTo(360, 170);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.rect(240, 230, 40, 90);
    ctxRef.stroke();
  }

  if (promptKey === "balloon") {
    ctxRef.beginPath();
    ctxRef.ellipse(260, 170, 80, 100, 0, 0, Math.PI * 2);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.moveTo(260, 270);
    ctxRef.lineTo(260, 330);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.moveTo(260, 330);
    ctxRef.quadraticCurveTo(230, 360, 250, 390);
    ctxRef.stroke();
  }

  if (promptKey === "fish") {
    ctxRef.beginPath();
    ctxRef.ellipse(240, 220, 90, 60, 0, 0, Math.PI * 2);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.moveTo(330, 220);
    ctxRef.lineTo(390, 180);
    ctxRef.lineTo(390, 260);
    ctxRef.closePath();
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.arc(210, 210, 6, 0, Math.PI * 2);
    ctxRef.stroke();
  }

  if (promptKey === "star") {
    const cx = 260, cy = 210, outer = 100, inner = 40;
    ctxRef.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      if (i === 0) ctxRef.moveTo(x, y);
      else ctxRef.lineTo(x, y);
    }
    ctxRef.closePath();
    ctxRef.stroke();
  }

  if (promptKey === "lightbulb") {
    ctxRef.beginPath();
    ctxRef.ellipse(260, 180, 70, 90, 0, 0, Math.PI * 2);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.moveTo(220, 270);
    ctxRef.lineTo(230, 310);
    ctxRef.lineTo(260, 330);
    ctxRef.lineTo(290, 310);
    ctxRef.lineTo(300, 270);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.rect(245, 330, 30, 20);
    ctxRef.stroke();
  }

  if (promptKey === "cat") {
    ctxRef.beginPath();
    ctxRef.arc(260, 220, 90, 0, Math.PI * 2);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.moveTo(200, 150);
    ctxRef.lineTo(180, 80);
    ctxRef.lineTo(220, 130);
    ctxRef.moveTo(320, 150);
    ctxRef.lineTo(340, 80);
    ctxRef.lineTo(300, 130);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.ellipse(230, 210, 12, 16, 0, 0, Math.PI * 2);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.ellipse(290, 210, 12, 16, 0, 0, Math.PI * 2);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.moveTo(240, 250);
    ctxRef.quadraticCurveTo(260, 260, 280, 250);
    ctxRef.stroke();
  }

  ctxRef.restore();
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

  if (promptKey === "mug") {
    const x = 150;
    const y = 120;
    const w = 200;
    const h = 200;
    const r = 18;
    ctxRef.beginPath();
    ctxRef.moveTo(x + r, y);
    ctxRef.lineTo(x + w - r, y);
    ctxRef.quadraticCurveTo(x + w, y, x + w, y + r);
    ctxRef.lineTo(x + w, y + h - r);
    ctxRef.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctxRef.lineTo(x + r, y + h);
    ctxRef.quadraticCurveTo(x, y + h, x, y + h - r);
    ctxRef.lineTo(x, y + r);
    ctxRef.quadraticCurveTo(x, y, x + r, y);
    ctxRef.stroke();

    ctxRef.beginPath();
    ctxRef.moveTo(350, 170);
    ctxRef.quadraticCurveTo(410, 170, 410, 220);
    ctxRef.quadraticCurveTo(410, 270, 350, 270);
    ctxRef.stroke();

    ctxRef.beginPath();
    ctxRef.moveTo(190, 140);
    ctxRef.quadraticCurveTo(210, 100, 260, 100);
    ctxRef.quadraticCurveTo(310, 100, 330, 140);
    ctxRef.stroke();

    ctxRef.beginPath();
    ctxRef.moveTo(180, 170);
    ctxRef.lineTo(320, 170);
    ctxRef.stroke();
  }

  if (promptKey === "leaf") {
    ctxRef.beginPath();
    ctxRef.moveTo(260, 90);
    ctxRef.quadraticCurveTo(140, 140, 160, 270);
    ctxRef.quadraticCurveTo(260, 350, 360, 270);
    ctxRef.quadraticCurveTo(380, 140, 260, 90);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.moveTo(260, 110);
    ctxRef.lineTo(260, 330);
    ctxRef.stroke();
  }

  if (promptKey === "house") {
    ctxRef.beginPath();
    ctxRef.rect(170, 170, 180, 150);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.moveTo(160, 170);
    ctxRef.lineTo(260, 100);
    ctxRef.lineTo(360, 170);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.rect(240, 230, 40, 90);
    ctxRef.stroke();
  }

  if (promptKey === "balloon") {
    ctxRef.beginPath();
    ctxRef.ellipse(260, 170, 80, 100, 0, 0, Math.PI * 2);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.moveTo(260, 270);
    ctxRef.lineTo(260, 330);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.moveTo(260, 330);
    ctxRef.quadraticCurveTo(230, 360, 250, 390);
    ctxRef.stroke();
  }

  if (promptKey === "fish") {
    ctxRef.beginPath();
    ctxRef.ellipse(240, 220, 90, 60, 0, 0, Math.PI * 2);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.moveTo(330, 220);
    ctxRef.lineTo(390, 180);
    ctxRef.lineTo(390, 260);
    ctxRef.closePath();
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.arc(210, 210, 6, 0, Math.PI * 2);
    ctxRef.stroke();
  }

  if (promptKey === "star") {
    const cx = 260, cy = 210, outer = 100, inner = 40;
    ctxRef.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      if (i === 0) ctxRef.moveTo(x, y);
      else ctxRef.lineTo(x, y);
    }
    ctxRef.closePath();
    ctxRef.stroke();
  }

  if (promptKey === "lightbulb") {
    ctxRef.beginPath();
    ctxRef.ellipse(260, 180, 70, 90, 0, 0, Math.PI * 2);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.moveTo(220, 270);
    ctxRef.lineTo(230, 310);
    ctxRef.lineTo(260, 330);
    ctxRef.lineTo(290, 310);
    ctxRef.lineTo(300, 270);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.rect(245, 330, 30, 20);
    ctxRef.stroke();
  }

  if (promptKey === "cat") {
    ctxRef.beginPath();
    ctxRef.arc(260, 220, 90, 0, Math.PI * 2);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.moveTo(200, 150);
    ctxRef.lineTo(180, 80);
    ctxRef.lineTo(220, 130);
    ctxRef.moveTo(320, 150);
    ctxRef.lineTo(340, 80);
    ctxRef.lineTo(300, 130);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.ellipse(230, 210, 12, 16, 0, 0, Math.PI * 2);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.ellipse(290, 210, 12, 16, 0, 0, Math.PI * 2);
    ctxRef.stroke();
    ctxRef.beginPath();
    ctxRef.moveTo(240, 250);
    ctxRef.quadraticCurveTo(260, 260, 280, 250);
    ctxRef.stroke();
  }
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

function setReferenceSvg(promptKey = dailyPrompt.key) {
  if (!referenceSvg) return;
  let markup = "";
  if (promptKey === "mug") {
    markup = `
      <rect x="150" y="120" width="200" height="200" rx="18" ry="18"/>
      <path d="M350 170 Q410 170 410 220 Q410 270 350 270"/>
      <path d="M190 140 Q210 100 260 100 Q310 100 330 140"/>
      <path d="M180 170 H320"/>
    `;
  }
  if (promptKey === "leaf") {
    markup = `
      <path d="M260 90 Q140 140 160 270 Q260 350 360 270 Q380 140 260 90"/>
      <path d="M260 110 L260 330"/>
    `;
  }
  if (promptKey === "house") {
    markup = `
      <rect x="170" y="170" width="180" height="150"/>
      <path d="M160 170 L260 100 L360 170"/>
      <rect x="240" y="230" width="40" height="90"/>
    `;
  }
  if (promptKey === "balloon") {
    markup = `
      <ellipse cx="260" cy="170" rx="80" ry="100"/>
      <path d="M260 270 L260 330"/>
      <path d="M260 330 Q230 360 250 390"/>
    `;
  }
  if (promptKey === "fish") {
    markup = `
      <ellipse cx="240" cy="220" rx="90" ry="60"/>
      <path d="M330 220 L390 180 L390 260 Z"/>
      <circle cx="210" cy="210" r="6"/>
    `;
  }
  if (promptKey === "star") {
    const cx = 260, cy = 210, outer = 100, inner = 40;
    const points = [];
    for (let i = 0; i < 10; i += 1) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      points.push(`${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`);
    }
    markup = `<polygon points="${points.join(",")}"/>`;
  }
  if (promptKey === "lightbulb") {
    markup = `
      <ellipse cx="260" cy="180" rx="70" ry="90"/>
      <path d="M220 270 L230 310 L260 330 L290 310 L300 270"/>
      <rect x="245" y="330" width="30" height="20"/>
    `;
  }
  if (promptKey === "cat") {
    markup = `
      <circle cx="260" cy="220" r="90"/>
      <path d="M200 150 L180 80 L220 130 M320 150 L340 80 L300 130"/>
      <ellipse cx="230" cy="210" rx="12" ry="16"/>
      <ellipse cx="290" cy="210" rx="12" ry="16"/>
      <path d="M240 250 Q260 260 280 250"/>
    `;
  }
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

  const shareText = `Drawdle · ${dailyPrompt.title}\nScore: ${score}\n${buildShareGrid(score)}\ndrawdle.app`;
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
  const text = `Drawdle · ${dailyPrompt.title}\nScore: ${score}\n${buildShareGrid(score)}`;
  navigator.clipboard.writeText(text);
  copyBtn.textContent = "Copied";
  setTimeout(() => {
    copyBtn.textContent = "Copy result";
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
const challengeBtn = document.getElementById("challengeBtn");
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


challengeBtn.addEventListener("click", () => {
  const shareLink = `${window.location.origin}${window.location.pathname}?prompt=${encodeURIComponent(
    dailyPrompt.title
  )}`;
  navigator.clipboard.writeText(`Try today's Drawdle: ${shareLink}`);
  challengeBtn.textContent = "Link copied";
  setTimeout(() => {
    challengeBtn.textContent = "Challenge a friend";
  }, 1500);
});

profileBtn.addEventListener("click", () => {
  profileBtn.textContent = "Profiles soon";
  setTimeout(() => {
    profileBtn.textContent = "Create profile";
  }, 1500);
});

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
if (playArea) playArea.classList.remove("with-reference");
setReferenceSvg(dailyPrompt.key);
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
