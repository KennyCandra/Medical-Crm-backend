import { DoctorProfile } from "../entities/doctorProfile";
import createHttpError from "http-errors";
import { User } from "../entities/user";
import { Specialization } from "../entities/specialization";
import { AppDataSource } from "../../ormconfig";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export default class DoctorProfileModules {

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

  static async findDoctor(id: string) {
    const doctorRepo = await AppDataSource.getRepository(DoctorProfile);
    const doctor = await doctorRepo.findOne({
      where: { id: id },
      relations: ["user"],
    });

    if (!doctor) {
      throw createHttpError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND)
    }
    return doctor;
  }

  static async findDoctorByid(id: string) {
    const doctorUser = await AppDataSource.getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.doctorProfile", "doctorProfile")
      .where(`user.id = :id`, { id })
      .getOne();

    if (!doctorUser) {
      throw createHttpError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND)
    }

    return doctorUser.doctorProfile;
  }

  static async fetchPendingDoctors() {
    const doctors = await AppDataSource.getRepository(DoctorProfile)
      .createQueryBuilder("doctor")
      .where("doctor.status = :status", { status: "pending" })
      .leftJoinAndSelect("doctor.user", "user")
      .leftJoinAndSelect("doctor.specialization", "specialization")
      .select([
        "doctor.id AS id",
        "doctor.medical_license_number AS medical_license_number",
        "CONCAT(user.first_name, ' ', user.last_name) AS name",
        "specialization.name AS specialization",
        "user.NID AS NID",
        "doctor.status AS status",
      ])
      .getRawMany();
    return doctors;
  }

  static async approveDoctor(doctors: DoctorProfile[]) {
    const approvedDoctors: DoctorProfile[] = [];
    for (const doctor of doctors) {
      await AppDataSource.getRepository(
        DoctorProfile
      ).update(doctor.id, { status: doctor.status, reason: doctor.reason });
      approvedDoctors.push(doctor);
    }
    return approvedDoctors;
  }

}
