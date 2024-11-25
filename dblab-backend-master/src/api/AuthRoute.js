const router = require("express").Router();

const AuthController = require("../controllers/AuthController");
const Middleware = require("../cors/Middleware");

module.exports = () => {
  router.use(Middleware.NoAuthenticate);
  router.post("/login", AuthController.Login);
  router.post("/register", AuthController.Register);
  router.post("/admin-login", AuthController.AdminLogin);
  router.post("/admin-register", AuthController.AdminRegister);
  router.post("/buy-product", AuthController.BuyProduct);

  return router;
};
