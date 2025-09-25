import { RouteFactory } from '../utils/RouterFactory'
import { AnalyticsController } from '../controllers/AnalyticsController'

const router = RouteFactory.createCustomRoutes([
    { method: "get", path: "/diseases/:diseaseId", handler: AnalyticsController.specificDiseaseAnalytics },
    { method: "get", path: "/classification/:id", handler: AnalyticsController.specificClassificationAnalytics },
    { method: "get", path: "/:id", handler: AnalyticsController.speificCategoryAnalytics },
    { method: "get", path: "/", handler: AnalyticsController.basicAnalytics },
])

export default router