import PermissionRequestController from "../controllers/permissionsController";
import Auth from "../middleware/middleware";
import { RouteFactory } from "../utils/RouterFactory";

const router = RouteFactory.createCustomRoutes([
    { method: "post", path: "/make-request", handler: PermissionRequestController.makeRequest, middleware: [Auth.checkToken] },
    { method: "post", path: "/respond-request/:id", handler: PermissionRequestController.respondRequest, middleware: [Auth.checkToken] },
    { method: "get", path: "/requests/patient", handler: PermissionRequestController.getPatientRequests, middleware: [Auth.checkToken] },
    { method: "get", path: "/requests/doctor", handler: PermissionRequestController.getDoctorRequests, middleware: [Auth.checkToken] },
]);

export default router;
