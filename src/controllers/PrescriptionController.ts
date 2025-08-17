import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../../ormconfig";
import DoctorProfileModules from "../modules/DoctorModules";
import prescriptionModule from "../modules/PrescriptionModule";
import { PrescribedDrug } from "../entities/prescribedDrug";
import prescribedDrugModule from "../modules/prescribedDrugModules";
import createhttperror from "http-errors";
import { Prescription } from "../entities/prescription";
import UserModules from "../modules/UserModules";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {
  DatabaseError,
  handlePostgresError,
} from "../utils/postgresErrorHandler";
import SocketManager from "../../socket";
import { runInTransaction } from "../utils/TransactionalHelper";
import NotificationModule from "../modules/NotificationModule";
export default class PrescriptionController {
  static async createPrescription(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { doctorId, patientId, medication, description } = req.body;
    try {
      const { newPrescrition } = await runInTransaction(async (manager) => {
        let prescribedDrugs: PrescribedDrug[] = [];

        if (!medication || medication.length === 0) {
          res.status(400).json({ message: "please enter some drugs" });
          return;
        }
        for (const med of medication) {
          const prescribedDrug =
            await prescribedDrugModule.createPrescribedDrug(
              med.id,
              med.dose,
              med.frequency,
              med.time
            );
          prescribedDrugs.push(prescribedDrug);
        }
        await manager.save(prescribedDrugs);
        const [patient, doctor] = await Promise.all([
          await UserModules.findUserByNid(patientId),
          await DoctorProfileModules.findDoctor(doctorId),
        ]);
        const newPrescrition = await prescriptionModule.createPrescription({
          doctor: doctor,
          patient: patient.id,
          prescribedDrug: prescribedDrugs,
          description: description,
        });

        await manager.save(newPrescrition);
        const newNotification = await NotificationModule.createNotification(
          "New Prescription",
          `New Prescription added for ${patient.first_name} ${patient.last_name} by Dr: ${doctor.user.first_name} ${doctor.user.last_name} Contains ${prescribedDrugs.length} Drugs`,
          newPrescrition.id,
          patient.id,
          "prescription",
          "create"
        );
        await manager.save(newNotification);
        SocketManager.emitToUser(patient.id, "notification", newNotification);
        return { newPrescrition };
      });
      res.status(StatusCodes.CREATED).json({
        message: ReasonPhrases.CREATED,
        newPrescrition,
      });
    } catch (err) {
      console.log(err);
      if (handlePostgresError(err as DatabaseError, res)) {
        return;
      }
      next(err);
    }
  }

  static async editPrescription(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { prescriptionId } = req.params;
      const { userId } = req.body;
      const [prescription, patient] = await Promise.all([
        await prescriptionModule.findPrescription(prescriptionId, ["patient"]),
        await UserModules.findUserById(userId),
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
    } catch (err) {
      next(err);
    }
  }

  static async fetchSinglePrescription(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const prescription = await prescriptionModule.findPrescription(id, [
        "patient",
        "doctor",
        "doctor.user",
        "prescribedDrugs",
        "prescribedDrugs.drug",
      ]);
      if (!prescription) {
        throw createhttperror(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
      }

      res
        .status(StatusCodes.OK)
        .json({ message: ReasonPhrases.OK, prescription });
    } catch (err) {
      next(err);
    }
  }

  static async fetchManyPrescriptions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { patientNid } = req.params;
      const user = await UserModules.findUserByNid(patientNid);

      const prescriptions = await prescriptionModule.findManyPrescriptions(null,user.id);

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
        userName : user.first_name + " " + user.last_name,
      };

      res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}
