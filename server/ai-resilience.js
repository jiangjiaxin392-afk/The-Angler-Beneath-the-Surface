"use strict";

const retryLimits = Object.freeze({
  "invalid-json": 3,
  "no-readable-output": 3,
  "provider-refusal": 3,
  "quality-rejected": 3,
  "timeout": 1,
  "upstream-rate-limited": 2,
  "upstream-service": 2,
  "upstream-http": 2,
  "not-configured": 1,
  "upstream-auth": 1
});

function failureCode(error) {
  const value = String(error?.failureCode || "unknown-failure");
  return /^[a-z0-9-]{1,48}$/.test(value) ? value : "unknown-failure";
}

function retryLimit(error) {
  return retryLimits[failureCode(error)] || 2;
}

module.exports = Object.freeze({
  failureCode,
  retryLimit
});
