import { RouteFactory } from "../utils/RouterFactory";
import ReportsController from "../controllers/ReportsController";

const router = RouteFactory.createCustomRoutes([
    { method: "get", path: "/all", handler: ReportsController.fetchAll },
    { method: "put", path: "/edit/:reportId", handler: ReportsController.editReport },
    { method: "get", path: "/:reportId", handler: ReportsController.fetchSingleReport },
]);

export default router;
