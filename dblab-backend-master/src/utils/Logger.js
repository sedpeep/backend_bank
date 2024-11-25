const pino = require("pino");
const { environment, LOGGER_LEVEL } = require("../../config");

class Logger {
  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }
    let conf = {};
    if (environment === "production") {
      conf = {
        level: LOGGER_LEVEL || "info",
      };
    } else {
      conf = {
        level: LOGGER_LEVEL || "info",
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
      };
    }
    this.logger = pino(conf);
    Logger.instance = this;
  }

  info(message) {
    this.logger.info(message);
  }

  error(message) {
    this.logger.error(message);
  }

  debug(message) {
    this.logger.debug(message);
  }

  warn(message) {
    this.logger.warn(message);
  }

  fatal(message) {
    this.logger.fatal(message);
  }

  trace(message) {
    this.logger.trace(message);
  }

  child(options) {
    return this.logger.child(options);
  }
}

module.exports = Logger;
