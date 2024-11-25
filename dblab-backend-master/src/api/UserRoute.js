const router = require("express").Router();

const UserController = require("../controllers/UserController");
const Middleware = require("../cors/Middleware");

module.exports = () => {
  router.use(Middleware.UserAuth);
  router.get("/info", UserController.GetInfo);
  router.post("/update-email", UserController.UpdateEmail);
  router.post("/update-password", UserController.UpdatePassword);
  router.get("/cards", UserController.GetCards);

  return router;
};
