import { Router } from "express";
import NotificationController from "../controllers/NotificationController";
import Auth from "../middleware/middleware";

const router = Router();

router.get("/", Auth.checkToken ,NotificationController.getNotifications);

router.put('/read', Auth.checkToken ,NotificationController.markAsRead);

router.delete('/delete/:id', Auth.checkToken ,NotificationController.deleteNotification);

router.delete('/delete-all', Auth.checkToken ,NotificationController.deleteAllNotifications);



export default router;