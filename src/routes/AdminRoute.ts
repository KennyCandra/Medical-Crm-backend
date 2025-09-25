
import AnalyticsRoutes from "../subroute/AnalyticsRoute";
import AuthRoute from "../subroute/AuthRoute";
import Report from "../subroute/ReportRoute";
import Auth from "../middleware/middleware";
import { RouteFactory } from "../utils/RouterFactory";

const router = RouteFactory.createCustomRoutes([
  { method: "use", path: "/analytics", handler: AnalyticsRoutes, middleware: [Auth.checkRoles(["admin", "researcher"])] },
  { method: "use", path: "/auth", handler: AuthRoute, middleware: [Auth.checkRoles(["admin"])] },
  { method: "use", path: "/reports", handler: Report, middleware: [Auth.checkRoles(["admin"])] },
]);

export default router;
