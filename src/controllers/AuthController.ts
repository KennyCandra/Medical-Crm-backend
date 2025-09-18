import { Response, Request, NextFunction, CookieOptions } from "express";
import { AppDataSource } from "../../ormconfig";
import DoctorProfileModules from "../modules/DoctorModules";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { RefreshToken } from "../entities/refreshToken";
import { cookiesConfig, removedCookiesConfig } from "../config/cookiesConfig";
import AuthService from "../Services/AuthService";

class AuthController {
  static async SignUp(req: Request, res: Response, next: NextFunction) {
    try {
      const newUser = await AuthService.signUp(req.body)
      res
        .status(StatusCodes.CREATED)
        .json({ message: ReasonPhrases.CREATED, newUser });
    } catch (err: unknown) {
      next(err)
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken, accessToken, userWithNoData } = await AuthService.Login(req.body)
      res.cookie("refreshToken", refreshToken, cookiesConfig as CookieOptions);
      res
        .status(StatusCodes.OK)
        .json({ message: ReasonPhrases.OK, accessToken, user: userWithNoData });
    } catch (err) {
      next(err);
    }
  }

  static async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const refreshTokenFromCookie = req.cookies["refreshToken"];
      const result = await AuthService.refreshToken(refreshTokenFromCookie);

      res.cookie("refreshToken", result.refreshToken, cookiesConfig as CookieOptions);
      res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        accessToken: result.accessToken,
        user: result.returnedUser,
      });
    } catch (err) {
      next(err);
    }
  }

  // static async forgetPassword(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     const { email } = req.body;
  //     const user = await UserModules.findUserByEmail(email);

  //     if (!user) {
  //       res.status(StatusCodes.NOT_FOUND).json({
  //         message: ReasonPhrases.NOT_FOUND,
  //         error: [
  //           {
  //             field: "email",
  //             message: "user not found",
  //           },
  //         ],
  //       });
  //       return;
  //     }
  //     const token = await PasswordResetTokenModules.createToken(user);
  //     await AppDataSource.manager.save(token);

  //     res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  // static async resetPassword(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     const { token, password } = req.body;
  //     const tokenEntity = await PasswordResetTokenModules.verifyToken(token);
  //     if (!tokenEntity) {
  //       throw createHttpError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
  //     }

  //     const user = tokenEntity.user;
  //     const hashedPw = await bcrypt.hash(password, 12);
  //     user.password = hashedPw;
  //     await AppDataSource.manager.save(user);
  //     await AppDataSource.manager.remove(tokenEntity);
  //     res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
  //   } catch (err) {
  //     next(err);
  //   }
  // }

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
      res.clearCookie("refreshToken", removedCookiesConfig as CookieOptions);

      res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async searchPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await AuthService.SearchPatients(req.params)

      res
        .status(StatusCodes.OK)
        .json({ message: ReasonPhrases.OK, users: users });
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
      const { nid } = req.params
      const { role, userId } = req.body
      const { returnedUser, filterAllergiesToOneAllergy, filterDiseasesToOneDisease, modifiedPrescriptionsToResponse } = await AuthService.FetchAllData(nid, userId, role)

      res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        data: {
          returnedUser,
          prescriptions: modifiedPrescriptionsToResponse,
          diagnoses: filterDiseasesToOneDisease,
          allergies: filterAllergiesToOneAllergy,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async fetchPendingDoctors(
    _req: Request,
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
