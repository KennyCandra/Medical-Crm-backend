import { NextFunction, Request, Response } from "express";
import ReportsEntityModule from "../modules/ReportsEntityModule/ReportsEntity";
import DoctorProfileModules from "../modules/DoctorModules/DoctorModules";
import PatientProfileModules from "../modules/patientModules/PatientModules";
import createhttperror from 'http-errors'
import { AppDataSource } from "../ormconfig";

export default class ReportsController {
    static async createReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { patientId, prescribedDrugId, doctorId, description } = req.body;
            console.log(patientId, prescribedDrugId, doctorId, description)
            const [doctor, patient] = await Promise.all([
                DoctorProfileModules.findDoctor(doctorId),
                PatientProfileModules.findPatientByOriginalIdId(patientId)
            ])
            if (!doctor || !patient) {
                throw new createhttperror.NotFound(!doctor ? 'Doctor not found' : 'Patient not found');
            }


            const newReport = await ReportsEntityModule.createReportEntity(doctor, patient, description, prescribedDrugId)
            await AppDataSource.manager.save(newReport)
            res.status(201).json({ mesasge: 'created report', newReport })
        } catch (err) {
            console.error(err)
            next(err)
        }
    }



    static async fetchAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { role } = req.body
            const reports = await ReportsEntityModule.fetchAllReportsforAdmin()

            const finalResults = reports.map(report => {
                return {
                    doctorName: report.doctor.user.first_name + report.doctor.user.last_name,
                    patientName: report.patient.user.first_name + report.patient.user.last_name,
                    reviewed: report.reviewed,
                    id: report.id
                }
            })

            res.status(200).json({ message: 'here is the reports', finalResults })

        } catch (err) {
            console.error(err)
            next(err)
        }
    }

    static async fetchSingleReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reportId } = req.params
            const report = await ReportsEntityModule.fetchReport(reportId)

            const singleReport = {
                id: report.id,
                doctorName: report.doctor.user.first_name + report.doctor.user.last_name,
                patientName: report.patient.user.first_name + report.patient.user.last_name,
                description: report.description,
                reviewed: report.reviewed,
            }

            res.status(200).json({ message: 'here is the report', singleReport })

        } catch (err) {
            console.error(err)
            next(err)
        }
    }


    static async editReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reportId } = req.params
            const report = await ReportsEntityModule.fetchReport(reportId)

            report.reviewed = true
            await AppDataSource.manager.save(report)

            res.status(200).json({ message: 'edited' })

        } catch (err) {
            console.error(err)
            next(err)
        }
    }

}