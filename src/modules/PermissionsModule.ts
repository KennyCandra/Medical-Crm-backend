import { DoctorProfile } from "../entities/doctorProfile";
import Permission from "../entities/Permissions";
import { User } from "../entities/user";
import BasicModule from "./BasicModule";

export default class PermissionsModule extends BasicModule<Permission> {
  private static instance: PermissionsModule;
  protected entityClass = Permission;
  protected entityName = "Permission";

  public static getInstance() {
    if (!this.instance) {
      this.instance = new PermissionsModule();
    }
    return this.instance;
  }
  static async createNewPermissionsLevel(
    levelName: number,
    doctor: string,
    user: string
  ): Promise<Permission> {
    const newPermission = new Permission();
    newPermission.permissionLevel = levelName;
    newPermission.doctor = { id: doctor } as DoctorProfile;
    newPermission.patient = { id: user } as User;
    return newPermission;
  }

  static async checkPermissionValidation(
    userId: string,
    doctorId: string,
    permissionLevel: number
  ) {
    const relations = ["doctor", "patient"];
    const where = {
      patient: { id: userId },
      doctor: { id: doctorId }
    };
    const order = {};
    const selection = { id: true, permissionLevel: true, doctor: true, patient: true };
    const userPermission = await this.getInstance().customFind(relations, where, order, selection);
    if (!userPermission[0]) {
      return false;
    }
    return userPermission[0].permissionLevel >= permissionLevel;
  }

  static async createRequest(
    userId: string,
    doctorId: string,
    permissionLevel: number
  ) {
    const newRequest = new Permission();
    newRequest.patient = { id: userId } as User;
    newRequest.doctor = { id: doctorId } as DoctorProfile;
    newRequest.permissionLevel = permissionLevel;
    return newRequest;
  }

  static async getRequestById(id: string) {
    const relations = ["doctor", "patient"];
    const where = { id };
    const order = {};
    const selection = { id: true, permissionLevel: true, doctor: true, patient: true };
    const request = await this.getInstance().customFind(relations, where, order, selection);
    return request;
  }

  static async getRequestsByPatientId(patientId: string) {
    const relations = ["doctor", "patient"];
    const where = { patient: { id: patientId } };
    const order = {};
    const selection = { id: true, permissionLevel: true, doctor: true, patient: true };
    const requests = await this.getInstance().customFind(relations, where, order, selection);
    return requests;
  }

  static async getRequestsByDoctorId(doctorId: string) {
    const relations = ["doctor", "patient"];
    const where = { doctor: { id: doctorId } };
    const order = {};
    const selection = { id: true, permissionLevel: true, doctor: true, patient: true };
    const requests = await this.getInstance().customFind(relations, where, order, selection);
    return requests;
  }
}
