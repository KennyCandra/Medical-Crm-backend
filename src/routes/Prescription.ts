import express from 'express'
import PrescriptionController from '../controllers/PrescriptionController'
import Auth from '../middleware/middleware'
// import { PrescriptionSchema } from '../Schemas/PrescriptionSchema'
// import ValidateSchema from '../Schemas/SchemaValidation'

const router = express.Router()

router.post('/create', Auth.checkToken, Auth.checkRoles(['doctor']),  PrescriptionController.createPrescription)

router.put('/edit/:prescriptionId', Auth.checkToken, Auth.checkRoles(['doctor']), PrescriptionController.editPrescription)

router.get('/:id', Auth.checkToken, PrescriptionController.fetchSinglePrescription)

router.get('/doctor/:doctorId', Auth.checkToken, Auth.checkRoles(['doctor']), PrescriptionController.fetchManyPrescriptions)

router.get('/patient/:patientId', Auth.checkToken, PrescriptionController.fetchManyPrescriptions)

export default router