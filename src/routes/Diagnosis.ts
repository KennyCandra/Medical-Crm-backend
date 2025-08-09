import { Router } from "express";
import { DiagnosisController } from "../controllers/DiagnosisController";
import Auth from "../middleware/middleware";

const router = Router() 


router.post('/create', Auth.checkToken, Auth.checkRoles(['doctor']), DiagnosisController.createDiagonsis)

router.get('/:nid', Auth.checkToken, DiagnosisController.fetchForPatient)

router.delete('/remove/:id', Auth.checkToken, Auth.checkRoles(['doctor']), DiagnosisController.removeDiagnosis)



export default router