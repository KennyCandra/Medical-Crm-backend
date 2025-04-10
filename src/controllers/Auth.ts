import { Response, Request, NextFunction } from "express"
import { AppDataSource } from "../../ormconfig"
import { User } from "../entities/user"
import createHttpError from "http-errors";
import bcrypt from 'bcrypt'
import { createDoctorProfile } from "../helpers/docotorProfileCreation";
import createUser from "../helpers/createUser";

class AuthController {

    static async SignUp(req: Request, res: Response, next: NextFunction) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const { fName, lName, gender, NID, password, role } = req.body;

        if (role === 'owner') {
            throw createHttpError.BadRequest('Owner cannot be created');
        }

        if (!NID.startsWith('2') && !NID.startsWith('3')) {
            throw new createHttpError.BadRequest('NID must start with 2 or 3');
        };

        const newUser = await createUser(fName, lName, gender, NID, password, role);

        try {
            await queryRunner.manager.save(newUser)
            if (newUser.role === "doctor") {
                await createDoctorProfile({ req, queryRunner, newUser });
            }

            await queryRunner.commitTransaction();
            res.status(201).json({ message: "created User", newUser });
        }
        catch (err: any) {
            await queryRunner.rollbackTransaction();
            if (err.code === '23505') {
                const err = new createHttpError.BadRequest('NID already exists');
                next(err)
            } else {
                next(err)
            }
            return
        } finally {
            await queryRunner.release();
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        const { NID, password } = req.body;
        try {
            const user = await AppDataSource.getRepository(User).findOneBy({ NID });
            if (!user) {
                throw new createHttpError.BadRequest('User not found');
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new createHttpError.BadRequest('Invalid password');
            }
            res.status(200).json({ message: 'Login successful', user });
        } catch (err) {
            next(err)
        }
    }
}



export default AuthController
