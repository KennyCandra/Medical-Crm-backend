import { User } from "../entities/user";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { AppDataSource } from "../../ormconfig";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export default class UserModules {
  static async createUser(
    fName: string,
    lName: string,
    gender: "male" | "female",
    NID: string,
    role: "patient" | "doctor",
    password: string,
    email: string,
    birth_date?: string,
    blood_type?:
      | "A+"
      | "A-"
      | "B+"
      | "B-"
      | "AB+"
      | "AB-"
      | "O+"
      | "O-"
      | "unknown"
  ) {
    try {
      const hashedPw = await bcrypt.hash(password, 12);
      const newUser = new User();
      newUser.NID = NID;
      newUser.first_name = fName;
      newUser.gender = gender;
      newUser.last_name = lName;
      newUser.role = role;
      newUser.password = hashedPw;
      newUser.birth_date = new Date(birth_date) ?? new Date();
      newUser.blood_type = blood_type;
      newUser.email = email;

      return newUser;
    } catch (err) {
      throw err;
    }
  }

  static async findUserByNid(nid: string) {
    try {
      const user = await AppDataSource.getRepository(User)
        .createQueryBuilder("user")
        .where("user.NID = :nid", { nid })
        .leftJoinAndSelect("user.doctorProfile", "doctor")
        .getOne();
      return user;
    } catch (err) {
      console.log(err);
      throw createHttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async findUserByEmail(email: string) {
    try {
      const user = await AppDataSource.getRepository(User)
        .createQueryBuilder("user")
        .where("user.email = :email", { email })
        .getOne();
      return user;
    } catch (err) {
      console.log(err);
      throw createHttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async findUserById(id: string) {
    try {
      const user = await AppDataSource.getRepository(User)
        .createQueryBuilder("user")
        .where("user.id = :id", { id })
        .leftJoinAndSelect("user.doctorProfile", "doctor")
        .getOne();
      return user;
    } catch (err) {
      console.log(err);
      throw createHttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async searchUsersByNid(nid: string) {
    try {
      const users = await AppDataSource.getRepository(User)
        .createQueryBuilder("user")
        .where("user.NID LIKE :nid", { nid: `${nid}%` })
        .andWhere("user.role != :role", { role: "owner" })
        .select([
          "user.id AS id",
          "user.NID AS NID",
          "user.first_name AS first_name",
          "user.last_name AS last_name",
        ])
        .getRawMany();
      return users;
    } catch (err) {
      throw createHttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
    }
  }
}
