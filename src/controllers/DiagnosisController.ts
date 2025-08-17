import { Request, Response, NextFunction } from "express";
import DiagnosisModule from "../modules/DiagnosisModule";
import UserModules from "../modules/UserModules";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import createHttpError from "http-errors";
import SocketManager from "../../socket";
import NotificationModule from "../modules/NotificationModule";
import DoctorModules from "../modules/DoctorModules";
import { runInTransaction } from "../utils/TransactionalHelper";

export class DiagnosisController {
  static async createDiagonsis(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { patientId, doctorId, diseaseId, severity, notes } = req.body;
      const result = await runInTransaction(async (manager) => {
        const [previousDiagnosis, patient, doctor] = await Promise.all([
          DiagnosisModule.findForPatient(patientId as string),
          UserModules.findUserById(patientId as string),
          DoctorModules.findDoctor(doctorId as string),
        ]);
        const diseaseIds = previousDiagnosis.map(
          (diagnosis) => diagnosis.disease.id
        );
        if (diseaseIds.includes(diseaseId)) {
          throw createHttpError.BadRequest("disease already exists");
        }
        const diagnoses = await DiagnosisModule.diagnosesCreation(
          patientId,
          doctorId,
          diseaseId,
          severity,
          notes
        );
        await manager.save(diagnoses);
        const newNotification = await NotificationModule.createNotification(
          "New Diagnosis",
          `New diagnosis added for ${patient.first_name} ${patient.last_name} by Dr: ${doctor.user.first_name} ${doctor.user.last_name}`,
          diagnoses.id,
          patientId,
          "diagnosis",
          "create"
        );
        await manager.save(newNotification);
        SocketManager.emitToUser(patientId, "notification", newNotification);
        return diagnoses;
      });

      res
        .status(StatusCodes.CREATED)
        .json({ diagnoses: result, message: ReasonPhrases.CREATED });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async fetchForPatient(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { nid } = req.params;
      if (nid.length !== 14) {
        res.status(404).json({ message: 'can"t find this' });
        return;
      }

      const patient = await UserModules.findUserByNid(nid);
      const diagnosis = await DiagnosisModule.findForPatient(patient.id);
      SocketManager.emitToUser(patient.id, "diagnosis", diagnosis);

      res.status(StatusCodes.OK).json({ diagnosis, message: ReasonPhrases.OK });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }

  static async removeDiagnosis(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const result = await runInTransaction(async (manager) => {
        const data = await DiagnosisModule.removeDiagnosis(id);
        const newNotification = await NotificationModule.createNotification(
          "Removed Diagnosis",
          `New diagnosis removed from you`,
          null,
          data.patientId,
          "diagnosis",
          "delete"
        );
        await manager.save(newNotification);
        SocketManager.emitToUser(
          data.patientId,
          "notification",
          newNotification
        );
        return data;
      });
      res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, result });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
}
