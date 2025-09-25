import { PasswordResetToken } from "../entities/resetPw";
import { User } from "../entities/user";
import crypto from 'crypto'
import BasicModule from "./BasicModule";
import { MoreThan } from "typeorm";

export default class PasswordResetTokenModules extends BasicModule<PasswordResetToken> {

    private static instance: PasswordResetTokenModules;
    protected entityClass = PasswordResetToken;
    protected entityName = "PasswordResetToken";

    public static getInstance() {
        if (!this.instance) {
            this.instance = new PasswordResetTokenModules();
        }
        return this.instance;
    }

    static async createToken(user: User) {
        const token = new PasswordResetToken()
        token.user = user
        token.token = crypto.randomBytes(32).toString('hex')
        token.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)
        token.used = false
        return token
    }


    static async verifyToken(token: string) {
        const relations = ["user"];
        const where = {
            token,
            expiresAt: MoreThan(new Date()),
            used: false
        };
        const order = { expiresAt: "DESC" as "DESC" };
        const selection = { id: true, token: true, expiresAt: true, used: true, user: true };
        const tokentEntity = await this.getInstance().customFind(relations, where, order, selection);
        return tokentEntity
    }
}