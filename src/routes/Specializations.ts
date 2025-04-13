import express from "express";
import specialization from "../controllers/specializationController";

const router = express.Router()

router.get('/', specialization.fetchAll)



export default router