import { Router } from "express";
import { DiagnosisController } from "../controllers/DiagnosisController";
import Auth from "../middleware/middleware";

const router = Router();

router.post(
  "/create",
  Auth.checkToken,
  Auth.checkRoles(["doctor", "admin"]),
  DiagnosisController.createDiagonsis
);

router.get("/:nid", Auth.checkToken, Auth.checkRoles(["doctor", "admin"]), DiagnosisController.fetchForPatient);

router.delete(
  "/remove/:id",
  Auth.checkToken,
  Auth.checkRoles(["doctor", "admin"]),
  DiagnosisController.removeDiagnosis
);

export default router;
