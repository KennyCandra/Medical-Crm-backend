import { Notification } from "../entities/Notification";
import { User } from "../entities/user";
import { AppDataSource } from "../../ormconfig";
import createHttpError from "http-errors";

export default class NotificationModule {
  static async createNotification(
    title: string,
    message: string,
    foreignItemId: string,
    userId: string,
    entity: "diagnosis" | "prescription" | "report",
    action: "create" | "update" | "delete"
  ) {
    const notification = new Notification();
    notification.title = title;
    notification.message = message;
    notification.foreignItemId = foreignItemId;
    notification.isRead = false;
    notification.user = { id: userId } as User;
    notification.entity = entity;
    notification.action = action;
    return notification;
  }

  static async getNotifications(userId: string) {
    const notifications = await AppDataSource.getRepository(Notification)
      .createQueryBuilder("notification")
      .where("notification.user.id = :userId", { userId })
      .leftJoinAndSelect("notification.user", "user")
      .select([
        "notification.id as id",
        "notification.title as title",
        "notification.message as message",
        "notification.isRead as isRead",
        "notification.created_at as created_at",
        "CONCAT(user.first_name, ' ', user.last_name) as name",
      ])
      .orderBy("notification.isRead", "ASC")
      .addOrderBy("notification.created_at", "DESC")
      .getRawMany();
    return notifications;
  }

  static async getUnreadNotifications(userId: string) {
    const notifications = await AppDataSource.getRepository(Notification).find({
      where: {
        foreignItemId: userId,
        isRead: false,
      },
      order: {
        created_at: "DESC",
      },
    });
    return notifications;
  }

  static async markAsRead(userId: string) {
    const notifications = await AppDataSource.getRepository(Notification).find({
      where: { user: { id: userId }, isRead: false },
    });
    notifications.forEach((notification) => {
      notification.isRead = true;
    });
    return notifications;
  }

  static async deleteNotification(notificationId: string) {
    const notification = await AppDataSource.getRepository(
      Notification
    ).findOne({
      where: { id: notificationId },
    });
    if (!notification) {
      throw createHttpError.NotFound("Notification not found");
    }
    await AppDataSource.getRepository(Notification).delete(notificationId);
    return notification;
  }

  static async deleteUserNotifications(userId: string): Promise<void> {
    await AppDataSource.getRepository(Notification)
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where("user.id = :userId", { userId })
      .execute();
  }
}
