import { Request } from "express"
import { DoctorProfile } from "../entities/doctorProfile"
import { QueryRunner } from "typeorm"
import { Specialization } from "../entities/specialization"
import { User } from "../entities/user"
import createHttpError from 'http-errors'


export async function createDoctorProfile({ req, queryRunner, newUser }: { req: Request, queryRunner: QueryRunner, newUser: User }) {
    const { license, specialization } = req.body

    const specializationEntity = await queryRunner.manager
        .getRepository(Specialization)
        .findOneBy({ name: specialization })

    if (!specializationEntity) {
        throw createHttpError.NotFound(`Specialization "${specialization}" not found`)
    }
    const newDoctor = new DoctorProfile()
    newDoctor.medical_license_number = license
    newDoctor.specialization = specializationEntity
    newDoctor.user = newUser

    try {
        await queryRunner.manager.save(newDoctor)
        return newDoctor
    } catch (error) {
        if (error.code === '23505') {
            throw createHttpError.Conflict('License already exists')
        }
        throw error
    }
}
