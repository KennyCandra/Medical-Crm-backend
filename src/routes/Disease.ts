import { Router } from "express";
import DiseaseController from "../controllers/DiseaseController";
import Auth from "../middleware/middleware";

const router = Router()

router.get('/:value', Auth.checkToken, Auth.checkRoles(['doctor' , 'owner']), DiseaseController.fetchSpecificDisease)

router.get('/', Auth.checkToken, Auth.checkRoles(['doctor']), DiseaseController.fetchDisease)


export default router