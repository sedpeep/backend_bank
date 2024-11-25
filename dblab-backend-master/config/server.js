const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");
const Logger = require("../src/utils/Logger");

const ErrorManager = require("../errors/error-manager");

const CreateTables = require("../src/services/CreateTables");
const CreateProcedures = require("../src/services/CreateProcedures");
const logger = new Logger();

const { port } = require("../config");
const app = express();
const moment = require("moment");
const momenttz = require("moment-timezone");
const CreateViews = require("../src/services/CreateViews");

moment.tz.setDefault("Asia/Karachi");

app.listen(port, "0.0.0.0", () => {
  logger.info(`Working with port ${port}`);
});

CreateTables().then(() => {
  CreateProcedures();
  CreateViews();
});
app.use(cors());

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use(bodyParser.json({ limit: "10mb" }));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return ErrorManager.getError(res, "INVALID_ARGUMENTS");
  } else {
    next(err);
  }
});

const AuthRoute = require("../src/api/AuthRoute")();
app.use("/auth/", AuthRoute);

const UserRoute = require("../src/api/UserRoute")();
app.use("/user/", UserRoute);

const BeneficiaryRoute = require("../src/api/BeneficiaryRoute")();
app.use("/beneficiary/", BeneficiaryRoute);

const TransactionRoute = require("../src/api/TransactionRoute")();
app.use("/transaction/", TransactionRoute);

const TicketRoute = require("../src/api/TicketRoute")();
app.use("/tickets/", TicketRoute);

const AdminRoute = require("../src/api/AdminRoute")();
app.use("/admin/", AdminRoute);

// 404 error
app.get("*", async (req, res) => {
  return ErrorManager.getError(res, "PAGE_NOT_FOUND");
});

app.post("*", async (req, res) => {
  return ErrorManager.getError(res, "PAGE_NOT_FOUND");
});
