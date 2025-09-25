import { Notification } from "../entities/Notification";
import { User } from "../entities/user";
import BasicModule from "./BasicModule";
import { FindOptionsSelect, ObjectLiteral } from "typeorm";

export default class NotificationModule extends BasicModule<Notification> {
  private static instance: NotificationModule;
  protected entityClass = Notification;
  protected entityName = "Notification";

  public static getInstance() {
    if (!this.instance) {
      this.instance = new NotificationModule();
    }
    return this.instance;
  }

  static async createNotification(
    title: string,
    message: string,
    foreignItemId: string | null,
    userId: string,
    entity: "diagnosis" | "prescription" | "report",
    action: "create" | "update" | "delete"
  ) {
    const notification = new Notification();
    notification.title = title;
    notification.message = message;
    notification.foreignItemId = foreignItemId ?? '';
    notification.isRead = false;
    notification.user = { id: userId } as User;
    notification.entity = entity;
    notification.action = action;
    return notification;
  }

  static async getNotifications(userId: string) {
    const order = {
      isRead: "ASC",
      created_at: "DESC",
    }
    const where = {
      user: { id: userId },
    }

    const relations = ["user"]
    const selection = { id: true, title: true, message: true, isRead: true, created_at: true, name: true, entity: true, foreignItemId: true };

    const notifications = await this.getInstance().customFind(relations, where, order, selection);
    return notifications;
  }

  static async getUnreadNotifications(userId: string) {

    const order = {
      created_at: "DESC",
    }
    const where = {
      user: { id: userId },
      isRead: false,
    }
    const relations = ["user"]
    const selection: FindOptionsSelect<ObjectLiteral> = {};


    const notifications = this.getInstance().customFind(relations, where, order, selection);
    return notifications;
  }

  static async markAsRead(userId: string) {
    const where = { user: { id: userId }, isRead: false };
    const relations = ["user"];
    const order = {};
    const selection: FindOptionsSelect<ObjectLiteral> = {};
    const notifications = await this.getInstance().customFind(relations, where, order, selection);

    notifications.forEach((notification) => {
      notification.isRead = true;
    });
    return notifications;
  }

  static async deleteNotification(notificationId: string) {
   await this.getInstance().deleteById(notificationId);
  }

  static async deleteUserNotifications(userId: string): Promise<void> {
    await this.getInstance().deleteWithWhere({ user: { id: userId } });
  }
}
