import { User } from "../entities/user";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { AppDataSource } from "../../ormconfig";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export default class UserModules {
  static async createUser(
    firstName: string,
    lastName: string,
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

    const hashedPw = await bcrypt.hash(password, 12);
    const newUser = new User();
    newUser.NID = NID;
    newUser.first_name = firstName;
    newUser.gender = gender;
    newUser.last_name = lastName;
    newUser.role = role;
    newUser.password = hashedPw;
    newUser.birth_date = new Date(birth_date!) ?? new Date();
    newUser.blood_type = blood_type!;
    newUser.email = email;

    return newUser;
  }

  static async findUserByNid(nid: string) {
    const user = await AppDataSource.getRepository(User)
      .createQueryBuilder("user")
      .where("user.NID = :nid", { nid })
      .leftJoinAndSelect("user.doctorProfile", "doctor")
      .getOne();
    return user
  }

  static async findUserByEmail(email: string) {

    const user = await AppDataSource.getRepository(User)
      .createQueryBuilder("user")
      .where("user.email = :email", { email })
      .getOne();
    return user;
  }

  static async findUserById(id: string) {

    const user = await AppDataSource.getRepository(User)
      .createQueryBuilder("user")
      .where("user.id = :id", { id })
      .leftJoinAndSelect("user.doctorProfile", "doctor")
      .getOne();

    if (!user || !user.doctorProfile) {
      throw createHttpError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND)
    }

    return user;
  }

  static async searchUsersByNid(nid: string) {
    const users = await AppDataSource.getRepository(User)
      .createQueryBuilder("user")
      .where("user.NID LIKE :nid", { nid: `${nid}%` })
      .andWhere("user.role != :role", { role: "admin" })
      .select([
        "user.id AS id",
        "user.NID AS NID",
        "user.first_name AS first_name",
        "user.last_name AS last_name",
      ])
      .getRawMany();
    return users;
  }


  static async fetchAllUserDataWithNid(nid: string) {

    const user = await AppDataSource.getRepository(User)
      .createQueryBuilder("user")
      .where("user.NID = :nid", { nid })
      .leftJoinAndSelect("user.patientDiagnoses", "diagnoses")
      .leftJoinAndSelect("diagnoses.disease", "disease")
      .leftJoinAndSelect("user.patientAllergies", "allergies")
      .leftJoinAndSelect("allergies.allergy", "allergy")
      .getOne();

    return user;
  }
}
