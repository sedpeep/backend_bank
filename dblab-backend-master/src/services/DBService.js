const sql = require("mssql");
const GetPool = require("../../config/database");
const {
  CreateInsert,
  CreateSearch,
  CreateDelete,
  CreateUpdate,
  CreateExecute,
} = require("../utils/utils");
const moment = require("moment");

const Logger = require("../utils/Logger");
const { environment } = require("../../config");
const logger = new Logger();

module.exports = {
  User: {
    AddUser: async (data) => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateExecute("AddClient", data);

        query += CreateSearch("clients", { account_no: data.account_no });

        const result = await request.query(query);

        return result.recordset[0];
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    FindUser: async (data, fields = "*") => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateSearch("clients", data, fields);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    UpdateUser: async (data, where) => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateUpdate("clients", data, where);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
  },
  Beneficiary: {
    GetList: async (data, fields = "*") => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateSearch("beneficiary", data, fields);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    GetList: async (data, fields = "*") => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateSearch("beneficiary", data, fields);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    Add: async (data) => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateInsert("beneficiary", data);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    Update: async (set, where) => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateUpdate("beneficiary", set, where);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    Delete: async (where) => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateDelete("beneficiary", where);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
  },
  Transactions: {
    GetLimits: async (data, fields = "*") => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateSearch("acctypes", data, fields);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    AddTransfer: async (data) => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateExecute("AddTransactionFromBeneficiary", data);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    BuyProduct: async (data) => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateExecute("BuyCompanyProduct", data);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    List: async (cid, account_no, start, end) => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateSearch("AllTransactions", {
          $or: {
            cid,
            account_no,
          },
          time: {
            $gte: moment(start).format("YYYY-MM-DD HH:mm:ss"),
            $lte: moment(end).endOf("day").format("YYYY-MM-DD HH:mm:ss"),
          },
        });

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    DailyTransactions: async (data, fields = "*") => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateSearch("DailyTransactions", data, fields);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
  },
  Ticket: {
    CreateTicket: async (data) => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateInsert("tickets", data);

        return await request.query(query);
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    GetTickets: async (data, fields = "*") => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateSearch("tickets", data, fields);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    ReplyTicket: async (data, where) => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateUpdate("tickets", data, where);

        return await request.query(query);
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
  },
  Cards: {
    FindActiveCards: async (data, fields = "*") => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateSearch("ActiveCards", data, fields);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    IssueCard: async (data) => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateInsert("cards", data);

        return await request.query(query);
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    UpdateCard: async (data, where) => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateUpdate("cards", data, where);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    DailySpent: async (data, fields = "*") => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateSearch("DailyCardSummary", data, fields);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    GetLimits: async (data, fields = "*") => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateSearch("cardtypes", data, fields);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
  },
  Admin: {
    AddAdmin: async (data) => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateInsert("admins", data);

        query += CreateSearch("admins", { email: data.email });

        const result = await request.query(query);

        return result.recordset[0];
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    FindAdmin: async (data, fields = "*") => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateSearch("admins", data, fields);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
  },
  Products: {
    CreateProduct: async (data) => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateInsert("products", data);

        query += CreateSearch("products", { id: data.id, type: data.type });

        const result = await request.query(query);

        return result.recordset[0];
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
    FindProducts: async (data, fields = "*") => {
      try {
        const pool = await GetPool();
        const request = pool.request();
        let query = CreateSearch("products", data, fields);

        const result = await request.query(query);

        return result.recordset;
      } catch (e) {
        logger.error(e.message + "\n" + e.stack);
        if (environment === "prod") throw e;
      }
    },
  },
};
