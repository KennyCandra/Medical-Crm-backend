import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../../ormconfig";
import { Category } from "../entities/Category";
import { Classification } from "../entities/Classification";
import { Drug } from "../entities/drug";
import CategoryModule from "../modules/CategoryModule";
import ClassificationModule from "../modules/ClassificationModule";
import createhttperror from 'http-errors'
import { Disease } from "../entities/disease";
import { Diagnosis } from "../entities/diagnosis";
import { StatusCodes , ReasonPhrases } from "http-status-codes";


export class AnalyticsController {
    static async basicAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const drugAnalytics = await AppDataSource
                .getRepository(Category)
                .createQueryBuilder('cat')
                .select('cat.name', 'name')
                .addSelect('COUNT(p.id)', 'count')
                .addSelect('cat.id', 'id')
                .leftJoin('cat.classifications', 'c')
                .leftJoin('c.drugs', 'd')
                .leftJoin('d.prescribedDrugs', 'p')
                .groupBy('cat.id')
                .addGroupBy('cat.name')
                .getRawMany();

            res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, drugAnalytics });
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    static async speificCategoryAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params
            const category = await CategoryModule.findCat(id)
            if (!category) {
                throw createhttperror.NotFound['not found']
            }
            const drugAnalytics = await AppDataSource
                .getRepository(Classification)
                .createQueryBuilder('c')
                .select('c.name', 'name')
                .addSelect('COUNT(p.id)', 'count')
                .addSelect('c.id', 'id')
                .leftJoin('c.drugs', 'd')
                .leftJoin('d.prescribedDrugs', 'p')
                .where('c.category = :id', { id: id })
                .groupBy('c.id')
                .getRawMany();

            res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, drugAnalytics, category })
        } catch (err) {
            next(err)
        }
    }

    static async specificClassificationAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params
            const classification = await ClassificationModule.findClass(id)
            if (!classification) {
                throw createhttperror.NotFound['not found']
            }
            const drugAnalytics = await AppDataSource
                .getRepository(Drug)
                .createQueryBuilder('d')
                .select('d.name', 'name')
                .addSelect('COUNT(p.id)', 'count')
                .addSelect('d.id', 'id')
                .leftJoin('d.prescribedDrugs', 'p')
                .where('d.classification = :id', { id: id })
                .groupBy('d.name')
                .addGroupBy('d.id')
                .getRawMany();
            res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, drugAnalytics, classification })

        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    static async diseaseAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const disease = await AppDataSource.getRepository(Disease).createQueryBuilder('d')
                .select('d.name', 'name')
                .addSelect('COUNT(pb.diseaseId)', 'count')
                .leftJoin('d.diagnoses', 'pb')
                .groupBy('d.id')
                .addGroupBy('d.name')
                .getRawMany();
            res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, disease });
        } catch (err) {
            console.log(err);
            next(err);
        }
    }

    static async specificDiseaseAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { role } = req.body
            if (role !== "owner") {
                res.status(409).json({ message: 'UnAuthorized' })
            }
            const { diseaseId } = req.params
            const disease = await AppDataSource.getRepository(Diagnosis)

            const results = await disease.query(`
                SELECT 
                  EXTRACT(MONTH FROM d.diagnosed_at) AS "month",
                  COUNT(d.id) AS "count",
                  SUM(COUNT(d.id)) OVER (
                      ORDER BY EXTRACT(MONTH FROM d.diagnosed_at)
                      ROWS UNBOUNDED PRECEDING
                  ) AS "cumulativeCount",
                  dis."name" AS "diseaseName"
                FROM 
                  diagnosis AS d
                LEFT OUTER JOIN 
                  disease AS dis ON dis.id = d."diseaseId"
                WHERE 
                  d."diseaseId" = $1
                  AND EXTRACT(YEAR FROM d.diagnosed_at) = $2
                GROUP BY 
                  EXTRACT(MONTH FROM d.diagnosed_at),
                  dis."name"
                ORDER BY 
                  "month"
              `, [diseaseId as any, 2025]);

            const data = results.map(row => ({
                month: parseInt(row.month),
                monthName: new Date(2025, parseInt(row.month) - 1, 1).toLocaleString('default', { month: 'long' }),
                count: parseInt(row.count),
                cumulativeCount: parseInt(row.cumulativeCount),
                diseaseName: row.diseaseName
            }));
            res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, data });
        }
        catch (err) {
            next(err)
        }
    }

}
