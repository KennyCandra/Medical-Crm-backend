import express from 'express'
import { AnalyticsController } from '../controllers/AnalyticsController'
import Auth from '../middleware/middleware'

const router = express.Router()

router.get('/diseases/:diseaseId', Auth.checkToken ,AnalyticsController.specificDiseaseAnalytics)

router.get('/disease', AnalyticsController.diseaseAnalytics)

router.get('/classification/:id' , AnalyticsController.specificClassificationAnalytics)

router.get('/:id', AnalyticsController.speificCategoryAnalytics)

router.get('/', AnalyticsController.basicAnalytics)

export default router