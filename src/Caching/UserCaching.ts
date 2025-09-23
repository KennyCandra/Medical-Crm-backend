import { CustomUser } from "../types/CustomUser";

type chachedUser = {
    data: CustomUser,
    expirationTime: Date
}

export default class UserCaching {
    private static users = new Map<string, chachedUser>();
    private static expirationTime = 1000 * 60 * 60 * 24;

    static async getUser(userId: string) {
        const user = this.users.get(userId);
        if (!user) {
            return null;
        }
        if (user.expirationTime < new Date()) {
            this.deleteUser(userId);
            return null;
        }
        return user.data;
    }

    static async setUser(userId: string, user: CustomUser) {
        this.users.set(userId, { data: user, expirationTime: new Date(Date.now() + this.expirationTime) });
    }

    static async deleteUser(userId: string) {
        this.users.delete(userId);
    }

    static async clearAllUsers() {
        this.users.clear();
    }
}