import assert from "node:assert/strict";
import { clampInt, formatTime, readDuration, MAX_SECONDS, SNOOZE_SECONDS } from "./app.js";

assert.equal(formatTime(0), "00:00:00");
assert.equal(formatTime(3661), "01:01:01");
assert.equal(formatTime(-10), "00:00:00");

assert.equal(clampInt("70", 0, 59), 59);
assert.equal(clampInt("bad", 0, 59), 0);

assert.equal(readDuration({ hours: "1", minutes: "2", seconds: "3" }), 3723);
assert.equal(readDuration({ hours: "99", minutes: "99", seconds: "99" }), MAX_SECONDS);
assert.equal(SNOOZE_SECONDS, 300);

console.log("timer checks passed");
