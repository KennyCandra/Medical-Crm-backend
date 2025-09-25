import { Request, Response } from "express";
import NotificationModule from "../modules/NotificationModule";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { AppDataSource } from "../../ormconfig";
import createHttpError from 'http-errors'
import asyncWrapper from "../utils/AsyncWrapper";

export default class NotificationController {
  static getNotifications = asyncWrapper(async (
    req: Request,
    res: Response,
  ) => {
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
  })

  static markAsRead = asyncWrapper(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const notifications = await NotificationModule.markAsRead(userId);
    await AppDataSource.manager.save(notifications);
    res
      .status(StatusCodes.OK)
      .json({ message: ReasonPhrases.OK, data: notifications });
  })

  static deleteNotification = asyncWrapper(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      throw createHttpError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)
    }
    const notification =
      await NotificationModule.deleteNotification(id);
    res
      .status(StatusCodes.OK)
      .json({ message: ReasonPhrases.OK, data: notification });
  })

  static deleteAllNotifications = asyncWrapper(async (
    req: Request,
    res: Response,
  ) => {
    const userId = req.user.id;
    await NotificationModule.deleteUserNotifications(userId);
    res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
  })
}
