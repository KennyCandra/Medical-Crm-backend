import { Router } from "express";
import DiseaseController from "../controllers/DiseaseController";
import Auth from "../middleware/middleware";

const router = Router();

router.get(
  "/:value",
  Auth.checkToken,
  Auth.checkRoles(["doctor", "admin"]),
  DiseaseController.fetchSpecificDisease
);

router.get(
  "/",
  Auth.checkToken,
  Auth.checkRoles(["doctor", "admin"]),
  DiseaseController.fetchDisease
);

export default router;
