const Status = require("../constants/Status.json");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const Logger = require("../utils/Logger");
const ErrorManager = require("../../errors/error-manager");

const logger = new Logger();

const { JwtKey, environment } = require("../../config");
const DBService = require("../services/DBService");
const { GenerateRandomNum, isEmail } = require("../utils/utils");

module.exports = {
  Login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return ErrorManager.getError(res, "WRONG_CREDENTIALS");
      }

      const EmailExists = await DBService.User.FindUser({ email });
      if (EmailExists.length === 0) {
        return ErrorManager.getError(res, "WRONG_CREDENTIALS");
      }
      let user = EmailExists[0];
      if (user.password !== password) {
        return ErrorManager.getError(res, "WRONG_CREDENTIALS");
      }

      const logintoken = jwt.sign({ cid: user.cid }, JwtKey);

      return res.json({
        status: Status.SUCCESS,
        message: "Login successful.",
        data: {
          logintoken,
        },
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  Register: async (req, res) => {
    try {
      const {
        fname,
        lname,
        cnic,
        address,
        gender,
        bdate,
        email,
        password,
        type,
      } = req.body;

      if (
        !fname ||
        !lname ||
        !cnic ||
        !address ||
        !gender ||
        !bdate ||
        !email ||
        !password ||
        !type ||
        cnic.length !== 13 ||
        (gender !== "m" && gender !== "f") ||
        (type !== "Basic" && type !== "Premium" && type !== "World") ||
        password.length < 6
      ) {
        return ErrorManager.getError(res, "INCOMPLETE_ARGS");
      }

      const [CNICExists, EmailExists] = await Promise.all([
        DBService.User.FindUser({ cnic }),
        DBService.User.FindUser({ email }),
      ]);

      if (CNICExists.length !== 0) {
        return ErrorManager.getError(res, "USER_FIELD_ALREADY_EXISTS", "CNIC");
      }

      if (EmailExists.length !== 0) {
        return ErrorManager.getError(res, "USER_FIELD_ALREADY_EXISTS", "email");
      }

      const age = moment().diff(moment(bdate), "years");
      if (age < 18) {
        return ErrorManager.getError(res, "AGE_LESS_THAN_18");
      }

      const account_no = "1234" + GenerateRandomNum(10);

      const { cid } = await DBService.User.AddUser({
        fname,
        lname,
        cnic,
        address,
        gender,
        bdate,
        email,
        account_no,
        password,
        type,
      });

      const logintoken = jwt.sign({ cid }, JwtKey);

      return res.json({
        status: Status.SUCCESS,
        message: "Register successful.",
        data: {
          logintoken,
        },
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  AdminLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password || !isEmail(email)) {
        return ErrorManager.getError(res, "WRONG_CREDENTIALS");
      }

      const EmailExists = await DBService.Admin.FindAdmin({ email });
      if (EmailExists.length === 0) {
        return ErrorManager.getError(res, "WRONG_CREDENTIALS");
      }
      let user = EmailExists[0];
      if (user.password !== password) {
        return ErrorManager.getError(res, "WRONG_CREDENTIALS");
      }

      const logintoken = jwt.sign({ aid: user.id }, JwtKey);

      return res.json({
        status: Status.SUCCESS,
        message: "Login successful.",
        data: {
          logintoken,
        },
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  AdminRegister: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password || password.length < 6) {
        return ErrorManager.getError(res, "INCOMPLETE_ARGS");
      }

      const EmailExists = await DBService.Admin.FindAdmin({ email });

      if (EmailExists.length !== 0) {
        return ErrorManager.getError(res, "USER_FIELD_ALREADY_EXISTS", "email");
      }

      const { id } = await DBService.Admin.AddAdmin({
        name,
        email,
        password,
      });

      const logintoken = jwt.sign({ aid: id }, JwtKey);

      return res.json({
        status: Status.SUCCESS,
        message: "Register successful.",
        data: {
          logintoken,
        },
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
  BuyProduct: async (req, res) => {
    try {
      const { name, cardnumber, cvc, expiration, price } = req.body;
      if (!name || !cardnumber || !cvc || !expiration || !price || isNaN(price))
        return ErrorManager.getError(res, "INCOMPLETE_ARGS");

      const CardExists = await DBService.Cards.FindActiveCards({
        cardnumber,
        cvc,
      });

      if (CardExists.length === 0) {
        return ErrorManager.getError(res, "WRONG_CARD_DETAILS");
      }

      const cardexp = moment(CardExists[0].expiration);

      if (cardexp.format("MM/YY") !== expiration) {
        return ErrorManager.getError(res, "WRONG_CARD_DETAILS");
      }

      if (moment().startOf("month").isSameOrAfter(cardexp.startOf("month"))) {
        return ErrorManager.getError(res, "CARD_EXPIRED");
      }

      const client_id = CardExists[0].cid;
      const cardid = CardExists[0].cardid;

      let amount = price;
      if (CardExists[0].type === "Gold") amount = amount * 0.9;
      else if (CardExists[0].type === "Platinum") amount = amount * 0.8;

      const User = await DBService.User.FindUser({ cid: client_id });

      if (User.length === 0) {
        return ErrorManager.getError(res, "ACCOUNT_NOT_FOUND");
      }

      if (User[0].balance < amount) {
        return ErrorManager.getError(res, "NOT_ENOUGH_BALANCE");
      }

      const [DailySpent, Limits] = await Promise.all([
        DBService.Cards.DailySpent({ cardid }),
        DBService.Cards.GetLimits({ name: CardExists[0].type }),
      ]);
      console.log(DailySpent[0].amount + amount, Limits[0].poslimit);
      if (DailySpent[0].amount + amount > Limits[0].poslimit) {
        return ErrorManager.getError(res, "LIMITED_REACHED");
      }

      await DBService.Transactions.BuyProduct({
        client_id,
        name,
        cardid,
        amount,
      });

      return res.json({
        status: Status.SUCCESS,
        message: "Product successfully bought.",
        data: amount,
      });
    } catch (e) {
      ErrorManager.getError(res, "UNKNOWN_ERROR");
      logger.error(e.message + "\n" + e.stack);
      if (environment === "prod") throw e;
    }
  },
};
