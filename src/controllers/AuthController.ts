import { Response, Request, CookieOptions } from "express";
import { AppDataSource } from "../../ormconfig";
import DoctorProfileModules from "../modules/DoctorModules";
import { RefreshToken } from "../entities/refreshToken";
import { cookiesConfig, removedCookiesConfig } from "../config/cookiesConfig";
import AuthService from "../Services/AuthService";
import { ResponseHelper } from "../utils/ResponseHelper";
import asyncWrapper from "../utils/AsyncWrapper";
import { UpdatedUser } from "../helpers/UserWithoutImportantData";
import { StatusCodes } from "http-status-codes";

class AuthController {
  static SignUp = asyncWrapper(async (req: Request, res: Response) => {
    const newUser = await AuthService.signUp(req.body)
    ResponseHelper.created(res, newUser)
  })

  static login = asyncWrapper(async (req: Request, res: Response) => {
    const data: { refreshToken: string, accessToken: string, userWithNoData: UpdatedUser } | false = await AuthService.Login(req.body)

    if (data === false) {
      ResponseHelper.error(res, StatusCodes.UNAUTHORIZED, "Invalid credentials")
      return;
    }
    const { refreshToken, accessToken, userWithNoData } = data;
    res.cookie("refreshToken", refreshToken, cookiesConfig as CookieOptions);
    ResponseHelper.success(res, { accessToken, user: userWithNoData })
  })

  static refreshToken = asyncWrapper(async (
    req: Request,
    res: Response,
  ) => {
    const refreshTokenFromCookie = req.cookies["refreshToken"];
    const { refreshToken, accessToken, returnedUser } = await AuthService.refreshToken(refreshTokenFromCookie);

    res.cookie("refreshToken", refreshToken, cookiesConfig as CookieOptions);
    ResponseHelper.success(res, { accessToken, user: returnedUser })
  })

  static logOut = asyncWrapper(async (
    req: Request,
    res: Response,
  ) => {
    const refreshToken = req.cookies["refreshToken"];
    const refreshTokenSignature = refreshToken.split(".")[2];
    await AppDataSource.manager.delete(RefreshToken, {
      tokenSignature: refreshTokenSignature,
    });
    res.clearCookie("refreshToken", removedCookiesConfig as CookieOptions);

    ResponseHelper.success(res, {})
  })

  static searchPatient = asyncWrapper(async (req: Request, res: Response) => {
    const { nid } = req.params
    const users = await AuthService.SearchPatients(nid as string)
    ResponseHelper.success(res, { users })
  })

  static fetchAllPatientData = asyncWrapper(async (
    req: Request,
    res: Response,
  ) => {
    const { nid } = req.params
    const data = await AuthService.FetchAllData(nid as string)

    if (!data) {
      ResponseHelper.error(res, StatusCodes.NOT_FOUND, "User not found")
      return;
    }

    const { returnedUser,
      filterAllergiesToOneAllergy,
      filterDiseasesToOneDisease,
      modifiedPrescriptionsToResponse
    } = data

    ResponseHelper.success(res, {
      user: returnedUser,
      prescriptions: modifiedPrescriptionsToResponse,
      diagnoses: filterDiseasesToOneDisease,
      allergies: filterAllergiesToOneAllergy,
    })
  })

  static fetchPendingDoctors = asyncWrapper(async (
    _req: Request,
    res: Response,
  ) => {
    const doctors = await DoctorProfileModules.fetchPendingDoctors();
    ResponseHelper.success(res, { doctors })
  })

  static approveDoctor = asyncWrapper(async (
    req: Request,
    res: Response,
  ) => {
    const { doctors } = req.body;
    const approvedDoctors = await DoctorProfileModules.approveDoctor(doctors);
    ResponseHelper.success(res, { approvedDoctors })
  })

}

export default AuthController;



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
//   } catch (err : unknown) {
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
//   } catch (err : unknown) {
//     next(err);
//   }
// }