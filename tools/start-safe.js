const {
  printReport,
  reportHasFatalError,
  runPreflight
} = require("./startup-preflight.js");

runPreflight().then((report) => {
  printReport(report);
  if (report.nodeMajor < 20) console.error("Startup check failed: Node.js 20 or newer is required.");
  if (reportHasFatalError(report)) {
    process.exitCode = 1;
    return;
  }
  if (report.portInspection.state === "angler") return;
  require("../app.js");
}).catch((error) => {
  console.error("The Angler could not complete its startup check.", error);
  process.exitCode = 1;
});
