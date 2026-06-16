const { formatRecurringDays, isClassActiveToday } = require('./src/shared/utils/sessionTiming');
const assert = require('assert');

console.log("Mocking ES import context...");
// Since the file uses ESM imports (import/export), executing it directly in standard CommonJS Node will throw.
// But we can check syntax and logic by verifying the exports and functions.
