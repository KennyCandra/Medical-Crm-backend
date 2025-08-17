import { Response, Request, NextFunction } from "express";
import { AppDataSource } from "../../ormconfig";
import { User } from "../entities/user";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import UserModules from "../modules/UserModules";
import DoctorProfileModules from "../modules/DoctorModules";
import { SpecializationModules } from "../modules/SpecializationModules";
import { verifyToken } from "../helpers/verifyToken";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { createToken } from "../helpers/createToken";
import PasswordResetTokenModules from "../modules/PasswordResetTokenModules";
import PrescriptionModule from "../modules/PrescriptionModule";
import PallergyModule from "../modules/PallergyModule";
import DiagnosisModule from "../modules/DiagnosisModule";
import RefreshTokenModule from "../modules/RefreshTokenModule";
import { RefreshToken } from "../entities/refreshToken";
import { handlePostgresError } from "../utils/postgresErrorHandler";
import { runInTransaction } from "../utils/TransactionalHelper";
import { userWithoutImportantData } from "../helpers/UserWithoutImportantData";
import { CreateAuthenticationToken } from "../helpers/AuthTokens";
import { Prescription } from "../entities/prescription";

class AuthController {
  static async SignUp(req: Request, res: Response, next: NextFunction) {
    await runInTransaction(async (manager) => {
      try {
        const {
          firstName,
          lastName,
          gender,
          nid,
          password,
          role,
          birth_date,
          blood_type,
          email,
        } = req.body;

        let newUser = await UserModules.createUser(
          firstName,
          lastName,
          gender,
          nid,
          role,
          password,
          email,
          birth_date,
          blood_type
        );

        await manager.save(newUser);

        if (role === "doctor") {
          const specializationEntity = await SpecializationModules.isValid(
            req.body.speciality
          );
          if (!specializationEntity.isValidSpecialization) {
            throw createHttpError(StatusCodes.BAD_REQUEST, {
              field: "speciality",
              message: "Invalid specialization",
            });
          }
          const doctor = await DoctorProfileModules.createDoctor({
            user: newUser,
            license: req.body.license,
            specialization: specializationEntity.specializationId,
          });

          await manager.save(doctor);
        }

        newUser = userWithoutImportantData(newUser);

        res
          .status(StatusCodes.CREATED)
          .json({ message: ReasonPhrases.CREATED, newUser });
      } catch (err: any) {
        if (err.detail && typeof err.detail === "string") {
          handlePostgresError(err, res);
          return;
        } else {
          next(err);
        }
      }
    });
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { nid, password } = req.body;
      let user = await UserModules.findUserByNid(nid);

      if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({
          message: ReasonPhrases.NOT_FOUND,
          error: [
            {
              field: "NID",
              message: "user not found",
            },
          ],
        });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: ReasonPhrases.BAD_REQUEST,
          error: [
            {
              field: "password",
              message: "Invalid password",
            },
          ],
        });
        return;
      }

      const { accessToken, refreshToken } = CreateAuthenticationToken(user);

      const refreshTokenSnippet = refreshToken.split(".")[2];
      const refreshTokenEntity = await RefreshTokenModule.createRefreshToken(
        user,
        refreshTokenSnippet
      );
      await AppDataSource.manager.save(refreshTokenEntity);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 60 * 1000,
      });
      user = userWithoutImportantData(user);
      res
        .status(StatusCodes.OK)
        .json({ message: ReasonPhrases.OK, accessToken, user });
    } catch (err) {
      next(err);
    }
  }

  static async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    await runInTransaction(async (manager) => {
      try {
        const refreshToken = req.cookies["refreshToken"];
        if (!refreshToken) {
          res.status(StatusCodes.UNAUTHORIZED).json({
            message: "the refreshToken is not found",
          });
          return;
        }

        const token = await verifyToken(refreshToken);

        if (token.expired) {
          res.status(StatusCodes.UNAUTHORIZED).json({
            message: "the refreshToken is expired",
          });
          return;
        }
        const refreshTokenSignature = refreshToken.split(".")[2];
        const refreshTokenEntity = await RefreshTokenModule.findRefreshToken(
          refreshTokenSignature
        );
        if (!refreshTokenEntity) {
          res.status(StatusCodes.UNAUTHORIZED).json({
            message: "the refreshToken is not found",
          });
          return;
        }
        if (refreshTokenEntity.expiresAt < new Date()) {
          res.status(StatusCodes.UNAUTHORIZED).json({
            message: "the refreshToken is expired",
          });
          return;
        }

        let user = refreshTokenEntity.user;
        user = userWithoutImportantData(user);

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          CreateAuthenticationToken(user);

        const newRefreshTokenSignature = newRefreshToken.split(".")[2];
        const newRefreshTokenEntity =
          await RefreshTokenModule.createRefreshToken(
            user,
            newRefreshTokenSignature
          );
        await manager.delete(RefreshToken, {
          tokenSignature: refreshTokenSignature,
        });
        await manager.save(newRefreshTokenEntity);

        res.cookie("refreshToken", newRefreshToken, {
          secure: true,
          sameSite: "none",
          httpOnly: true,
          path: "/",
          maxAge: 60 * 60 * 24 * 60 * 1000,
        });
        res.status(StatusCodes.OK).json({
          message: ReasonPhrases.OK,
          accessToken: newAccessToken,
          user,
        });
      } catch (err) {
        console.log(err);
        next(err);
      }
    });
  }

  static async forgetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;
      const user = await UserModules.findUserByEmail(email);

      if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({
          message: ReasonPhrases.NOT_FOUND,
          error: [
            {
              field: "email",
              message: "user not found",
            },
          ],
        });
        return;
      }
      const token = await PasswordResetTokenModules.createToken(user);
      await AppDataSource.manager.save(token);

      res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token, password } = req.body;
      const tokenEntity = await PasswordResetTokenModules.verifyToken(token);
      if (!tokenEntity) {
        throw createHttpError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
      }

      const user = tokenEntity.user;
      const hashedPw = await bcrypt.hash(password, 12);
      user.password = hashedPw;
      await AppDataSource.manager.save(user);
      await AppDataSource.manager.remove(tokenEntity);
      res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
    } catch (err) {
      next(err);
    }
  }

  static async logOut(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const refreshToken = req.cookies["refreshToken"];
      const refreshTokenSignature = refreshToken.split(".")[2];
      await AppDataSource.manager.delete(RefreshToken, {
        tokenSignature: refreshTokenSignature,
      });
      res.clearCookie("refreshToken", {
        secure: true,
        sameSite: "none",
        httpOnly: true,
        path: "/",
        maxAge: 0,
      });

      res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async searchPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { nid } = req.params;
      const users = await UserModules.searchUsersByNid(nid);

      const modifiedUsers = users.map(
        (user: {
          id: string;
          first_name: string;
          last_name: string;
          nid: string;
        }) => ({
          id: user.id,
          fullName: user.first_name + " " + user.last_name,
          nid: user.nid,
        })
      );

      res
        .status(StatusCodes.OK)
        .json({ message: ReasonPhrases.OK, users: modifiedUsers });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async fetchAllPatientData(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { nid } = req.params;
      let user = await UserModules.fetchAllUserDataWithNid(nid);
      const {prescriptions , numbers} = await PrescriptionModule.fetchLimitedPrescriptions(user.id);

      user = userWithoutImportantData(user);

      console.log(prescriptions);

      let modifiedPrescriptions = prescriptions.map((presc => {
        return {
          id: presc.id,
          status: presc.status,
          doctor: presc.doctor.user.first_name + " " + presc.doctor.user.last_name,
          date: presc.start_date,
        }
      }))

      const modifiedPrescriptionsToResponse = {
        prescriptions: modifiedPrescriptions,
        notDone: numbers.notDone,
        done: numbers.done,
        total: numbers.total,
      };
      const diagnoses = user.patientDiagnoses.map((diagnosis) => ({
        id: diagnosis.id,
        name: diagnosis.disease.name,
      }));

      const filterDiseasesToOneDisease = diagnoses.filter(
        (diagnosis, index, self) =>
          index === self.findIndex((t) => t.name === diagnosis.name)
      );

      const allergies = user.patientAllergies.map((allergy) => ({
        id: allergy.id,
        name: allergy.allergy.name,
      }));

      const filterAllergiesToOneAllergy = allergies.filter(
        (allergy, index, self) =>
          index === self.findIndex((t) => t.name === allergy.name)
      );

      res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        data: {
          user,
          prescriptions: modifiedPrescriptionsToResponse,
          diagnoses: filterDiseasesToOneDisease,
          allergies: filterAllergiesToOneAllergy,
        },
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async fetchPendingDoctors(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const doctors = await DoctorProfileModules.fetchPendingDoctors();
      res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, doctors });
    } catch (err) {
      next(err);
    }
  }

  static async approveDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const { doctors } = req.body;
      const approvedDoctors = await DoctorProfileModules.approveDoctor(doctors);
      res
        .status(StatusCodes.OK)
        .json({ message: ReasonPhrases.OK, approvedDoctors });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
