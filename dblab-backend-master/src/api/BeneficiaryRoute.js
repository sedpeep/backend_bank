const router = require("express").Router();

const BeneficiaryController = require("../controllers/BeneficiaryController");
const Middleware = require("../cors/Middleware");

module.exports = () => {
  router.use(Middleware.UserAuth);
  router.get("/list", BeneficiaryController.GetList);
  router.post("/add", BeneficiaryController.Add);
  router.post("/edit", BeneficiaryController.Modify);
  router.post("/delete", BeneficiaryController.Delete);

  return router;
};
