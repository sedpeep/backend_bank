const Status = require("../constants/Status.json");

const Logger = require("../utils/Logger");
const ErrorManager = require("../../errors/error-manager");

const logger = new Logger();

const { environment } = require("../../config");
const DBService = require("../services/DBService");

module.exports = {
  GetList: async (req, res) => {
    try {
      const data = await DBService.Beneficiary.GetList({ cid: req.user.cid });
      return res.json({
        status: Status.SUCCESS,
        message: "Beneficiaries.",
        data,
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  Add: async (req, res) => {
    try {
      const { nickname, account_no, bank } = req.body;
      if (!nickname || !account_no || !bank)
        return ErrorManager.getError(res, "INCOMPLETE_ARGS");

      if (account_no === req.user.account_no) {
        return ErrorManager.getError(res, "BENEFICIARY_ITSELF");
      }

      let username = nickname;
      const BeneficiaryExists = await DBService.Beneficiary.GetList({
        account_no,
        cid: req.user.cid,
      });
      if (BeneficiaryExists.length !== 0) {
        return ErrorManager.getError(res, "BENEFICIARY_ALREADY_EXISTS");
      }

      if (bank === "HelloBank") {
        const AccountExists = await DBService.User.FindUser({
          account_no,
        });

        if (AccountExists.length === 0) {
          return ErrorManager.getError(res, "ACCOUNT_NOT_FOUND");
        }

        username = `${AccountExists[0].fname} ${AccountExists[0].lname}`;
      }

      await DBService.Beneficiary.Add({
        name: username,
        nickname,
        cid: req.user.cid,
        account_no,
        bank,
      });
      return res.json({
        status: Status.SUCCESS,
        message: "Beneficiary Added.",
        data: {},
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  Modify: async (req, res) => {
    try {
      const { bid, nickname } = req.body;
      if (!bid || !nickname)
        return ErrorManager.getError(res, "INCOMPLETE_ARGS");

      const AccountExists = await DBService.Beneficiary.GetList({ bid });

      if (AccountExists.length === 0) {
        return ErrorManager.getError(res, "ACCOUNT_NOT_FOUND");
      }
      if (AccountExists[0].cid !== req.user.cid) {
        return ErrorManager.getError(res, "ACCOUNT_NOT_FOUND");
      }

      await DBService.Beneficiary.Update({ nickname }, { bid });

      return res.json({
        status: Status.SUCCESS,
        message: "Beneficiary updated.",
        data: {},
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  Delete: async (req, res) => {
    try {
      const { bid } = req.body;
      if (!bid) return ErrorManager.getError(res, "INCOMPLETE_ARGS");

      const AccountExists = await DBService.Beneficiary.GetList({ bid });

      if (AccountExists.length === 0) {
        return ErrorManager.getError(res, "ACCOUNT_NOT_FOUND");
      }
      if (AccountExists[0].cid !== req.user.cid) {
        return ErrorManager.getError(res, "ACCOUNT_NOT_FOUND");
      }

      await DBService.Beneficiary.Delete({ bid });

      return res.json({
        status: Status.SUCCESS,
        message: "Beneficiary deleted.",
        data: {},
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
};
