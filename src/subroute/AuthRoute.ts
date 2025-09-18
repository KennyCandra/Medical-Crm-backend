import { Router } from "express";
import AuthController from "../controllers/AuthController";

const router = Router()

router.get("/doctor/pending",AuthController.fetchPendingDoctors);

router.put('/doctor/pending', AuthController.approveDoctor)


export default router