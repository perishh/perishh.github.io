// ── helpers ──────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function show(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  const el = document.getElementById(id);
  el.classList.add("active");
}

// ── state ─────────────────────────────────────────────────
let questions = [];
let current = 0;
let score = 0;
let log = []; // { question, chosen, correct }

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// ── input / validation ────────────────────────────────────
async function startQuiz(lecture) {
  const res = await fetch(`./lecture${lecture}.json`);
  const data = await res.json();

  if (
    !data.questions ||
    !Array.isArray(data.questions) ||
    !data.questions.length
  ) {
    errEl.textContent = 'Missing or empty "questions" array.';
    return;
  }
  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i];
    if (typeof q.text !== "string" || !q.text.trim()) {
      errEl.textContent = `Question ${i + 1}: "text" must be a non-empty string.`;
      return;
    }
    if (!Array.isArray(q.answers) || !q.answers.length) {
      errEl.textContent = `Question ${i + 1}: "answers" must be a non-empty array.`;
      return;
    }
    if (
      typeof q.answerIndex !== "number" ||
      q.answerIndex < 0 ||
      q.answerIndex >= q.answers.length
    ) {
      errEl.textContent = `Question ${i + 1}: "answerIndex" is out of range.`;
      return;
    }
  }

  questions = data.questions;
  current = 0;
  score = 0;
  log = [];
  show("screen-quiz");
  renderQuestion();
}

// ── quiz rendering ────────────────────────────────────────
function renderQuestion() {
  const q = questions[current];
  const total = questions.length;

  document.getElementById("q-fraction").textContent =
    `${current + 1} / ${total}`;
  document.getElementById("prog-fill").style.width =
    `${(current / total) * 100}%`;
  document.getElementById("q-text").innerHTML = esc(q.text);

  const expl = document.getElementById("explanation");
  expl.classList.remove("visible");
  document.getElementById("next-btn").style.display = "none";

  const grid = document.getElementById("answers");
  grid.innerHTML = "";
  q.answers.forEach((ans, i) => {
    const btn = document.createElement("button");
    btn.className = "ans-btn";
    btn.setAttribute("role", "listitem");
    btn.innerHTML = `<span class="ltr">${esc(LETTERS[i] || String(i + 1))}</span><span>${esc(String(ans))}</span>`;
    btn.addEventListener("click", () => pick(i));
    grid.appendChild(btn);
  });
}

function pick(idx) {
  const q = questions[current];
  const btns = document.querySelectorAll(".ans-btn");
  btns.forEach((b) => (b.disabled = true));

  const correct = idx === q.answerIndex;
  if (correct) score++;
  log.push({ question: q, chosen: idx, correct });

  btns[idx].classList.add(correct ? "correct" : "wrong");
  if (!correct) btns[q.answerIndex].classList.add("correct");

  if (q.explanation) {
    document.getElementById("expl-text").innerHTML = esc(q.explanation);
    document.getElementById("explanation").classList.add("visible");
  }

  const nb = document.getElementById("next-btn");
  nb.style.display = "inline-flex";
  nb.innerHTML =
    current === questions.length - 1
      ? 'See results <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style="margin-left:2px"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : 'Next <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style="margin-left:2px"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function nextQuestion() {
  current++;
  if (current >= questions.length) {
    showResults();
    return;
  }
  document.getElementById("prog-fill").style.width =
    `${(current / questions.length) * 100}%`;
  renderQuestion();
}

// ── results ───────────────────────────────────────────────
function showResults() {
  const total = questions.length;
  const pct = total ? score / total : 0;
  const circ = 263.89;

  document.getElementById("res-score").textContent = score;
  document.getElementById("res-total").textContent = `of ${total}`;
  setTimeout(() => {
    document.getElementById("ring-arc").style.strokeDashoffset =
      circ - pct * circ;
  }, 80);

  const msgs = [
    [1.0, "Flawless.", "Perfect score — every answer correct."],
    [0.8, "Excellent.", "You really know your material."],
    [0.6, "Good effort.", "A few questions to revisit."],
    [0.4, "Getting there.", "Keep studying and try again."],
    [0.0, "Keep going.", "Review the explanations and retry."],
  ];
  const [, msg, sub] = msgs.find(([t]) => pct >= t);
  document.getElementById("res-msg").textContent = msg;
  document.getElementById("res-sub").textContent = sub;

  const list = document.getElementById("review-list");
  list.innerHTML = "";
  log.forEach(({ question: q, chosen, correct }) => {
    const div = document.createElement("div");
    div.className = "ri " + (correct ? "ok" : "bad");
    const chosenLabel = `${LETTERS[chosen] || chosen + 1}. ${q.answers[chosen]}`;
    const correctLabel = `${LETTERS[q.answerIndex] || q.answerIndex + 1}. ${q.answers[q.answerIndex]}`;
    let inner = `<div class="ri-q">${esc(q.text)}</div>`;
    inner += `<div class="ri-row${correct ? " good" : ""}">Your answer: ${esc(chosenLabel)}</div>`;
    if (!correct)
      inner += `<div class="ri-row good">Correct: ${esc(correctLabel)}</div>`;
    if (q.explanation)
      inner += `<div class="ri-expl">${esc(q.explanation)}</div>`;
    div.innerHTML = inner;
    list.appendChild(div);
  });

  show("screen-result");
}

function retakeQuiz() {
  current = 0;
  score = 0;
  log = [];
  document.getElementById("ring-arc").style.strokeDashoffset = "263.89";
  show("screen-quiz");
  renderQuestion();
}

function goHome() {
  document.getElementById("ring-arc").style.strokeDashoffset = "263.89";
  show("screen-input");
}

// ── keyboard nav ──────────────────────────────────────────
document.addEventListener("keydown", (e) => {
  if (document.getElementById("screen-quiz").classList.contains("active")) {
    const keys = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7 };
    if (e.key in keys) {
      const btns = document.querySelectorAll(".ans-btn");
      const idx = keys[e.key];
      if (btns[idx] && !btns[idx].disabled) btns[idx].click();
    }
    if (
      (e.key === "Enter" || e.key === " ") &&
      document.getElementById("next-btn").style.display !== "none"
    ) {
      document.getElementById("next-btn").click();
    }
  }
});
