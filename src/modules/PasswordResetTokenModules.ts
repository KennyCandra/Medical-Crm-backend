import { AppDataSource } from "../../ormconfig";
import { PasswordResetToken } from "../entities/resetPw";
import { User } from "../entities/user";
import crypto from 'crypto'
import createHttpError from 'http-errors'

export default class PasswordResetTokenModules {
    static async createToken(user: User) {
        try {
            const token = new PasswordResetToken()
            token.user = user
            token.token = crypto.randomBytes(32).toString('hex')
            token.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)
            token.used = false
            return token
        } catch (err) {
            console.log(err)
            throw createHttpError(500, 'internal server error')
        }
    }


    static async verifyToken(token: string) {
        try {
            const tokentEntity = await AppDataSource.getRepository(PasswordResetToken).createQueryBuilder('passwordResetToken')
                .where('passwordResetToken.token = :token', { token })
                .leftJoinAndSelect('passwordResetToken.user', 'user')
                .getOne()
            return tokentEntity
        }
        catch (err) {
            console.log(err)
            throw createHttpError(500, 'internal server error')
        }
    }
}