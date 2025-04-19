import express from 'express'
import  PrescriptionController  from '../controllers/PrescriptionController'

const router = express.Router()

router.post('/create', PrescriptionController.createPrescription)

router.put('/edit', PrescriptionController.editPrescription)

router.get('/:id', PrescriptionController.fetchSinglePrescription)
router.get('/doctor/:doctorId', PrescriptionController.fetchManyPrescriptions)
router.get('/patient/:patientId', PrescriptionController.fetchManyPrescriptions)



export default router