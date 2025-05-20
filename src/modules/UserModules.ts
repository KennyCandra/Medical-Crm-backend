import { User } from "../entities/user"
import bcrypt from 'bcrypt'
import createHttpError from 'http-errors'
import { AppDataSource } from "../../ormconfig"

export default class UserModules {

    static async createUser(
        fName: string,
        lName: string,
        gender: "male" | "female",
        NID: string,
        password: string,
        email: string,
        birth_date?: string,
        blood_type?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "unknown",
    ) {

        try {
            const hashedPw = await bcrypt.hash(password, 12)
            const newUser = new User()
            newUser.NID = NID
            newUser.first_name = fName
            newUser.gender = gender
            newUser.last_name = lName
            newUser.role = 'patient'
            newUser.password = hashedPw
            newUser.birth_date = new Date(birth_date) ?? new Date()
            newUser.blood_type = blood_type
            newUser.email = email

            return newUser
        } catch (err) {
            console.log(err)
            if (err.code === '23505') {
                throw createHttpError.BadRequest('NID already exists');
            } else {
                throw createHttpError.InternalServerError('server error');
            }
        }
    }

    static async findUserByNid(nid: string) {
        try {
            const user = await AppDataSource.getRepository(User).createQueryBuilder('user')
                .where('user.NID = :nid', { nid })
                .getOne()
            return user
        } catch (err) {
            console.log(err)
            throw createHttpError(500, 'internal server error')
        }
    }

    static async findUserByEmail(email: string) {
        try {
            const user = await AppDataSource.getRepository(User).createQueryBuilder('user')
                .where('user.email = :email', { email })
                .getOne()
            return user
        } catch (err) {
            console.log(err)
            throw createHttpError(500, 'internal server error')
        }
    }

}