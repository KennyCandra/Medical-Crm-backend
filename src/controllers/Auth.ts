import { Response, Request, NextFunction } from "express"
import { AppDataSource } from "../../ormconfig";
import { User } from "../entities/user";
import createHttpError from "http-errors";
import bcrypt from 'bcrypt'
import UserModules from "../modules/UserModules/UserModules";
import DoctorProfileModules from "../modules/DoctorModules/DoctorModules";
import { SpecializationModules } from "../modules/SpecializationModules/SpecializationModules";
import PatientProfileModules from "../modules/patientModules/PatientModules";
import jwt from "jsonwebtoken";
import { verifyToken } from "../helpers/verifyToken";
import prescriptionModule from "../modules/Prescription/PrescriptionModule";
import PallergyModule from "../modules/PallergyModule/PallergyModule";
import DiagnosisModule from "../modules/DiagnosisModule/DiagnosisModule";

const sign = jwt.sign;
class AuthController {

    static async SignUp(req: Request, res: Response, next: NextFunction) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { firstName, lastName, gender, NID, password, role , birth_date } = req.body;

            if (role === 'owner') {
                throw createHttpError.BadRequest('Owner cannot be created');
            }

            if (!NID.startsWith('2') && !NID.startsWith('3')) {
                throw new createHttpError.BadRequest('NID must start with 2 or 3');
            };
            const newUser = await UserModules.createUser(
                firstName,
                lastName,
                gender,
                NID,
                password,
                role,
                birth_date
            )
            await queryRunner.manager.save(newUser)

            if (newUser?.role === "doctor" && newUser !== null) {
                const specializationEntity = SpecializationModules.isValid(req.body.speciality)
                const doctor = await DoctorProfileModules.createDoctor({
                    user: newUser,
                    license: req.body.license,
                    specialization: (await specializationEntity).specializationId,
                })
                await queryRunner.manager.save(doctor)
            } else if (newUser.role === 'patient') {
                const patient = await PatientProfileModules.createPatient({
                    user: newUser,
                    blood_type: req.body.blood_type,
                })
                await queryRunner.manager.save(patient)
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
                .where("user.NID = :NID", { NID: req.body.nid })
                .getOne()

            if (!user) {
                throw new createHttpError.NotFound('User not found');
            }

            const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
            if (!isPasswordValid) {
                throw new createHttpError.Unauthorized('Invalid password');
            }

            const accessToken = sign(
                { userId: user.id, name: user.first_name + " " + user.last_name, role: user.role },
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
            user.password = undefined

            res.status(200).json({ message: 'Login successful', accessToken, user });
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

    static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const refreshToken = req.cookies['refresh-token']
            const token = await verifyToken(refreshToken)
            if (token.expired) {
                res.status(401).json({ message: 'please login again' })
                return
            }

            const user = await AppDataSource.getRepository(User).findOneBy({ id: token.decodedToken.userId })

            const accessToken = sign(
                { userId: user.id, name: user.first_name + " " + user.last_name, role: user.role },
                'supersecretkey',
                { expiresIn: '15m' }
            )

            user.password = undefined

            res.status(200).json({ accessToken, user })
        }
        catch (err) {
            console.log(err)
            next(err)
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

    static async logOut(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.clearCookie('refreshToken', {
                secure: true,
                sameSite: 'lax',
                httpOnly: true
            })

            res.status(200).json({ message: 'logged out' })
        }
        catch (err) {
            console.log(err)
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

    static async fetchAllPatientData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { role } = req.body
            if (role === 'patient') {
                res.status(409).json({ message: "you don't have access to this data" })
                return
            }
            const { nid } = req.params
            const user = await UserModules.findUserByNid(nid)
            const patient = await PatientProfileModules.findPatientbyNid(nid)
            const prescriptions = await prescriptionModule.findManyPrescriptions(null, patient.id)
            const allergies = await PallergyModule.findForPatient(patient.id)
            const diagnosis = await DiagnosisModule.findForPatient(patient)
            const diagnoses = diagnosis.map(diag => {
                return diag.disease.name
            })
            user.password = undefined
            res.status(200).json({ patient, prescriptions, allergies, diagnoses, user })

        }
        catch (err) {
            console.log(err)
            next(err)
        }
    }

}



export default AuthController
