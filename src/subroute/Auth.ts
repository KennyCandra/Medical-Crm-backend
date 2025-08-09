import { Router } from "express";
import AuthController from "../controllers/Auth";

const router = Router()

router.get(
    "/doctor/pending",
    AuthController.fetchPendingDoctors
  );
  
  router.put('/doctor/pending', AuthController.approveDoctor)


export default router