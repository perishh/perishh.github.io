// ── input / validation ────────────────────────────────────

const errEl = document.getElementById("errEl");

/** Fetch lecture JSON, validate, and start the quiz. */
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
  const qTextEl = document.getElementById("q-text");
  qTextEl.innerHTML = esc(q.text);
  renderMathInElement(qTextEl, {
    delimiters: MATH_DELIMS,
    throwOnError: false,
  });

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
  renderMathInElement(grid, { delimiters: MATH_DELIMS, throwOnError: false });
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
    const explText = document.getElementById("expl-text");
    explText.innerHTML = esc(q.explanation);
    renderMathInElement(explText, {
      delimiters: MATH_DELIMS,
      throwOnError: false,
    });
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
