import NotificationController from "../controllers/NotificationController";
import Auth from "../middleware/middleware";
import { RouteFactory } from "../utils/RouterFactory";

const router = RouteFactory.createCustomRoutes([
    { method: "get", path: "/", handler: NotificationController.getNotifications, middleware: [Auth.checkToken] },
    { method: "put", path: "/read", handler: NotificationController.markAsRead, middleware: [Auth.checkToken] },
    { method: "delete", path: "/delete/:id", handler: NotificationController.deleteNotification, middleware: [Auth.checkToken] },
    { method: "delete", path: "/delete-all", handler: NotificationController.deleteAllNotifications, middleware: [Auth.checkToken] },
]);

export default router;