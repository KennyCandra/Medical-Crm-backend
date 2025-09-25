import { Request, Response } from "express";
import { AppDataSource } from "../../ormconfig";
import DoctorProfileModules from "../modules/DoctorModules";
import prescriptionModule from "../modules/PrescriptionModule";
import { PrescribedDrug } from "../entities/prescribedDrug";
import prescribedDrugModule from "../modules/prescribedDrugModules";
import createhttperror from "http-errors";
import { Prescription } from "../entities/prescription";
import UserModules from "../modules/UserModules";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import SocketManager from "../../socket";
import { runInTransaction } from "../utils/TransactionalHelper";
import NotificationModule from "../modules/NotificationModule";
import { User } from "../entities/user";
import PermissionsModule from "../modules/PermissionsModule";
import createHttpError from "http-errors";
import asyncWrapper from "../utils/AsyncWrapper";
import { DoctorProfile } from "../entities/doctorProfile";
import { Notification } from "../entities/Notification";
export default class PrescriptionController {
  static createPrescription = asyncWrapper(async (
    req: Request,
    res: Response,
  ) => {
    const { doctorId, patientId, medication, description } = req.body;
    const userId = req.user.id;
    const newPrescrition = await runInTransaction(async (manager) => {
      let prescribedDrugs: PrescribedDrug[] = [];

      if (!medication || medication.length === 0) {
        res.status(400).json({ message: "please enter some drugs" });
        return;
      }

      const [patient, doctor] = await Promise.all([
        await UserModules.findUserByNid(patientId),
        await DoctorProfileModules.findDoctorById(doctorId),
      ]);

      if (!patient || !doctor) {
        throw createHttpError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)
      }

      if (
        !patient.openAccess &&
        req.user.role !== "admin" &&
        patient.id !== userId
      ) {
        const hasPermission =
          await PermissionsModule.checkPermissionValidation(
            patient.id,
            doctor[0]?.id!,
            2
          );
        if (!hasPermission) {
          throw createHttpError.Forbidden(
            "You do not have permission to create a prescription"
          );
        }
      }

      for (const med of medication) {
        const prescribedDrug = await prescribedDrugModule.createPrescribedDrug(
          med.id,
          med.dose,
          med.frequency,
          med.time
        );
        prescribedDrugs.push(prescribedDrug as PrescribedDrug);
      }
      await manager.save(prescribedDrugs);

      const newPrescrition = await prescriptionModule.createPrescription({
        doctor: doctor[0] as DoctorProfile,
        patient: patient.id,
        prescribedDrug: prescribedDrugs,
        description: description,
      });

      if (!newPrescrition) {
        throw createHttpError(StatusCodes.INTERNAL_SERVER_ERROR, ReasonPhrases.INTERNAL_SERVER_ERROR)
      }
      await manager.save(newPrescrition);
      const newNotification = await NotificationModule.createNotification(
        "New Prescription",
        `New Prescription added for ${patient.first_name} ${patient.last_name} by Dr: ${doctor[0]?.user.first_name} ${doctor[0]?.user.last_name} Contains ${prescribedDrugs.length} Drugs`,
        newPrescrition.id,
        patient.id,
        "prescription",
        "create"
      );
      await manager.save(newNotification);
      SocketManager.emitToUser(patient.id, "notification", newNotification as Notification);
      return newPrescrition;
    });
    res.status(StatusCodes.CREATED).json({
      message: ReasonPhrases.CREATED,
      newPrescrition,
    });
  })

  static editPrescription = asyncWrapper(async (
    req: Request,
    res: Response,
  ) => {
    const { prescriptionId } = req.params;
    const { id } = req.user;
    const [prescription, patient] = await Promise.all([
      await prescriptionModule.findPrescription(prescriptionId!, ["patient"]),
      await UserModules.findUserById(id),
    ]);

    if (!prescription) {
      throw createhttperror(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }
    if (!patient) {
      throw createhttperror(
        StatusCodes.BAD_REQUEST,
        ReasonPhrases.BAD_REQUEST
      );
    }

    if (patient.id !== prescription.patient.id) {
      throw createhttperror(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    prescription.status = "done";
    await AppDataSource.manager.save(prescription);

    res
      .status(StatusCodes.OK)
      .json({ message: ReasonPhrases.OK, prescription });
  })

  static fetchSinglePrescription = asyncWrapper(async (
    req: Request,
    res: Response,
  ) => {
    const { id } = req.params;
    const prescription = await prescriptionModule.findPrescription(id!, [
      "patient",
      "doctor",
      "doctor.user",
      "prescribedDrugs",
      "prescribedDrugs.drug",
    ]);

    if (!prescription) {
      throw createhttperror(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    const newPrescription = {
      patientId: prescription.patient.id,
      doctorName: `${prescription.doctor.user.first_name} ${prescription.doctor.user.last_name}`,
      patientName: `${prescription.patient.first_name} ${prescription.patient.last_name}`,
      startDate: prescription.start_date,
      status: prescription.status,
      prescribedDrugs: prescription.prescribedDrugs.map((drug) => ({
        id: drug.id,
        name: drug.drug.name,
        dosage: drug.dosage,
        frequency: drug.frequency,
        time: drug.time,
      })),
      description: prescription.description,
    };

    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: { prescription: newPrescription },
    });
  })

  static fetchManyPrescriptions = asyncWrapper(async (
    req: Request,
    res: Response,
  ) => {
    const { patientNid, doctorId } = req.params;
    let user: User | null = null;

    if (patientNid) {
      user = await UserModules.findUserByNid(patientNid);
    }

    let prescriptions: Prescription[] = [];

    if (user?.id !== req.user.id && req.user.role !== "doctor") {
      throw createhttperror(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    doctorId
      ? (prescriptions = await prescriptionModule.findManyPrescriptions(
        doctorId,
        null
      ))
      : (prescriptions = await prescriptionModule.findManyPrescriptions(
        null,
        user!.id
      ));

    if (!prescriptions) {
      throw createhttperror.NotFound("can't find this");
    }
    const completedPresc = prescriptions.filter(
      (presc) => presc.status === "done"
    ).length;
    const notCompletedPresc = prescriptions.filter(
      (presc) => presc.status === "taking"
    ).length;
    const data = {
      prescriptions,
      completed: completedPresc,
      notCompleted: notCompletedPresc,
      userName: user
        ? user.first_name + " " + user.last_name
        : "Unknown User",
    };

    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data,
    });
  })
}
