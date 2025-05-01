import { Router } from "express";
import { DiagnosisController } from "../controllers/DiagnosisController";

const router = Router()


router.post('/create', DiagnosisController.createDiagonsis)

router.get('/:patientId', DiagnosisController.fetchForPatient)



export default router