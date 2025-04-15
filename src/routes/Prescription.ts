import express from 'express'
import { PrescriptionController } from '../controllers/PrescriptionController'

const router = express.Router()

router.post('/create', PrescriptionController.createPrescription)

router.put('/edit', PrescriptionController.editPrescription)



export default router