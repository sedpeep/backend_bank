const router = require("express").Router();

const AdminController = require("../controllers/AdminController");
const Middleware = require("../cors/Middleware");

module.exports = () => {
  router.use(Middleware.AdminAuth);
  router.get("/users", AdminController.GetAccountList);
  router.post("/change-account-plan", AdminController.ChangeAccountPlan);
  router.get("/tickets", AdminController.GetTickets);
  router.post("/resolve-ticket", AdminController.ResolveTicket);
  router.get("/user-cards", AdminController.GetUserCards);
  router.post("/issue-card", AdminController.IssueCard);
  router.post("/block-card", AdminController.BlockCard);
  router.post("/close-account", AdminController.CloseUserAccount);
  router.post("/add-money", AdminController.AddMoney);

  return router;
};
