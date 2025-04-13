import { Response, Request, NextFunction } from "express"
import { AppDataSource } from "../../ormconfig"
import { User } from "../entities/user"
import createHttpError from "http-errors";
import bcrypt from 'bcrypt'
import UserModules from "../modules/UserModules/UserModules";
import DoctorProfileModules from "../modules/DoctorModules/DoctorModules";
import { SpecializationModules } from "../modules/SpecializationModules/SpecializationModules";
import PatientProfileModules from "../modules/patientModules/PatientModules";
import { sign } from "jsonwebtoken";


class AuthController {

    static async SignUp(req: Request, res: Response, next: NextFunction) {
        const { fName, lName, gender, NID, password, role } = req.body;
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (role === 'owner') {
                throw createHttpError.BadRequest('Owner cannot be created');
            }

            if (!NID.startsWith('2') && !NID.startsWith('3')) {
                throw new createHttpError.BadRequest('NID must start with 2 or 3');
            };
            const { newUser } = await UserModules.createUser(
                fName,
                lName,
                gender,
                NID,
                password,
                role,
                queryRunner
            )

            if (newUser?.role === "doctor" && newUser !== null) {
                const specializationEntity = SpecializationModules.isValid(req.body.specialization)
                await DoctorProfileModules.createDoctor({
                    user: newUser,
                    license: req.body.license,
                    specialization: (await specializationEntity).specializationId,
                    queryRunner: queryRunner
                })
            } else if (newUser.role === 'patient') {
                PatientProfileModules.createPatient({
                    user: newUser,
                    blood_type: req.body.blood,
                    queryRunner: queryRunner
                })
            }
            await queryRunner.commitTransaction();
            res.status(201).json({ message: "created User", newUser });
        }
        catch (err: any) {
            console.log(err)
            await queryRunner.rollbackTransaction();
            next(err)
        } finally {
            await queryRunner.release();
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {


            const user = await AppDataSource.getRepository(User)
                .createQueryBuilder('user')
                .addSelect("CONCAT(user.first_name, ' ' , user.last_name)", 'fullname')
                .where("user.NID = :NID", { NID: req.body.NID })
                .getRawOne()


            if (!user) {
                throw new createHttpError.NotFound('User not found');
            }

            const isPasswordValid = await bcrypt.compare(req.body.password, user.user_password);
            if (!isPasswordValid) {
                throw new createHttpError.Unauthorized('Invalid password');
            }

            const accessToken = sign(
                { userId: user.user_id, name: user.fullname },
                'supersecretkey',
                { expiresIn: '15m' }
            )

            const refreshToken = sign(
                { userId: user.user_id },
                'supersecretkey',
                { expiresIn: '60d' }
            )


            res.cookie('refresh-token', refreshToken, {
                secure: true,
                sameSite: 'lax',
                httpOnly: true
            })


            res.status(200).json({ message: 'Login successful', user, accessToken });
        } catch (err) {
            next(err)
        }
    }
}



export default AuthController
