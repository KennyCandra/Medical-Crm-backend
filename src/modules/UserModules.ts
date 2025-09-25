import { User } from "../entities/user";
import BasicModule from "./BasicModule";
import { FindOptionsSelect, Like, ObjectLiteral } from "typeorm";
import bcrypt from "bcrypt";

export default class UserModules extends BasicModule<User> {

  private static instance: UserModules;
  protected entityClass = User;
  protected entityName = "User";

  public static getInstance() {
    if (!this.instance) {
      this.instance = new UserModules();
    }
    return this.instance;
  }

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
    const newUser = await this.getInstance().getRepository().create({
      NID: NID,
      first_name: firstName,
      gender: gender,
      last_name: lastName,
      role: role,
      password: hashedPw,
      birth_date: new Date(birth_date!) ?? new Date(),
      blood_type: blood_type!,
      email: email
    })

    return newUser;
  }

  static async findUserByNid(nid: string): Promise<User | null> {
    const relations = ["doctorProfile"];
    const where = { NID: nid };
    const order = {};
    const selection = { id: true, NID: true, first_name: true, last_name: true, role: true, password: true, birth_date: true, blood_type: true, email: true };
    const users = await this.getInstance().customFind(relations, where, order, selection);
    if (!users[0]) {
      return null
    }
    return users[0]
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    const relations = ["doctorProfile"];
    const where = { email: email };
    const order = {};
    const selection = { id: true, NID: true, first_name: true, last_name: true, role: true, password: true, birth_date: true, blood_type: true, email: true };
    const users = await this.getInstance().customFind(relations, where, order, selection);
    if (!users[0]) {
      return null
    }
    console.log(users)
    return users[0]
  }

  static async findUserById(id: string): Promise<User | null> {
    const user = await this.getInstance().findWithIdAndRelations(id, ["doctorProfile"])
    if (!user[0]) {
      return null
    }
    return user[0]
  }

  static async searchUsersByNid(nid: string) {
    const relations = ["doctorProfile"];
    const where = { NID: Like(`${nid}%`) };
    const order = {};
    const selection = { id: true, NID: true, first_name: true, last_name: true };
    const users = await this.getInstance().customFind(relations, where, order, selection);
    return users
  }


  static async fetchAllUserDataWithNid(nid: string) {
    const relations = ["patientDiagnoses", "patientAllergies" , "patientAllergies.allergy" , "patientDiagnoses.disease"];
    const where = { NID: nid };
    const order = {};
    const selection: FindOptionsSelect<ObjectLiteral> = {};
    const user = await this.getInstance().customFind(relations, where, order, selection);
    console.log("user", user)
    if (!user[0]) {
      return null
    }
    return user[0]
  }

}
