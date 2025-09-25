import { DiagnosisController } from "../controllers/DiagnosisController";
import asyncWrapper from "../utils/AsyncWrapper";
import { ResponseHelper } from "../utils/ResponseHelper";
import { Request, Response } from "express";

class DiganosisService {
    static fetchForPatient = asyncWrapper(async (req: Request, res: Response) => {
        const { nid } = req.params;
        const diagnoses = await DiagnosisController.fetchForPatient(nid as string);

        if (!diagnoses) {
            ResponseHelper.notFound(res);
            return;
        }

        ResponseHelper.success(res, { diagnoses: diagnoses });
    })

    static createDiagnosis = asyncWrapper(async (req: Request, res: Response) => {
        const { patientId, doctorId, diseaseId, severity, notes } = req.body;
        const diagnosis = await DiagnosisController.createDiagonsis(
            patientId,
            doctorId,
            diseaseId,
            severity,
            notes
        );
        ResponseHelper.success(res, { diagnosis });
    })


    static removeDiagnosis = asyncWrapper(async (req: Request, res: Response) => {
        const { id } = req.params;
        const diagnosis = await DiagnosisController.removeDiagnosis(id as string);
        ResponseHelper.success(res, { diagnosis });
    })
}

export default DiganosisService;