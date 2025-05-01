import { Prescription } from "../../entities/prescription";
import { PatientProfile } from "../../entities/patientProfile";
import { DoctorProfile } from "../../entities/doctorProfile";
import createhttperror from 'http-errors'
import { PrescribedDrug } from "../../entities/prescribedDrug";
import { AppDataSource } from "../../../ormconfig";

class prescriptionModule {
    static async createPrescription({ patient, doctor, prescribedDrug }: { patient: PatientProfile, doctor: DoctorProfile, prescribedDrug: PrescribedDrug[] }) {
        try {
            const newPrescrition = new Prescription()
            newPrescrition.doctor = doctor;
            newPrescrition.patient = patient;
            newPrescrition.prescribedDrugs = prescribedDrug
            newPrescrition.start_date = new Date()

            return newPrescrition
        } catch (err) {
            throw new createhttperror.InternalServerError['internal server error']
        }
    }


    static async findPrescription(prescriptionId: string, relations: string[] = []) {
        try {
            const queryBuilder = AppDataSource.getRepository(Prescription)
                .createQueryBuilder('prescription')
                .where("prescription.id = :id", { id: prescriptionId });

            if (relations.includes('patient')) {
                queryBuilder.leftJoinAndSelect('prescription.patient', 'patient');

                if (relations.includes('patient.user')) {
                    queryBuilder.leftJoinAndSelect('patient.user', 'patientUser');
                }
            }

            if (relations.includes('doctor')) {
                queryBuilder.leftJoinAndSelect('prescription.doctor', 'doctor');

                if (relations.includes('doctor.user')) {
                    queryBuilder.leftJoinAndSelect('doctor.user', 'doctorUser');
                }
            }

            if (relations.includes('prescribedDrugs')) {
                queryBuilder.leftJoinAndSelect('prescription.prescribedDrugs', 'prescribedDrugs');

                if (relations.includes('prescribedDrugs.drug')) {
                    queryBuilder.leftJoinAndSelect('prescribedDrugs.drug', 'drug');
                }
            }


            const prescription = await queryBuilder.getOne();
            return prescription;
        } catch (err) {
            throw err;
        }
    }

    static async findManyPrescriptions(doctorId: string, patientId: string) {
        try {
            const queryBuilder = AppDataSource.getRepository(Prescription)
                .createQueryBuilder('prescription')
                .leftJoinAndSelect('prescription.doctor', 'doctor')
                .leftJoinAndSelect('prescription.patient', 'patient')
                .leftJoinAndSelect('doctor.user', 'doctorProfile')
                .leftJoinAndSelect('patient.user', 'patientProfile');

            if (doctorId) {
                queryBuilder.where('doctor.id = :id', { id: doctorId });
            } else {
                queryBuilder.where('patient.id = :id', { id: patientId });
            }

            const prescriptions = await queryBuilder.getMany();
            return prescriptions;
        } catch (err) {
            throw err;
        }
    }

    static async fetchDrugsFromPrescriptinsWithStatusTakingForSinglePatient(patientId) {
        try {
            const prescriptions = await AppDataSource.getRepository(Prescription)
                .createQueryBuilder('p')
                .where('p.patient = :patient', { patient: patientId })
                .andWhere('p.status = :status', { status: 'taking' })
                .leftJoinAndSelect('p.prescribedDrugs', 'pd')
                .leftJoinAndSelect('pd.drug', 'd')
                .select('d.name', 'name')
                .distinct(true)
                .getRawMany();
            console.log(prescriptions)
            return prescriptions

        } catch (err) {
            console.log(err)
            throw createhttperror(500, 'internal server error')
        }
    }


}

export default prescriptionModule