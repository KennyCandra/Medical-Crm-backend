import { Router } from "express";
import { DiagnosisController } from "../controllers/DiagnosisController";

const router = Router() 


router.post('/create', DiagnosisController.createDiagonsis)

router.get('/:nid', DiagnosisController.fetchForPatient)



export default router