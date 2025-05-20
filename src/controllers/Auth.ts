import { Response, Request, NextFunction } from "express"
import { AppDataSource } from "../../ormconfig";
import { User } from "../entities/user";
import createHttpError from "http-errors";
import bcrypt from 'bcrypt'
import UserModules from "../modules/UserModules";
import DoctorProfileModules from "../modules/DoctorModules";
import { SpecializationModules } from "../modules/SpecializationModules";
import { verifyToken } from "../helpers/verifyToken";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import sgMail from '@sendgrid/mail'
import { createToken } from "../helpers/createToken";
import PasswordResetTokenModules from "../modules/PasswordResetTokenModules";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)


class AuthController {

    static async SignUp(req: Request, res: Response, next: NextFunction) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { firstName, lastName, gender, NID, password, role, birth_date, blood_type, email } = req.body;

            if (!NID.startsWith('2') && !NID.startsWith('3')) {
                throw new createHttpError.BadRequest('NID must start with 2 or 3');
            };

            const newUser = await UserModules.createUser(
                firstName,
                lastName,
                gender,
                NID,
                password,
                email,
                birth_date,
                blood_type,
            )

            await queryRunner.manager.save(newUser)

            if (role === "doctor") {
                const specializationEntity = SpecializationModules.isValid(req.body.speciality)
                const doctor = await DoctorProfileModules.createDoctor({
                    user: newUser,
                    license: req.body.license,
                    specialization: (await specializationEntity).specializationId,
                })

                await queryRunner.manager.save(doctor)
            }

            newUser.password = undefined
            newUser.created_at = undefined
            newUser.updated_at = undefined
            newUser.id = undefined

            const accessToken = createToken({ userId: newUser.id, role: newUser.role }, '15m')

            const refreshToken = createToken({ userId: newUser.id }, '60d')


            res.cookie('refreshToken', refreshToken, {
                secure: true,
                sameSite: 'none',
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60 * 24 * 60 * 1000
            })

            await queryRunner.commitTransaction();
            const emailContent = `
            <h1>Welcome to our platform!</h1>
            <p>Thank you for signing up with us!</p>
            <p>Your account has been created successfully.</p>
            <p>Please use the following credentials to login:</p>
            <p>Email: ${email}</p>
            <p>Your National ID: ${NID}</p>
            `
            const msg = {
                to: email,
                from: process.env.SENDGRID_FROM_EMAIL as string,
                subject: 'Welcome to our platform!',
                html: emailContent
            }

            await sgMail.send(msg)
            res.status(StatusCodes.CREATED).json({ message: ReasonPhrases.CREATED, newUser, accessToken });
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
                .where("user.NID = :NID", { NID: req.body.nid })
                .getOne()

            if (!user) {
                throw new createHttpError.NotFound('User not found');
            }

            const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
            if (!isPasswordValid) {
                throw new createHttpError.Unauthorized('Invalid password');
            }

            const accessToken = createToken({ userId: user.id, role: user.role }, '15m')

            const refreshToken = createToken({ userId: user.id }, '60d')


            res.cookie('refreshToken', refreshToken, {
                secure: true,
                sameSite: 'none',
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60 * 24 * 60 * 1000
            })
            user.password = undefined

            res.status(StatusCodes.OK).json({ message: 'Login successful', accessToken, user });
        } catch (err) {
            next(err)
        }
    }

    static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const refreshToken = req.cookies['refreshToken']
            console.log('cookies', req.cookies)
            const token = await verifyToken(refreshToken)
            console.log(token)
            if (token.expired) {
                res.status(401).json({ message: 'please login again' })
                return
            }

            const user = await AppDataSource.getRepository(User).findOneBy({ id: token.decodedToken.userId })

            const accessToken = createToken(
                { userId: user.id, name: user.first_name + " " + user.last_name, role: user.role },
                '15m'
            )

            const newRefreshToken = createToken({ userId: user.id }, '60d')


            res.cookie('refreshToken', newRefreshToken, {
                secure: true,
                sameSite: 'none',
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60 * 24 * 60 * 1000
            })

            user.password = undefined

            res.status(200).json({ accessToken, user })
        }
        catch (err) {
            console.log(err)
            next(err)
        }
    }

    static async forgetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email } = req.body;
            console.log(email)
            const user = await UserModules.findUserByEmail(email)

            if (!user) {
                throw new createHttpError.NotFound('User not found')
            }
            const token = await PasswordResetTokenModules.createToken(user)
            await AppDataSource.manager.save(token)
            const resetPasswordLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token.token}`
            const msg = {
                to: user.email,
                from: process.env.SENDGRID_FROM_EMAIL as string,
                subject: 'Reset Password',
                html: `
                <h1>Reset Password</h1>
                <p>Click the link below to reset your password</p>
                <a href="${resetPasswordLink}">Reset Password</a>
                `
            }
            await sgMail.send(msg)
            res.status(200).json({ message: 'Reset password link sent to email' })
        } catch (err) {
            next(err)
        }
    }

    static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { token, newPassword } = req.body
            const tokenEntity = await PasswordResetTokenModules.verifyToken(token)
            if (!tokenEntity) {
                throw new createHttpError.BadRequest('invalid token')
            }
            if (tokenEntity.used) {
                throw new createHttpError.BadRequest('token already used')
            }
            if (tokenEntity.expiresAt < new Date()) {
                throw new createHttpError.BadRequest('token expired')
            }
            const user = tokenEntity.user
            const hashedPw = await bcrypt.hash(newPassword, 10)
            user.password = hashedPw
            await AppDataSource.manager.save(user)
            tokenEntity.used = true
            await AppDataSource.manager.save(tokenEntity)
            res.status(200).json({ message: 'password reset successfully' })
        }
        catch (err) {
            next(err)
        }
    }
    static async logOut(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('cookies', req.cookies)
            res.clearCookie('refreshToken', {
                secure: true,
                sameSite: 'none',
                httpOnly: true,
                path: '/',
                maxAge: 0
            })

            res.status(200).json({ message: 'logged out' })
        }
        catch (err) {
            console.log(err)
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

    static async fetchUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { role, userId } = req.body;

            const query = AppDataSource.getRepository(User)
                .createQueryBuilder('user');

            if (role === 'doctor') {
                query.leftJoin('user.doctorProfile', 'doctorProfile')
                    .select('doctorProfile.id', 'profileId');
            } else {
                query.leftJoin('user.patientProfile', 'patientProfile')
                    .select('patientProfile.id', 'profileId');
            }

            query.where('user.id = :id', { id: userId });

            const result = await query.getRawOne();

            if (!result) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            res.status(200).json({ profileId: result.profileId, role });

        }
        catch (err) {
            next(err)
        }
    }


    static async fetchDoctorData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.body
            const doctor = await DoctorProfileModules.findDoctorByid(userId)
            const speciality = await SpecializationModules.doctorSpecialization(doctor.id)
            res.status(200).json({ doctor, speciality })
        }
        catch (err) {
            console.log(err)
            next(err)
        }
    }

    // static async fetchAllPatientData(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         const { role } = req.body
    //         if (role === 'patient') {
    //             res.status(409).json({ message: "you don't have access to this data" })
    //             return
    //         }
    //         const { nid } = req.params
    //         const user = await UserModules.findUserByNid(nid)
    //         const prescriptions = await prescriptionModule.findManyPrescriptions(null, user.id)
    //         const allergies = await PallergyModule.findForPatient(user.id)
    //         const diagnosis = await DiagnosisModule.findForPatient(user)
    //         const diagnoses = diagnosis.map(diag => {
    //             return diag.disease.name
    //         })
    //         user.password = undefined
    //         res.status(200).json({ prescriptions, allergies, diagnoses, user })

    //     }
    //     catch (err) {
    //         console.log(err)
    //         next(err)
    //     }
    // }

}



export default AuthController
