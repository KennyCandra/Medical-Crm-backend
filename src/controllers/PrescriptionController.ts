import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../../ormconfig";
import DoctorProfileModules from "../modules/DoctorModules";
import prescriptionModule from "../modules/PrescriptionModule";
import { PrescribedDrug } from "../entities/prescribedDrug";
import prescribedDrugModule from "../modules/prescribedDrugModules";
import DrugsModule from "../modules/DrugsModule";
import { Drug } from "../entities/drug";
import createhttperror from "http-errors";
import { Prescription } from "../entities/prescription";
import UserModules from "../modules/UserModules";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {
  DatabaseError,
  handlePostgresError,
} from "../utils/postgresErrorHandler";
export default class PrescriptionController {
  static async createPrescription(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { doctorId, patientId, medication, description } = req.body;
    const queryRunner = await AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let prescribedDrugs: PrescribedDrug[] = [];

      if (!medication || medication.length === 0) {
        res.status(400).json({ message: "please enter some drugs" });
        return;
      }
      for (const med of medication) {
        const prescribedDrug = await prescribedDrugModule.createPrescribedDrug(
          med.id,
          med.dose,
          med.frequency,
          med.time
        );
        prescribedDrugs.push(prescribedDrug);
      }
      await queryRunner.manager.save(prescribedDrugs);
      const patient = await UserModules.findUserByNid(patientId);
      const newPrescrition = await prescriptionModule.createPrescription({
        doctor: doctorId,
        patient: patient.id,
        prescribedDrug: prescribedDrugs,
        description: description,
      });

      await queryRunner.manager.save(newPrescrition);
      await queryRunner.commitTransaction();
      res.status(StatusCodes.CREATED).json({
        message: ReasonPhrases.CREATED,
        newPrescrition,
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (handlePostgresError(err as DatabaseError, res)) {
        return;
      }
      next(err);
    } finally {
      await queryRunner.release();
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
      const prescription = await prescriptionModule.findPrescription(
        prescriptionId,
        ["patient"]
      );
      if (!prescription) {
        throw createhttperror(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
      }

      const patient = await UserModules.findUserById(userId);
      if (!patient) {
        throw createhttperror(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
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

      await AppDataSource.manager.save(prescription);

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
      const { doctorId, patientId } = req.params;
      let prescriptions: Prescription[];

      {
        doctorId
          ? (prescriptions = await prescriptionModule.findManyPrescriptions(
              doctorId,
              null
            ))
          : (prescriptions = await prescriptionModule.findManyPrescriptions(
              null,
              patientId
            ));
      }
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
