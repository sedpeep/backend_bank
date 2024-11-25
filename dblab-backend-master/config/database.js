const sql = require("mssql");
const Logger = require("../src/utils/Logger");
const logger = new Logger();
const dbconfig = require("../dbconfig");

let pool;

async function getPool() {
  if (!pool) {
    try {
      pool = await sql.connect(dbconfig);
      //      logger.info(`Connected to the database!`);
    } catch (error) {
      console.error("Error connecting to the database:", error);
      throw error;
    }
  }
  return pool;
}

module.exports = getPool;
