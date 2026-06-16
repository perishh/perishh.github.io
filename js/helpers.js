// ── helpers ──────────────────────────────────────────────

/** KaTeX delimiters (auto-render defaults don't include $…$). */
const MATH_DELIMS = [
  { left: "$$", right: "$$", display: true },
  { left: "$", right: "$", display: false },
  { left: "\\[", right: "\\]", display: true },
  { left: "\\(", right: "\\)", display: false },
];

/** Escape HTML special characters. */
function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Show the screen with the given id, hiding all others. */
function show(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  const el = document.getElementById(id);
  el.classList.add("active");
}

/** Letter labels for answer buttons (up to 8). */
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// ── theme ────────────────────────────────────────────────

/** Apply the theme and persist to localStorage. */
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  document.getElementById("theme-icon").textContent =
    theme === "light" ? "☀️" : "🌙";
}

/** Toggle between light and dark. */
function toggleTheme() {
  const next =
    document.documentElement.getAttribute("data-theme") === "light"
      ? "dark"
      : "light";
  setTheme(next);
}

/** Restore saved theme or respect OS preference. */
function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved) {
    setTheme(saved);
  } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    setTheme("light");
  } else {
    setTheme("dark");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  document
    .getElementById("theme-toggle")
    .addEventListener("click", toggleTheme);
});
