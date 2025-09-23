import { Router } from "express";
import PermissionRequestController from "../controllers/permissionsController";
import Auth from "../middleware/middleware";

const router = Router();

router.post("/make-request", Auth.checkToken, PermissionRequestController.makeRequest);

router.post("/respond-request/:id", Auth.checkToken, PermissionRequestController.respondRequest);

router.get("/requests/patient", Auth.checkToken, PermissionRequestController.getPatientRequests);

router.get('/requests/doctor', Auth.checkToken, PermissionRequestController.getDoctorRequests);

export default router;
