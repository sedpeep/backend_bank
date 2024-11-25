const Status = require("../constants/Status.json");

const Logger = require("../utils/Logger");
const ErrorManager = require("../../errors/error-manager");

const logger = new Logger();

const { environment } = require("../../config");
const DBService = require("../services/DBService");
const { isEmail } = require("../utils/utils");

module.exports = {
  GetInfo: async (req, res) => {
    let user = { ...req.user };

    delete user.password;

    const [limits, transactions] = await Promise.all([
      DBService.Transactions.GetLimits({ name: user.type }),
      DBService.Transactions.DailyTransactions({ cid: user.cid }),
    ]);
    try {
      return res.json({
        status: Status.SUCCESS,
        message: "User details.",
        data: {
          user,
          limits: limits[0],
          transactions: transactions[0],
        },
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  UpdateEmail: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !isEmail(email)) {
        return ErrorManager.getError(res, "INVALID_ARGUMENTS");
      }

      const EmailExists = await DBService.User.FindUser({ email });
      if (EmailExists.length !== 0) {
        return ErrorManager.getError(res, "USER_FIELD_ALREADY_EXISTS", "email");
      }

      await DBService.User.UpdateUser({ email }, { cid: req.user.cid });

      return res.json({
        status: Status.SUCCESS,
        message: "Email updated.",
        data: {},
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  UpdatePassword: async (req, res) => {
    try {
      const { password } = req.body;
      if (!password || password.length < 6) {
        return ErrorManager.getError(res, "INVALID_ARGUMENTS");
      }

      await DBService.User.UpdateUser({ password }, { cid: req.user.cid });

      return res.json({
        status: Status.SUCCESS,
        message: "Password updated.",
        data: {},
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  GetCards: async (req, res) => {
    try {
      const data = await DBService.Cards.FindActiveCards({
        cid: req.user.cid,
      });
      return res.json({
        status: Status.SUCCESS,
        message: "Card Details.",
        data,
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
};
