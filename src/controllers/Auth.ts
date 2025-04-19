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
                .leftJoinAndSelect('user.doctorProfile', 'doctorProfile')
                .leftJoinAndSelect('user.patientProfile', 'patientProfile')
                .where("user.NID = :NID", { NID: req.body.NID })
                .getOne()

            if (!user) {
                throw new createHttpError.NotFound('User not found');
            }

            const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
            if (!isPasswordValid) {
                throw new createHttpError.Unauthorized('Invalid password');
            }

            const accessToken = sign(
                { userId: user.id, name: user.first_name + " " + user.last_name },
                'supersecretkey',
                { expiresIn: '15m' }
            )

            const refreshToken = sign(
                { userId: user.id },
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

    static async fetchUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await AppDataSource.getRepository(User).createQueryBuilder('user').where('user.id = :id', { id: req.body.userId }).getOne()

            res.status(200).json({ message: 'fetched user', user })
        }
        catch (err) {
            console.log(err)
            next(err)
        }
    }

    static async searchPatient(req: Request, res: Response, next: NextFunction) {
        try {
            const nid = req.params.nid;

            const users = await AppDataSource.getRepository(User)
                .createQueryBuilder('user')
                .where('user.NID LIKE :nid', { nid: `%${nid}%` })
                .andWhere('user.role = :role', { role: 'patient' })
                .leftJoinAndSelect('user.patientProfile', 'patientProfile')
                .select([
                    'user.id AS id',
                    'user.NID as NID',
                    "CONCAT(user.first_name, ' ', user.last_name) AS fullName"
                ])
                .getRawMany()

            res.status(200).json({ users });
        }
        catch (err) {
            console.log(err)
            next(err);
        }
    }
}



export default AuthController
