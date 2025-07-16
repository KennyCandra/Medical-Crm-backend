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
import { Resend } from "resend";
import path from "path";
import fs from "fs";
import RefreshTokenModule from "../modules/RefreshTokenModule";
import { RefreshToken } from "../entities/refreshToken";

const resend = new Resend(process.env.RESEND_API);

resend.domains.create({
  name: "medical-crm-backend-production-8b4b.up.railway.app",
  customReturnPath: "send",
});

class AuthController {
  static async SignUp(req: Request, res: Response, next: NextFunction) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

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

      const newUser = await UserModules.createUser(
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

      await queryRunner.manager.save(newUser);

      if (role === "doctor") {
        const specializationEntity = await SpecializationModules.isValid(
          req.body.speciality
        );
        const doctor = await DoctorProfileModules.createDoctor({
          user: newUser,
          license: req.body.license,
          specialization: specializationEntity.specializationId,
        });

        await queryRunner.manager.save(doctor);
      }

      const userId = newUser.id;
      const userRole = newUser.role;
      const accessToken = createToken({ userId, role: userRole }, "15m");
      const refreshToken = createToken({ userId }, "60d");

      newUser.password = undefined;
      newUser.created_at = undefined;
      newUser.updated_at = undefined;
      newUser.id = undefined;

      res.cookie("refreshToken", refreshToken, {
        secure: true,
        sameSite: "none",
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 60 * 1000,
      });
      let message = fs.readFileSync(
        path.join(__dirname, "../StaticFiles/message.html"),
        "utf8"
      );
      const logo = fs.readFileSync(
        path.join(__dirname, "../images/logo.png"),
        "base64"
      );
      message = message
        .replace("${email}", email)
        .replace("${nid}", nid)
        .replace("${logo}", logo);

      await queryRunner.commitTransaction();
      try {
        const { data, error } = await resend.emails.send({
          from: "Acme <onboarding@resend.dev>",
          to: email,
          subject: "Welcome to our platform!",
          html: message,
        });
        console.error(
          "Error occurred while sending the email:",
          error?.message || error
        );
        console.log(data);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      res
        .status(StatusCodes.CREATED)
        .json({ message: ReasonPhrases.CREATED, newUser, accessToken });
    } catch (err: any) {
      await queryRunner.rollbackTransaction();

      if (err.detail && typeof err.detail === "string") {
        const error: { field: string; message: string }[] = [];
        console.log(err.detail);
        if (err.detail.includes("email")) {
          error.push({
            field: "email",
            message: "Email already exists",
          });
        }
        if (err.detail.includes("NID")) {
          error.push({
            field: "nid",
            message: "Nid already exists",
          });
        }
        if (err.detail.includes("medical_license_number")) {
          error.push({
            field: "license",
            message: "License already exists",
          });
        }
        res.status(StatusCodes.CONFLICT).json({
          message: ReasonPhrases.CONFLICT,
          error: error,
        });
        return;
      }

      console.error("Signup error:", err);
      next(err);
    } finally {
      await queryRunner.release();
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { nid, password } = req.body;
      const user = await UserModules.findUserByNid(nid);

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

      const accessToken = createToken(
        { userId: user.id, role: user.role },
        "15m"
      );

      const refreshToken = createToken({ userId: user.id }, "60d");
      const refreshTokenSignature = refreshToken.split(".")[2];
      const refreshTokenEntity = await RefreshTokenModule.createRefreshToken(
        user,
        refreshTokenSignature
      );
      await AppDataSource.manager.save(refreshTokenEntity);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 60 * 1000,
      });
      user.password = undefined;
      user.created_at = undefined;
      user.updated_at = undefined;

      res
        .status(StatusCodes.OK)
        .json({ message: ReasonPhrases.OK, accessToken, user });
    } catch (err) {
      next(err);
    }
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
      const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${token.token}`;
      const logo = fs.readFileSync(
        path.join(__dirname, "../images/logo.png"),
        "base64"
      );
      let message = fs
        .readFileSync(
          path.join(__dirname, "../StaticFiles/reset-password.html"),
          "utf8"
        )
        .replace("${email}", user.email)
        .replace("${logo}", logo)
        .replace("${resetPasswordLink}", resetPasswordLink);
      const { data, error } = await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: user.email,
        subject: "Reset Password",
        html: message,
      });
      console.log(error);
      console.log(data);
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
      console.log(token, password);
      const tokenEntity = await PasswordResetTokenModules.verifyToken(token);
      if (!tokenEntity) {
        throw createHttpError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
      }

      const user = tokenEntity.user;
      const hashedPw = await bcrypt.hash(password, 10);
      user.password = hashedPw;
      await AppDataSource.manager.save(user);
      await AppDataSource.manager.remove(tokenEntity);
      res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
    } catch (err) {
      next(err);
    }
  }

  static async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const refreshToken = req.cookies["refreshToken"];
      if (!refreshToken) {
        throw createHttpError(
          StatusCodes.UNAUTHORIZED,
          ReasonPhrases.UNAUTHORIZED
        );
      }

      const token = await verifyToken(refreshToken);
      if (token.expired) {
        throw createHttpError(
          StatusCodes.UNAUTHORIZED,
          ReasonPhrases.UNAUTHORIZED
        );
      }
      const refreshTokenSignature = refreshToken.split(".")[2];
      const refreshTokenEntity = await RefreshTokenModule.findRefreshToken(
        refreshTokenSignature
      );
      if (!refreshTokenEntity) {
        throw createHttpError(
          StatusCodes.UNAUTHORIZED,
          ReasonPhrases.UNAUTHORIZED
        );
      }
      if (refreshTokenEntity.expiresAt < new Date()) {
        throw createHttpError(
          StatusCodes.UNAUTHORIZED,
          ReasonPhrases.UNAUTHORIZED
        );
      }

      const user = refreshTokenEntity.user;

      const accessToken = createToken(
        {
          userId: user.id,
          name: user.first_name + " " + user.last_name,
          role: user.role,
        },
        "15m"
      );

      const newRefreshToken = createToken({ userId: user.id }, "60d");
      const newRefreshTokenSignature = newRefreshToken.split(".")[2];
      const newRefreshTokenEntity = await RefreshTokenModule.createRefreshToken(
        user,
        newRefreshTokenSignature
      );
      await queryRunner.manager.save(newRefreshTokenEntity);
      await queryRunner.manager.delete(RefreshToken, {
        tokenSignature: refreshTokenSignature,
      });
      await queryRunner.commitTransaction();

      res.cookie("refreshToken", newRefreshToken, {
        secure: true,
        sameSite: "none",
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 60 * 1000,
      });

      user.password = undefined;
      user.created_at = undefined;
      user.updated_at = undefined;

      res
        .status(StatusCodes.OK)
        .json({ message: ReasonPhrases.OK, accessToken, user });
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      next(err);
    } finally {
      await queryRunner.release();
    }
  }

  static async logOut(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
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

      const modifiedUsers = users.map((user) => ({
        id: user.id,
        fullName: user.first_name + " " + user.last_name,
        nid: user.NID,
      }));

      res
        .status(StatusCodes.OK)
        .json({ message: ReasonPhrases.OK, users: modifiedUsers });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async fetchUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AppDataSource.getRepository(User)
        .createQueryBuilder("user")
        .where("user.id = :id", { id: req.body.userId })
        .getOne();

      res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, user });
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
      const { role } = req.body;
      if (role === "patient") {
        res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: ReasonPhrases.FORBIDDEN });
        return;
      }
      const { nid } = req.params;
      const user = await UserModules.findUserByNid(nid);
      const prescriptions = await PrescriptionModule.findManyPrescriptions(
        null,
        user.id
      );
      const allergies = await PallergyModule.findForPatient(user.id);
      const diagnosis = await DiagnosisModule.findForPatient(user);
      const diagnoses = diagnosis.map((diag) => {
        return diag.disease.name;
      });
      user.password = undefined;
      res
        .status(StatusCodes.OK)
        .json({ prescriptions, allergies, diagnoses, user });
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
