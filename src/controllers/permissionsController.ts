import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../../ormconfig";
import PermissionsModule from "../modules/PermissionsModule";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import DoctorProfileModules from "../modules/DoctorModules";
import UserModules from "../modules/UserModules";
import createHttpError from 'http-errors'

export default class PermissionRequestController {
  static async makeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, permissionLevel } = req.body;
      const userId = req.user.id;
      const [doctor, patient] = await Promise.all([
        DoctorProfileModules.findDoctorByid(userId),
        UserModules.findUserByNid(patientId),
      ]);

      if (!patient || !doctor) {
        throw createHttpError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND)
      }
      const newPermissionRequest = await PermissionsModule.createRequest(
        patient.id,
        doctor.id,
        permissionLevel
      );
      await AppDataSource.manager.save(newPermissionRequest);
      res
        .status(StatusCodes.CREATED)
        .json({ message: ReasonPhrases.CREATED, data: newPermissionRequest });
    } catch (err) {
      next(err);
    }
  }

  static async respondRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status, reason, permissionLevel } = req.body;
      const userId = req.user.id;

      if (!id) {
        throw createHttpError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)
      }
      const permissionRequest = await PermissionsModule.getRequestById(id);

      if (!permissionRequest) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: ReasonPhrases.NOT_FOUND });
      }
      if (permissionRequest.patient.id !== userId) {
        res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: ReasonPhrases.FORBIDDEN });
      }
      permissionRequest.status = status;
      permissionRequest.reason = reason;
      permissionRequest.permissionLevel = permissionLevel;

      await AppDataSource.manager.save(permissionRequest);
      res.status(200).json(permissionRequest);
    } catch (err) {
      next(err);
    }
  }

  static async getPatientRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const patientId = req.user.id;
      const requests = await PermissionsModule.getRequestsByPatientId(patientId);
      res.status(200).json({ message: ReasonPhrases.OK, data: requests });
    } catch (err) {
      next(err);
    }
  }

  static async getDoctorRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const doctorId = req.user.id;
      const doctor = await DoctorProfileModules.findDoctorByid(doctorId);

      if (!doctor) {
        throw createHttpError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND)
      }
      const requests = await PermissionsModule.getRequestsByDoctorId(doctor.id);
      res.status(200).json({ message: ReasonPhrases.OK, data: requests });
    } catch (err) {
      next(err);
    }
  }
}
