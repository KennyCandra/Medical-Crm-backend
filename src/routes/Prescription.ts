import express from 'express'
import PrescriptionController from '../controllers/PrescriptionController'
import Auth from '../middleware/middleware'

const router = express.Router()

router.post('/create', PrescriptionController.createPrescription)

router.put('/edit/:prescriptionId', Auth.checkToken, PrescriptionController.editPrescription)

router.get('/:id', PrescriptionController.fetchSinglePrescription)

router.get('/doctor/:doctorId', PrescriptionController.fetchManyPrescriptions)

router.get('/patient/:patientId', PrescriptionController.fetchManyPrescriptions)

export default router