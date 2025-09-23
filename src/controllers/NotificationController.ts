import { Request, Response, NextFunction } from "express";
import NotificationModule from "../modules/NotificationModule";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { AppDataSource } from "../../ormconfig";
import createHttpError from 'http-errors'

export default class NotificationController {
  static async getNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const { id } = req.params;
      if (!id) {
        throw createHttpError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)
      }
      const notification =
        await NotificationModule.deleteNotification(id);
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
      const userId = req.user.id;
      await NotificationModule.deleteUserNotifications(userId);
      res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
    } catch (error) {
      next(error);
    }
  }
}
