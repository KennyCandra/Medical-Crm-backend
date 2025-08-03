import { Request, Response, NextFunction } from "express";
import DiagnosisModule from "../modules/DiagnosisModule";
import { AppDataSource } from "../../ormconfig";
import UserModules from "../modules/UserModules";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import createHttpError from "http-errors";
export class DiagnosisController {
  static async createDiagonsis(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { patientId, doctorId, diseaseId, severity , notes } = req.body;
      const previousDiagnosis = await DiagnosisModule.findForPatient(patientId);
      const diseaseIds = previousDiagnosis.map((diagnosis) => diagnosis.disease.id);
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
      await AppDataSource.manager.save(diagnoses);

      res
        .status(StatusCodes.CREATED)
        .json({ diagnoses, message: ReasonPhrases.CREATED });
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
      const diagnosis = await DiagnosisModule.findForPatient(patient);
      console.log(diagnosis)

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
      await DiagnosisModule.removeDiagnosis(id);
      res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
}
