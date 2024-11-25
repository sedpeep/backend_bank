const router = require("express").Router();

const TransactionController = require("../controllers/TransactionController");
const Middleware = require("../cors/Middleware");

module.exports = () => {
  router.use(Middleware.UserAuth);
  router.post("/transfer", TransactionController.TransferMoney);
  router.get("/statement", TransactionController.GetStatement);

  return router;
};
