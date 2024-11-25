const router = require("express").Router();

const TicketController = require("../controllers/TicketController");
const Middleware = require("../cors/Middleware");

module.exports = () => {
  router.use(Middleware.UserAuth);
  router.get("/list", TicketController.GetList);
  router.post("/create", TicketController.CreateTicket);

  return router;
};
