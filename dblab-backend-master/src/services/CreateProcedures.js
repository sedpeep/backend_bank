const GetPool = require("../../config/database");
const Logger = require("../utils/Logger");
const logger = new Logger();

module.exports = async () => {
  const pool = await GetPool();
  try {
    await pool.query(`
    CREATE PROCEDURE AddClient
        @fname VARCHAR(255),
        @lname VARCHAR(255),
        @cnic VARCHAR(255),
        @address VARCHAR(255),
        @gender CHAR(1),
        @bdate DATE,
        @email VARCHAR(255),
        @account_no VARCHAR(255),
        @password VARCHAR(255),
        @type VARCHAR(255)
    AS
    BEGIN
        INSERT INTO clients (fname, lname, cnic, address, gender, bdate, email, account_no, password, type)
        VALUES (@fname, @lname, @cnic, @address, @gender, @bdate, @email, @account_no, @password, @type);
    END;
`);
    await pool.query(`
    -- Add transaction
    CREATE PROCEDURE AddTransactionFromBeneficiary
        @client_id INT,
        @name VARCHAR(255),
        @beneficiary_id INT,
        @amount FLOAT
        AS
    BEGIN
        DECLARE @balance FLOAT;
        DECLARE @beneficiary_account VARCHAR(255);
        DECLARE @bank VARCHAR(255);

        IF EXISTS (SELECT 1 FROM beneficiary WHERE bid = @beneficiary_id AND cid = @client_id)
        BEGIN
            SELECT @balance = balance FROM clients WHERE cid = @client_id;
            SELECT @beneficiary_account = account_no FROM beneficiary WHERE bid = @beneficiary_id;
            SELECT @bank = bank FROM beneficiary WHERE bid = @beneficiary_id;

            IF @bank = 'HelloBank'
            BEGIN
                UPDATE clients SET balance = balance - @amount WHERE cid = @client_id;
                UPDATE clients SET balance = balance + @amount WHERE account_no = @beneficiary_account;

                INSERT INTO transactions (cid, name, account_no, bank, amount, type)
                VALUES (@client_id, @name, @beneficiary_account, @bank, @amount, 'transfer');
            END
            ELSE
            BEGIN
                UPDATE clients SET balance = balance - @amount WHERE cid = @client_id;

                INSERT INTO transactions (cid, name, account_no, bank, amount, type)
                VALUES (@client_id, @name, @beneficiary_account, @bank, @amount, 'transfer');
            END
        END
        ELSE
        BEGIN
            PRINT 'Beneficiary not found for the specified client';
            RETURN;
        END
    END;
`);

    await pool.query(`
                    
        CREATE PROCEDURE BuyCompanyProduct
        @client_id INT,
        @name VARCHAR(255),
        @cardid VARCHAR(255),
        @amount FLOAT
        AS
        BEGIN
        DECLARE @balance FLOAT

        SET @balance = (SELECT balance FROM clients WHERE cid = @client_id)
        UPDATE clients SET balance = balance - @amount WHERE cid = @client_id

        INSERT INTO transactions (cid, name, account_no, bank, amount, type)
        VALUES (@client_id, @name, '1000100010001000', 'ProductBank', @amount, 'purchase')

        INSERT INTO productbuy (tid, cid, cardid, amount)
        VALUES (SCOPE_IDENTITY(), @client_id, @cardid, @amount)
        END
`);
    logger.info("Procedures made.");
  } catch (e) {
    logger.info("Procedures already made, loaded them.");
    //    console.log(e);
  }
};
