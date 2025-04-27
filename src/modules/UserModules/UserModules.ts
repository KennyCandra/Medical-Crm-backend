import { User } from "../../entities/user";
import bcrypt from 'bcrypt'
import createHttpError from 'http-errors'

export default class UserModules {

    static async createUser(
        fName: string,
        lName: string,
        gender: "male" | "female",
        NID: string,
        password: string,
        role: "doctor" | "patient" | "owner") {

        try {
            const hashedPw = await bcrypt.hash(password, 12)
            const newUser = new User()
            newUser.NID = NID
            newUser.first_name = fName
            newUser.gender = gender
            newUser.last_name = lName
            newUser.role = role
            newUser.password = hashedPw
            newUser.birth_date = new Date()


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

}