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
  renderMathInElement(list, { delimiters: MATH_DELIMS, throwOnError: false });

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
