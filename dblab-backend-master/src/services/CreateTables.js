const GetPool = require("../../config/database");
const Logger = require("../utils/Logger");
const logger = new Logger();

module.exports = async () => {
  const pool = await GetPool();
  // making table
  try {
    //    console.log(await pool.query("Delete from clients ;"));
    await pool.query(`-- Tables
    Create table acctypes (
        name VARCHAR(255) PRIMARY KEY,
        hellolimit FLOAT NOT NULL,
        ibftlimit FLOAT NOT NULL
    );

    create table cardtypes (
        name VARCHAR(255) PRIMARY KEY,
        isdebit BIT NOT NULL,
        poslimit FLOAT NOT NULL
    );

    Create table clients (
        cid INT PRIMARY KEY IDENTITY(1, 1),
        fname VARCHAR(255) NOT NULL,
        lname VARCHAR(255) NOT NULL,
        cnic VARCHAR(255) NOT NULL UNIQUE,
        address VARCHAR(255) NOT NULL,
        gender CHAR(1) NOT NULL,
        bdate DATE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        account_no VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance FLOAT DEFAULT 0,
        type VARCHAR(255) NOT NULL,
        timeregistered DATETIME DEFAULT CURRENT_TIMESTAMP,
        closed BIT DEFAULT 0,
        FOREIGN KEY (type) REFERENCES acctypes(name) ON UPDATE CASCADE,
        CONSTRAINT gender_check CHECK (
            gender = 'm'
            OR gender = 'f'
        ),
        CONSTRAINT age_check CHECK (DATEDIFF(YEAR, bdate, GETDATE()) >= 18)
    );

    Create table admins (
        id INT PRIMARY KEY IDENTITY(1, 1),
        name VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) UNIQUE NOT NULL
    );

    Create table beneficiary (
        bid INT PRIMARY KEY IDENTITY(1, 1),
        cid INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        nickname VARCHAR(255) NOT NULL,
        account_no VARCHAR(255) NOT NULL,
        bank VARCHAR(255) NOT NULL,
        time DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cid) REFERENCES clients(cid)
    );

    Create table transactions (
        tid INT PRIMARY KEY IDENTITY(1, 1),
        cid INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        account_no VARCHAR(255) NOT NULL,
        bank VARCHAR(255) NOT NULL,
        amount FLOAT NOT NULL,
        type VARCHAR(255) NOT NULL,
        time DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cid) REFERENCES clients(cid),
        CONSTRAINT type_check CHECK (
            type = 'transfer' OR
            type = 'purchase'
        )
    );
    Create table productbuy (
        tid INT PRIMARY KEY,
        cid INT NOT NULL,
        cardid VARCHAR(255) NOT NULL,
        amount FLOAT NOT NULL,
        FOREIGN KEY (cid) REFERENCES clients(cid),
        FOREIGN KEY (tid) REFERENCES transactions(tid)
    );

    Create table cards (
        cardid INT PRIMARY KEY IDENTITY(1, 1),
        cid INT NOT NULL,
        type VARCHAR(255) NOT NULL,
        cardnumber VARCHAR(255) NOT NULL UNIQUE,
        cvc VARCHAR(255) NOT NULL,
        expiration DATE NOT NULL,
        time DATETIME DEFAULT CURRENT_TIMESTAMP,
        isblocked BIT DEFAULT 0,

        FOREIGN KEY (cid) REFERENCES clients(cid),
        FOREIGN KEY (type) REFERENCES cardtypes(name)
    );

    create table tickets (
        id INT PRIMARY KEY IDENTITY(1, 1),
        clientid INT NOT NULL,
        message VARCHAR(MAX) NOT NULL,
        status VARCHAR(255) DEFAULT 'active',
        adminid INT DEFAULT NULL,
        reply VARCHAR(MAX) DEFAULT NULL,

        FOREIGN KEY (clientid) REFERENCES clients(cid),
        FOREIGN KEY (adminid) REFERENCES admins(id),
        CONSTRAINT status_check CHECK (
            status = 'active'
            OR status = 'closed'
        )
    );`);

    await pool.query(`
        INSERT INTO acctypes (name, hellolimit, ibftlimit) VALUES (
            'Basic', 50000, 20000
        );
        INSERT INTO acctypes (name, hellolimit, ibftlimit) VALUES (
            'Premium', 100000, 50000
        );
        INSERT INTO acctypes (name, hellolimit, ibftlimit) VALUES (
            'World', 500000, 100000
        );

        INSERT INTO cardtypes (name, isdebit, poslimit) VALUES (
            'Silver', 1, 10000
        )

        INSERT INTO cardtypes (name, isdebit, poslimit) VALUES (
            'Gold', 1, 50000
        )

        INSERT INTO cardtypes (name, isdebit, poslimit) VALUES (
            'Platinum', 1, 100000
)`);

    logger.info("Tables made.");
  } catch (e) {
    logger.info("Tables already made, data loaded.");
    //    console.log(e);
  }
};
