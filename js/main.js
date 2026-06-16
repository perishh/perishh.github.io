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
