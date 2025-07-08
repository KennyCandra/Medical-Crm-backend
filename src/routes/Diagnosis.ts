import { Router } from "express";
import { DiagnosisController } from "../controllers/DiagnosisController";
import Auth from "../middleware/middleware";

const router = Router() 


router.post('/create', DiagnosisController.createDiagonsis)

router.get('/:nid', DiagnosisController.fetchForPatient)

router.delete('/remove/:id', Auth.checkToken, DiagnosisController.removeDiagnosis)



export default router