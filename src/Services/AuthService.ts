import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { UpdatedUser, userWithoutImportantData } from "../helpers/UserWithoutImportantData";
import DoctorProfileModules from "../modules/DoctorModules";
import UserModules from "../modules/UserModules";
import { runInTransaction } from "../utils/TransactionalHelper";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { CreateAuthenticationToken } from "../helpers/AuthTokens";
import RefreshTokenModule from "../modules/RefreshTokenModule";
import PermissionsModule from "../modules/PermissionsModule";
import prescriptionModule from "../modules/PrescriptionModule";
import { verifyToken } from "../helpers/verifyToken";
import { RefreshToken } from "../entities/refreshToken";


export default class AuthService {
    static async signUp(data: any) {
        return await runInTransaction(async (manager) => {
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
                    speciality,
                    license
                } = data;

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
                    const doctor = await DoctorProfileModules.createDoctor({
                        user: newUser,
                        license: license,
                        specialization: speciality,
                    });

                    await manager.save(doctor);
                }

                let returnedUser: UpdatedUser = userWithoutImportantData(newUser);
                return returnedUser;
            } catch (error) {
                throw error;
            }
        });
    }

    static async Login(data: any) {
        return await runInTransaction(async (manager) => {
            const { nid, password } = data

            let user = await UserModules.findUserByNid(nid);

            if (!user) {
                const errObject = {
                    status: StatusCodes.NOT_FOUND,
                    message: ReasonPhrases.NOT_FOUND,
                    error: [
                        {
                            field: "NID",
                            message: "user not found",
                        }
                    ]
                }
                throw createHttpError(errObject.status, errObject.message, { errors: errObject.error });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                const errObject = {
                    status: StatusCodes.NOT_FOUND,
                    message: ReasonPhrases.NOT_FOUND,
                    error: [
                        {
                            field: "NID",
                            message: "user not found",
                        }
                    ]
                }
                throw createHttpError(errObject.status, errObject.message, { errors: errObject.error });
            }

            const { accessToken, refreshToken } = CreateAuthenticationToken(user);

            const refreshTokenSnippet = refreshToken.split(".")[2];
            const refreshTokenEntity = await RefreshTokenModule.createRefreshToken(
                user,
                refreshTokenSnippet!
            );
            const userWithNoData = userWithoutImportantData(user)
            await manager.save(refreshTokenEntity);
            return { refreshToken, accessToken, userWithNoData }
        })
    }


    static async SearchPatients(data: any) {
        const { nid } = data
        if (nid === undefined) {
            throw createHttpError(ReasonPhrases.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)
        }
        const users = await UserModules.searchUsersByNid(nid!);

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
        return modifiedUsers
    }

    static async FetchAllData(nid: string | undefined, userId: string | undefined, role: "admin" | "patient" | "ed" | "doctor") {

        if (!nid || !userId) {
            throw createHttpError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)
        }


        let user = await UserModules.fetchAllUserDataWithNid(nid);
        const doctor = await UserModules.findUserById(userId);
        const hasPermission = await PermissionsModule.checkPermissionValidation(
            user.id,
            doctor.doctorProfile?.id!,
            1
        );

        if (
            !hasPermission &&
            !user.openAccess &&
            role !== "admin" &&
            role !== "ed" &&
            doctor.id !== user.id
        ) {
            throw createHttpError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
        }

        const { prescriptions, numbers } =
            await prescriptionModule.fetchLimitedPrescriptions(user.id);


        let returnedUser : UpdatedUser = userWithoutImportantData(user);
        let modifiedPrescriptions = prescriptions.map((presc) => {
            return {
                id: presc.id,
                status: presc.status,
                doctor:
                    presc.doctor.user.first_name + " " + presc.doctor.user.last_name,
                date: presc.start_date,
            };
        });

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

        return { returnedUser, modifiedPrescriptionsToResponse, filterDiseasesToOneDisease, filterAllergiesToOneAllergy }
    }

    static async refreshToken(refreshTokenFromCookie: string) {
        return await runInTransaction(async (manager) => {
            if (!refreshTokenFromCookie) {
                throw createHttpError(StatusCodes.UNAUTHORIZED, "the refreshToken is not found");
            }

            const token = await verifyToken(refreshTokenFromCookie);

            if (token.expired) {
                throw createHttpError(StatusCodes.UNAUTHORIZED, "the refreshToken is expired");
            }

            const refreshTokenSignature = refreshTokenFromCookie.split(".")[2];
            const refreshTokenEntity = await RefreshTokenModule.findRefreshToken(
                refreshTokenSignature!
            );

            if (!refreshTokenEntity) {
                throw createHttpError(StatusCodes.UNAUTHORIZED, "the refreshToken is not found");
            }

            if (refreshTokenEntity.expiresAt < new Date()) {
                throw createHttpError(StatusCodes.UNAUTHORIZED, "the refreshToken is expired");
            }

            let user = refreshTokenEntity.user;
            let returnedUser = userWithoutImportantData(user);

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
                CreateAuthenticationToken(user);

            const newRefreshTokenSignature = newRefreshToken.split(".")[2];
            const newRefreshTokenEntity =
                await RefreshTokenModule.createRefreshToken(
                    user,
                    newRefreshTokenSignature!
                );

            await manager.delete(RefreshToken, {
                tokenSignature: refreshTokenSignature,
            });
            await manager.save(newRefreshTokenEntity);

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                returnedUser
            };
        });
    }
}