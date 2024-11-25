const fs = require("fs");
const { environment } = require("../config");
function errorLog(err) {
  let data = JSON.parse(fs.readFileSync("Errorlog.json", "utf8"));
  let e = {
    id: data.length,
    time: Date.now(),
    message: err.message,
    cause: err.cause,
    code: err.code,
    stack: err.stack,
    ...err,
  };

  data.push(e);
  console.error(
    "\x1b[31m",
    "[ERROR]",
    "\x1b[0m",
    "id:",
    e.id,
    "message:",
    e.message,
  );
  fs.writeFileSync("Errorlog.json", JSON.stringify(data, null, 2));
}

if (environment === "prod") {
  process.on("unhandledRejection", errorLog);

  process.on("uncaughtException", errorLog);
}
