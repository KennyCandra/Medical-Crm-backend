import express from 'express'
import { PrescriptionController } from '../controllers/PrescriptionController'

const router = express.Router()

router.post('/create', PrescriptionController.createPrescription)



export default router