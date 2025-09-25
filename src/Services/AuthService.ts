import { ReasonPhrases, StatusCodes } from "http-status-codes";
import SanitizeData, { UpdatedUser } from "../helpers/UserWithoutImportantData";
import DoctorProfileModules from "../modules/DoctorModules";
import UserModules from "../modules/UserModules";
import { runInTransaction } from "../utils/TransactionalHelper";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { CreateAuthenticationToken } from "../helpers/AuthTokens";
import RefreshTokenModule from "../modules/RefreshTokenModule";
import prescriptionModule from "../modules/PrescriptionModule";
import { verifyToken } from "../helpers/verifyToken";
import { RefreshToken } from "../entities/refreshToken";
import UserCaching from "../Caching/UserCaching";
import { User } from "../entities/user";

export default class AuthService {

    static async signUp(data: any) {
        return await runInTransaction(async (manager) => {
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
                    user: newUser as User,
                    license: license,
                    specialization: speciality,
                });
                await manager.save(doctor);
            }

            let returnedUser: UpdatedUser = SanitizeData.sanitizeUser(newUser as User);
            return returnedUser;
        });
    }

    static async Login(data: any): Promise<{ refreshToken: string, accessToken: string, userWithNoData: UpdatedUser } | false> {
        return await runInTransaction(async (manager) => {
            const { nid, password } = data

            let user = await UserModules.findUserByNid(nid);

            if (!user) {
                return false
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return false
            }

            const { accessToken, refreshToken } = CreateAuthenticationToken(user);

            const refreshTokenSnippet = refreshToken.split(".")[2];

            const refreshTokenEntity = await RefreshTokenModule.createRefreshToken(user, refreshTokenSnippet as string);

            const userWithNoData = SanitizeData.sanitizeUser(user)
            await manager.save(refreshTokenEntity);
            return { refreshToken, accessToken, userWithNoData }
        })
    }

    static async SearchPatients(nid: string) {

        const users = await UserModules.searchUsersByNid(nid!);

        const modifiedUsers = users.map(user => ({
            id: user.id,
            fullName: user.first_name + " " + user.last_name,
            nid: user.NID,
        }));
        return modifiedUsers
    }

    static async FetchAllData(nid: string) {
        let user = await UserModules.fetchAllUserDataWithNid(nid)

        if (!user) {
            return null;
        }

        const cache = await UserCaching.getUser(user.NID);
        if (cache) {
            return cache;
        }

        const { prescriptions, numbers } =
            await prescriptionModule.fetchLimitedPrescriptions(user.id);


        const { patientDiagnoses, created_at, updated_at, password, email, openAccess, patientAllergies, ...returnedUser } = user
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
        const diagnoses = patientDiagnoses.map((diagnosis) => ({
            id: diagnosis.id,
            name: diagnosis.disease.name,
        }));

        const filterDiseasesToOneDisease = diagnoses.filter(
            (diagnosis, index, self) =>
                index === self.findIndex((t) => t.name === diagnosis.name)
        );

        const allergies = patientAllergies.map((allergy) => ({
            id: allergy.id,
            name: allergy.allergy.name,
        }));

        const filterAllergiesToOneAllergy = allergies.filter(
            (allergy, index, self) =>
                index === self.findIndex((t) => t.name === allergy.name)
        );

        const result = { returnedUser, modifiedPrescriptionsToResponse, filterDiseasesToOneDisease, filterAllergiesToOneAllergy }
        await UserCaching.setUser(user.NID, result);

        return result
    }

    static async refreshToken(refreshTokenFromCookie: string) {
        return await runInTransaction(async (manager) => {
            if (!refreshTokenFromCookie) {
                throw createHttpError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
            }

            const token = await verifyToken(refreshTokenFromCookie, "refresh");

            if (token.expired) {
                throw createHttpError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
            }

            const refreshTokenSignature = refreshTokenFromCookie.split(".")[2];
            const refreshTokenEntity = await RefreshTokenModule.findRefreshToken(
                refreshTokenSignature as string
            );

            if (!refreshTokenEntity || refreshTokenEntity.expiresAt < new Date()) {
                throw createHttpError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
            }

            let user = refreshTokenEntity.user;
            let returnedUser = SanitizeData.sanitizeUser(user);

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
                CreateAuthenticationToken(user);

            const newRefreshTokenSignature = newRefreshToken.split(".")[2];

            const newRefreshTokenEntity =
                await RefreshTokenModule.createRefreshToken(
                    user,
                    newRefreshTokenSignature as string
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