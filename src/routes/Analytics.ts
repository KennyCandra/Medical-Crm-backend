import express from 'express'
import { AnalyticsController } from '../controllers/AnalyticsController'

const router = express.Router()

router.get('/:id', AnalyticsController.speificCategoryAnalytics)

router.get('/classification/:id' , AnalyticsController.specificClassificationAnalytics)

router.get('/', AnalyticsController.basicAnalytics)

export default router