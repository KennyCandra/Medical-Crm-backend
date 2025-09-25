import { RouteFactory } from "../utils/RouterFactory";
import AuthController from "../controllers/AuthController";

const router = RouteFactory.createCustomRoutes([
    { method: "get", path: "/doctor/pending", handler: AuthController.fetchPendingDoctors },
    { method: "put", path: "/doctor/pending", handler: AuthController.approveDoctor },
])

export default router