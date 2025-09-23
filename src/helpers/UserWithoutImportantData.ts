import { User } from "../entities/user";

export type UpdatedUser = Omit<User, 'password' | 'created_at' | 'updated_at'>;

export const userWithoutImportantData = (user: User): UpdatedUser => {
    const { password, created_at, updated_at, ...newUser } = user;
    return newUser;
}