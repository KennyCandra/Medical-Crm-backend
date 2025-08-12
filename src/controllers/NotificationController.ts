import { Request, Response, NextFunction } from "express";
import NotificationModule from "../modules/NotificationModule";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { AppDataSource } from "../../ormconfig";

export default class NotificationController {
  static async getNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.body.userId;
      const notifications = await NotificationModule.getNotifications(userId);
      const notReadNotificationsLength = notifications.filter(
        (notification) => notification.isRead === false
      ).length;
      res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        data: notifications,
        notificationsLength: notReadNotificationsLength,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.body.userId;
      const notifications = await NotificationModule.markAsRead(userId);
      await AppDataSource.manager.save(notifications);
      res
        .status(StatusCodes.OK)
        .json({ message: ReasonPhrases.OK, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const notificationId = req.params.id;
      const notification =
        await NotificationModule.deleteNotification(notificationId);
      res
        .status(StatusCodes.OK)
        .json({ message: ReasonPhrases.OK, data: notification });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAllNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.body.userId;
      await NotificationModule.deleteUserNotifications(userId);
      res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
    } catch (error) {
      next(error);
    }
  }
}
