export const MAX_SECONDS = 23 * 3600 + 59 * 60 + 59;
export const SNOOZE_SECONDS = 5 * 60;

export function clampInt(value, min, max) {
  const number = Number.parseInt(value, 10);
  return Math.min(Math.max(Number.isFinite(number) ? number : 0, min), max);
}

export function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export function readDuration({ hours, minutes, seconds }) {
  return Math.min(
    clampInt(hours, 0, 23) * 3600 + clampInt(minutes, 0, 59) * 60 + clampInt(seconds, 0, 59),
    MAX_SECONDS,
  );
}

if (typeof document !== "undefined") {
const $ = (id) => document.getElementById(id);

const elements = {
  display: $("display"),
  status: $("status"),
  hours: $("hours"),
  minutes: $("minutes"),
  seconds: $("seconds"),
  start: $("start"),
  pause: $("pause"),
  resume: $("resume"),
  snooze: $("snooze"),
  stop: $("stop"),
  sound: $("tick-sound"),
};

const STORAGE_KEY = "timer:last-duration-seconds";

let originalSeconds = 0;
let remainingSeconds = 0;
let state = "idle";
let intervalId;
let lastWholeSecond;

elements.sound.loop = true;

function setInputsDisabled(disabled) {
  elements.hours.disabled = disabled;
  elements.minutes.disabled = disabled;
  elements.seconds.disabled = disabled;
}

function stopSound() {
  elements.sound.pause();
  elements.sound.currentTime = 0;
}

function updateButtons() {
  elements.start.disabled = state !== "idle";
  elements.pause.disabled = state !== "running";
  elements.resume.disabled = state !== "paused";
  elements.snooze.disabled = state !== "finished";
  elements.stop.disabled = state === "idle";
  setInputsDisabled(state !== "idle");
}

function render(message) {
  elements.display.textContent = formatTime(remainingSeconds);
  elements.status.textContent = message;
  updateButtons();
}

function syncInputs(seconds) {
  elements.hours.value = Math.floor(seconds / 3600);
  elements.minutes.value = Math.floor((seconds % 3600) / 60);
  elements.seconds.value = seconds % 60;
}

function saveDuration(seconds) {
  localStorage.setItem(STORAGE_KEY, String(seconds));
}

function loadDuration() {
  return clampInt(localStorage.getItem(STORAGE_KEY), 0, MAX_SECONDS);
}

function playFinalWarning() {
  if (remainingSeconds <= 7 && remainingSeconds > 0 && elements.sound.paused) {
    elements.sound.play().catch(() => {
      elements.status.textContent = "Final seconds. Browser blocked audio; tap the page once.";
    });
  }
}

function finish() {
  clearInterval(intervalId);
  state = "finished";
  remainingSeconds = 0;
  stopSound();
  render("Time's up. Snooze or stop.");
}

function tick() {
  const now = Date.now();
  const elapsed = Math.floor((now - lastWholeSecond) / 1000);
  if (elapsed < 1) return;

  lastWholeSecond += elapsed * 1000;
  remainingSeconds = Math.max(0, remainingSeconds - elapsed);
  playFinalWarning();

  if (remainingSeconds === 0) finish();
  else render("Running…");
}

function run(seconds, resetOriginal = false) {
  clearInterval(intervalId);
  stopSound();
  remainingSeconds = seconds;
  if (resetOriginal) originalSeconds = seconds;
  state = "running";
  lastWholeSecond = Date.now();
  playFinalWarning();
  render("Running…");
  intervalId = setInterval(tick, 200);
}

function start() {
  const seconds = readDuration({
    hours: elements.hours.value,
    minutes: elements.minutes.value,
    seconds: elements.seconds.value,
  });

  if (seconds === 0) {
    render("Choose a duration greater than zero.");
    return;
  }

  syncInputs(seconds);
  saveDuration(seconds);
  run(seconds, true);
}

function pause() {
  clearInterval(intervalId);
  stopSound();
  state = "paused";
  render("Paused.");
}

function resume() {
  if (remainingSeconds > 0) run(remainingSeconds);
}

function snooze() {
  run(SNOOZE_SECONDS);
}

function stop() {
  clearInterval(intervalId);
  stopSound();
  remainingSeconds = originalSeconds;
  state = "idle";
  syncInputs(originalSeconds);
  render("Stopped. Ready to start again.");
}

function previewInput() {
  if (state !== "idle") return;
  remainingSeconds = readDuration({
    hours: elements.hours.value,
    minutes: elements.minutes.value,
    seconds: elements.seconds.value,
  });
  saveDuration(remainingSeconds);
  render("Set a duration to start.");
}

elements.start.addEventListener("click", start);
elements.pause.addEventListener("click", pause);
elements.resume.addEventListener("click", resume);
elements.snooze.addEventListener("click", snooze);
elements.stop.addEventListener("click", stop);
[elements.hours, elements.minutes, elements.seconds].forEach((input) => input.addEventListener("input", previewInput));

const savedSeconds = loadDuration();
if (savedSeconds > 0) syncInputs(savedSeconds);
previewInput();
}
