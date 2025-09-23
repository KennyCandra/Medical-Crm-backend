import express from 'express'
import { AnalyticsController } from '../controllers/AnalyticsController'

const router = express.Router()

router.get('/diseases/:diseaseId', AnalyticsController.specificDiseaseAnalytics)

router.get('/classification/:id' , AnalyticsController.specificClassificationAnalytics)

router.get('/:id', AnalyticsController.speificCategoryAnalytics)

router.get('/', AnalyticsController.basicAnalytics)

export default router