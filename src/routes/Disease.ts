import { Router } from "express";
import DiseaseController from "../controllers/DiseaseController";

const router = Router()

router.get('/:value', DiseaseController.fetchSpecificDisease)

router.get('/', DiseaseController.fetchDisease)


export default router