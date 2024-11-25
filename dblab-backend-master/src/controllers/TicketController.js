const Status = require("../constants/Status.json");

const Logger = require("../utils/Logger");
const ErrorManager = require("../../errors/error-manager");

const logger = new Logger();

const { environment } = require("../../config");
const DBService = require("../services/DBService");

module.exports = {
  GetList: async (req, res) => {
    const data = await DBService.Ticket.GetTickets({
      clientid: req.user.cid,
    });

    try {
      return res.json({
        status: Status.SUCCESS,
        message: "Ticket list.",
        data,
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  CreateTicket: async (req, res) => {
    const { message } = req.body;
    if (!message) return ErrorManager.getError(res, "INCOMPLETE_ARGS");

    await DBService.Ticket.CreateTicket({
      clientid: req.user.cid,
      message,
    });

    try {
      return res.json({
        status: Status.SUCCESS,
        message: "Ticket created.",
        data: {},
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
};
