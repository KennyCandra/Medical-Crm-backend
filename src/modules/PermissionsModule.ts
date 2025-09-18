import { AppDataSource } from "../../ormconfig";
import { DoctorProfile } from "../entities/doctorProfile";
import Permission from "../entities/Permissions";
import { User } from "../entities/user";

export default class PermissionsModule {
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
    const userPermission = await AppDataSource.getRepository(Permission)
      .createQueryBuilder("permissions")
      .where("permissions.patientId = :userId", { userId })
      .andWhere("permissions.doctorId = :doctorId", { doctorId })
      .getOne();

    if (!userPermission) {
      return false;
    }

    if (userPermission.permissionLevel < permissionLevel) {
      return false;
    }

    return true;
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
    const request = await AppDataSource.getRepository(
      Permission
    ).findOne({ where: { id }, relations: ["doctor", "patient"] });
    if (!request) {
      throw new Error("Request not found");
    }
    return request;
  }

  static async getRequestsByPatientId(patientId: string) {
    const requests = await AppDataSource.getRepository(Permission)
      .createQueryBuilder("request")
      .leftJoinAndSelect("request.doctor", "doctor")
      .leftJoinAndSelect("request.patient", "patient")
      .where("patient.id = :patientId", { patientId })
      .getMany();
    return requests;
  }

  static async getRequestsByDoctorId(doctorId: string) {
    const requests = await AppDataSource.getRepository(Permission)
      .createQueryBuilder("request")
      .leftJoinAndSelect("request.doctor", "doctor")
      .leftJoinAndSelect("request.patient", "patient")
      .where("doctor.id = :doctorId", { doctorId })
      .getMany();
    return requests;
  }
}
