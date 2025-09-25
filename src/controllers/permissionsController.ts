import { Request, Response } from "express";
import { AppDataSource } from "../../ormconfig";
import PermissionsModule from "../modules/PermissionsModule";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import DoctorProfileModules from "../modules/DoctorModules";
import UserModules from "../modules/UserModules";
import createHttpError from 'http-errors'
import asyncWrapper from "../utils/AsyncWrapper";

export default class PermissionRequestController {
  static makeRequest = asyncWrapper(async (req: Request, res: Response) => {
    const { patientId, permissionLevel } = req.body;
    const userId = req.user.id;
    const [doctor, patient] = await Promise.all([
      DoctorProfileModules.findDoctorById(userId),
      UserModules.findUserByNid(patientId),
    ]);

    if (!patient || !doctor) {
      throw createHttpError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND)
    }
    const newPermissionRequest = await PermissionsModule.createRequest(
      patient.id!,
      doctor[0]?.id!,
      permissionLevel
    );
    await AppDataSource.manager.save(newPermissionRequest);
    res
      .status(StatusCodes.CREATED)
      .json({ message: ReasonPhrases.CREATED, data: newPermissionRequest });
  })

  static respondRequest = asyncWrapper(async (
    req: Request,
    res: Response,
  ) => {
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
    if (permissionRequest[0]?.patient.id !== userId) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: ReasonPhrases.FORBIDDEN });
    }
    permissionRequest[0]!.status = status;
    permissionRequest[0]!.reason = reason;
    permissionRequest[0]!.permissionLevel = permissionLevel;

    await AppDataSource.manager.save(permissionRequest);
    res.status(200).json(permissionRequest[0]);
  })

  static getPatientRequests = asyncWrapper(async (
    req: Request,
    res: Response,
  ) => {
    const patientId = req.user.id;
    const requests = await PermissionsModule.getRequestsByPatientId(patientId);
    res.status(200).json({ message: ReasonPhrases.OK, data: requests });
  })

  static getDoctorRequests = asyncWrapper(async (
    req: Request,
    res: Response,
  ) => {
    const doctorId = req.user.id;
    const doctor = await DoctorProfileModules.findDoctorById(doctorId);

    if (!doctor) {
      throw createHttpError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND)
    }
    const requests = await PermissionsModule.getRequestsByDoctorId(doctor[0]?.id!);
    res.status(200).json({ message: ReasonPhrases.OK, data: requests });
  })
}
