const GetPool = require("../../config/database");
const Logger = require("../utils/Logger");
const logger = new Logger();

module.exports = async () => {
  const pool = await GetPool();
  try {
    await pool.query(`
    -- Transaction Summary
    CREATE VIEW DailyTransactions AS
    SELECT c.cid,
        SUM(CASE WHEN t.bank = 'HelloBank' THEN t.amount ELSE 0 END) AS hellodebit, 
        SUM(CASE WHEN t.bank <> 'HelloBank' THEN t.amount ELSE 0 END) AS ibftdebit
    FROM clients c
    LEFT JOIN transactions t ON t.cid = c.cid AND t.time >= DATEADD(DAY, -1, GETDATE()) AND t.type = 'transfer'
    GROUP BY c.cid;
`);

    await pool.query(`
    CREATE VIEW DailyCardSummary AS
    SELECT c.cardid, SUM(t.amount) AS amount
    FROM ActiveCards c
    LEFT JOIN productbuy p ON c.cardid = p.cardid
    LEFT JOIN transactions t ON t.tid = p.tid AND t.time >= DATEADD(DAY, -1, GETDATE())
    GROUP BY c.cardid;
    `);
    await pool.query(`
    CREATE VIEW ActiveCards AS
    SELECT c.cardid, c.cid, CONCAT(cl.fname, ' ', cl.lname) as name, c.type, c.cardnumber, c.cvc, c.expiration, c.type
    FROM cards c
    JOIN clients cl ON c.cid = cl.cid
    WHERE c.isblocked = 0;
`);
    await pool.query(`
    -- All Transactions
    CREATE VIEW AllTransactions AS
    SELECT t.tid, c.cid, CONCAT(c.fname, ' ', c.lname) as sender, t.name as receiver, t.account_no, t.time, t.amount, t.type
    FROM transactions t
    JOIN clients c ON t.cid = c.cid;
`);

    logger.info("Views made.");
  } catch (e) {
    logger.info("Views already made, loaded them.");
    //    console.log(e);
  }
};
