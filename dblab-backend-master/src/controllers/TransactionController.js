const Status = require("../constants/Status.json");

const Logger = require("../utils/Logger");
const ErrorManager = require("../../errors/error-manager");

const logger = new Logger();

const { environment } = require("../../config");
const DBService = require("../services/DBService");

module.exports = {
  TransferMoney: async (req, res) => {
    try {
      const { bid, amount } = req.body;
      if (!bid || !amount || isNaN(amount))
        return ErrorManager.getError(res, "INCOMPLETE_ARGS");

      const BeneficiaryExists = await DBService.Beneficiary.GetList({
        bid,
        cid: req.user.cid,
      });
      if (BeneficiaryExists.length === 0) {
        return ErrorManager.getError(res, "ACCOUNT_NOT_FOUND");
      }

      const [limits, transactions] = await Promise.all([
        DBService.Transactions.GetLimits({ name: req.user.type }),
        DBService.Transactions.DailyTransactions({ cid: req.user.cid }),
      ]);
      if (amount < 10) {
        return ErrorManager.getError(res, "MINIMUM_TRANSACTION_ERROR");
      }

      if (BeneficiaryExists[0].bank === "HelloBank") {
        if (limits[0].hellolimit - transactions[0].hellodebit - amount < 0)
          return ErrorManager.getError(res, "LIMITED_REACHED");
      } else if (limits[0].ibftlimit - transactions[0].ibftdebit - amount < 0)
        return ErrorManager.getError(res, "LIMITED_REACHED");

      if (amount > req.user.balance) {
        return ErrorManager.getError(res, "NOT_ENOUGH_BALANCE");
      }

      await DBService.Transactions.AddTransfer({
        client_id: req.user.cid,
        name: BeneficiaryExists[0].name,
        beneficiary_id: bid,
        amount,
      });

      return res.json({
        status: Status.SUCCESS,
        message: "Amount transferred.",
        data: {},
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  GetStatement: async (req, res) => {
    try {
      const { start, end } = req.query;
      if (!start) return ErrorManager.getError(res, "INCOMPLETE_ARGS");

      const list = await DBService.Transactions.List(
        req.user.cid,
        req.user.account_no,
        start,
        end,
      );

      const data = list.map((x) => ({
        tid: x.tid,
        time: x.time,
        name: x.cid === req.user.cid ? x.receiver : x.sender,
        credit: x.account_no === req.user.account_no ? x.amount : 0,
        debit: x.cid === req.user.cid ? x.amount : 0,
        type: x.type,
      }));

      return res.json({
        status: Status.SUCCESS,
        message: "Statement.",
        data,
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
};
