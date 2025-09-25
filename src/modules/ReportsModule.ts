import { User } from "../entities/user";
import { PrescribedDrug } from "../entities/prescribedDrug";
import { Reports } from "../entities/Reports";
import BasicModule from "./BasicModule";
import { FindOptionsSelect, ObjectLiteral } from "typeorm";

export default class ReportsEntityModule extends BasicModule<Reports> {
  private static instance: ReportsEntityModule;
  protected entityClass = Reports;
  protected entityName = "Reports";

  public static getInstance() {
    if (!this.instance) {
      this.instance = new ReportsEntityModule();
    }
    return this.instance;
  }

  static async createReportEntity(
    reporter: string,
    patient: string,
    description: string,
    prescribedDrug: string
  ): Promise<Reports> {
    const newReport = await this.getInstance().getRepository().create({
      reporter: { id: reporter } as User,
      patient: { id: patient } as User,
      description: description,
      prescribedDrug: { id: prescribedDrug } as PrescribedDrug
    })
    return newReport as Reports;
  }

  static async fetchAllReportsforowner(): Promise<Reports[]> {
    const relations = ['patient', 'reporter'];
    const where = {};
    const order = {};
    const selection: FindOptionsSelect<ObjectLiteral> = {};
    return await this.getInstance().customFind(relations, where, order, selection);
  }

  static async fetchReport(reportId: string): Promise<Reports | null> {
    const relations = [
      "patient",
      "reporter",
      "prescribedDrug",
      "prescribedDrug.drug",
      "prescribedDrug.drug.route",
      "prescribedDrug.prescription"
    ];

    const report = await this.getInstance().findWithIdAndRelations(reportId, relations);
    return report[0] || null;
  }

  static async fetchReportforPatientOrDoctor(
    doctorId: string | null,
    patientId: string | null
  ): Promise<Reports[]> {
    const relations = [
      "patient",
      "reporter",
      "prescribedDrug",
    ]
    const where: Record<string, any> = {}
    if (doctorId) {
      where['reporter'] = { id: doctorId }
    } else {
      where['patient'] = { id: patientId }
    }
    const order = {};
    const selection: FindOptionsSelect<ObjectLiteral> = {};
    return await this.getInstance().customFind(relations, where, order, selection);

  }
}
