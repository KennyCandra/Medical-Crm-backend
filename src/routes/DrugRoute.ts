import express from "express";
const router = express.Router();
import DrugController from "../controllers/DrugsController";
import Auth from "../middleware/middleware";

router.post(
  "/interaction",
  Auth.checkToken,
  Auth.checkRoles(["doctor", "admin"]),
  DrugController.getInteractions
);

router.get(
  "/search/:value",
  Auth.checkToken,
  Auth.checkRoles(["doctor", "admin"]),
  DrugController.searchDrug
);

export default router;
