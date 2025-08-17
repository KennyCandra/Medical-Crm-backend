import { User } from "../entities/user";

export const userWithoutImportantData = (user: User) => {
    user.password = undefined;
    user.created_at = undefined;
    user.updated_at = undefined;
    return user;
}