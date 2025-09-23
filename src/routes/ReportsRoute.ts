import { Router } from 'express'
import ReportsController from '../controllers/ReportsController'
import Auth from '../middleware/middleware'

const router = Router()

router.post('/create', Auth.checkToken,ReportsController.createReport)

// router.get('/patient/:patientId')

// router.get('/patient/:doctorId')


export default router
