const Status = require("../constants/Status.json");

const Logger = require("../utils/Logger");
const ErrorManager = require("../../errors/error-manager");

const logger = new Logger();

const { environment } = require("../../config");
const DBService = require("../services/DBService");
const { GenerateRandomNum } = require("../utils/utils");
const moment = require("moment");

module.exports = {
  GetAccountList: async (req, res) => {
    const data = await DBService.User.FindUser(1, [
      "cid",
      "fname",
      "lname",
      "cnic",
      "account_no",
      "closed",
      "type",
    ]);

    try {
      return res.json({
        status: Status.SUCCESS,
        message: "Users List.",
        data,
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  ChangeAccountPlan: async (req, res) => {
    const { cid, type } = req.body;
    if (
      !cid ||
      !type ||
      (type !== "Basic" && type !== "Premium" && type !== "World")
    ) {
      return ErrorManager.getError(res, "INCOMPLETE_ARGS");
    }
    try {
      const UserExists = await DBService.User.FindUser({ cid });

      if (UserExists.length === 0) {
        return ErrorManager.getError(res, "ACCOUNT_NOT_FOUND");
      }
      if (UserExists[0].closed) {
        return ErrorManager.getError(res, "ACCOUNT_CLOSED");
      }

      await DBService.User.UpdateUser({ type }, { cid });

      return res.json({
        status: Status.SUCCESS,
        message: "Account updated.",
        data: {},
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  GetTickets: async (req, res) => {
    const data = await DBService.Ticket.GetTickets({
      status: "active",
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
  ResolveTicket: async (req, res) => {
    const { id, reply } = req.body;
    if (!id || !reply) {
      return ErrorManager.getError(res, "INCOMPLETE_ARGS");
    }

    const TicketExists = await DBService.Ticket.GetTickets({ id });
    if (TicketExists.length === 0) {
      return ErrorManager.getError(res, "TICKET_DOESNOT_EXISTS");
    }

    if (TicketExists[0].status !== "active") {
      return ErrorManager.getError(res, "TICKET_ALREADY_RESOLVED");
    }

    await DBService.Ticket.ReplyTicket(
      {
        adminid: req.user.id,
        reply,
        status: "closed",
      },
      { id },
    );

    try {
      return res.json({
        status: Status.SUCCESS,
        message: "Ticket resolved.",
        data: {},
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  GetUserCards: async (req, res) => {
    const { cid } = req.query;
    const data = await DBService.Cards.FindActiveCards({
      cid,
    });

    try {
      return res.json({
        status: Status.SUCCESS,
        message: "Cards List.",
        data,
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  IssueCard: async (req, res) => {
    const { cid, type } = req.body;
    if (
      !cid ||
      !type ||
      (type !== "Silver" && type !== "Gold" && type !== "Platinum")
    ) {
      return ErrorManager.getError(res, "INCOMPLETE_ARGS");
    }

    const [UserExists, CardExists] = await Promise.all([
      DBService.User.FindUser({ cid }),
      DBService.Cards.FindActiveCards({
        cid,
        type,
      }),
    ]);

    if (UserExists.length === 0) {
      return ErrorManager.getError(res, "ACCOUNT_NOT_FOUND");
    }
    if (UserExists[0].closed) {
      return ErrorManager.getError(res, "ACCOUNT_CLOSED");
    }
    if (CardExists.length !== 0) {
      return ErrorManager.getError(res, "CARD_TYPE_ALREADY_EXISTS");
    }

    const cardnumber = "1234" + GenerateRandomNum(12);

    const cvc = GenerateRandomNum(3);

    const expiration = moment().add(5, "years").format("YYYY-MM-DD");

    await DBService.Cards.IssueCard({
      cid,
      type,
      cardnumber,
      cvc,
      expiration,
    });

    try {
      return res.json({
        status: Status.SUCCESS,
        message: "Card issued.",
        data: {},
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  BlockCard: async (req, res) => {
    const { cardid } = req.body;
    if (!cardid) {
      return ErrorManager.getError(res, "INCOMPLETE_ARGS");
    }

    const CardExists = await DBService.Cards.FindActiveCards({
      cardid,
    });

    if (CardExists.length === 0) {
      return ErrorManager.getError(res, "NO_ACTIVE_CARD");
    }

    await DBService.Cards.UpdateCard(
      {
        isblocked: 1,
      },
      { cardid },
    );

    try {
      return res.json({
        status: Status.SUCCESS,
        message: "Card blocked.",
        data: {},
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  CloseUserAccount: async (req, res) => {
    const { cid } = req.body;
    if (!cid) {
      return ErrorManager.getError(res, "INCOMPLETE_ARGS");
    }

    const UserExists = await DBService.User.FindUser({ cid });
    if (UserExists.length === 0) {
      return ErrorManager.getError(res, "ACCOUNT_NOT_FOUND");
    }
    if (UserExists[0].closed) {
      return ErrorManager.getError(res, "ACCOUNT_CLOSED");
    }

    await Promise.all([
      DBService.User.UpdateUser({ closed: 1 }, { cid }),
      DBService.Cards.UpdateCard({ isblocked: 1 }, { cid }),
    ]);

    try {
      return res.json({
        status: Status.SUCCESS,
        message: "Account closed.",
        data: {},
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  AddMoney: async (req, res) => {
    const { cid, amount } = req.body;
    if (!cid || !amount || isNaN(amount)) {
      return ErrorManager.getError(res, "INCOMPLETE_ARGS");
    }
    const UserExists = await DBService.User.FindUser({ cid });
    if (UserExists.length === 0) {
      return ErrorManager.getError(res, "ACCOUNT_NOT_FOUND");
    }
    if (UserExists[0].closed) {
      return ErrorManager.getError(res, "ACCOUNT_CLOSED");
    }
    await DBService.User.UpdateUser(
      { balance: UserExists[0].balance + amount },
      { cid },
    );
    try {
      return res.json({
        status: Status.SUCCESS,
        message: "Balance updated.",
        data: {},
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
};
