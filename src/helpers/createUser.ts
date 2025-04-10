import { User } from "../entities/user";
import bcrypt from 'bcrypt'

export default async function createUser(fName: string, lName: string, gender: "male" | "female", NID: string, password: string, role: "doctor" | "patient" | "owner") {
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
}