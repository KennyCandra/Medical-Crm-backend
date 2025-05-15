import { Router } from 'express'
import ReportsController from '../controllers/ReportsController'

const router = Router()

router.post('/create', ReportsController.createReport)

// router.get('/all', ReportsController.fetchAll)

router.put('/edit/:reportId', ReportsController.editReport)

router.get('/patient/:patientId')

router.get('/patient/:doctorId')

// router.get('/:reportId', ReportsController.fetchSingleReport)

export default router
