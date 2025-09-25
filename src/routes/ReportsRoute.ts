import ReportService from '../Services/ReportService'
import Auth from '../middleware/middleware'
import { RouteFactory } from '../utils/RouterFactory'

const router = RouteFactory.createCustomRoutes([
    { method: "post", path: "/create", handler: ReportService.createReport, middleware: [Auth.checkToken] },
    // { method: "get", path: "/patient/:patientId", handler: ReportService.fetchReportsForPatient, middleware: [Auth.checkToken] },
    // { method: "get", path: "/reporter/:reporterId", handler: ReportService.fetchReportsForReporter, middleware: [Auth.checkToken] },
])



export default router
