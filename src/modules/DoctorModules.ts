import { DoctorProfile } from "../entities/doctorProfile";
import { User } from "../entities/user";
import { Specialization } from "../entities/specialization";
import BasicModule from "./BasicModule";
import { FindOptionsSelect, ObjectLiteral } from "typeorm";

export default class DoctorProfileModules extends BasicModule<DoctorProfile> {
  private static instance: DoctorProfileModules;
  protected entityClass = DoctorProfile;
  protected entityName = "DoctorProfile";

  public static getInstance() {
    if (!this.instance) {
      this.instance = new DoctorProfileModules();
    }
    return this.instance;
  }

  static async createDoctor({
    user,
    specialization,
    license,
  }: {
    user: User;
    specialization: Specialization;
    license: string;
  }) {
    const newDoctor = new DoctorProfile();
    newDoctor.user = user;
    newDoctor.specialization = specialization;
    newDoctor.medical_license_number = license;
    newDoctor.status = "pending";
    return newDoctor;
  }

  static async findDoctorById(id: string) {
    return await this.getInstance().findWithIdAndRelations(id, ["user", "specialization"]);
  }

  static async fetchPendingDoctors() {
    const relations = ["user", "specialization"];
    const where = { status: "pending" };
    const order = {};
    const selection: FindOptionsSelect<ObjectLiteral> = {};
    return await this.getInstance().customFind(relations, where, order, selection);
  }

  static async approveDoctor(id: string) {
    return await this.getInstance().update(id, { status: "approved", reason: "" } as DoctorProfile);
  }

  static async rejectDoctor(id: string, reason: string) {
    return await this.getInstance().update(id, { status: "rejected", reason: reason } as DoctorProfile);
  }
}
