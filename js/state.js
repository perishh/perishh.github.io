// ── state ─────────────────────────────────────────────────

/** All questions loaded from the JSON file. */
let questions = [];

/** Index of the current question being shown. */
let current = 0;

/** Number of correctly answered questions. */
let score = 0;

/** History of answers for the review screen. */
let log = []; // { question, chosen, correct }
