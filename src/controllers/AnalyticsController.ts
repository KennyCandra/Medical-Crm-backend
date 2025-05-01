import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../../ormconfig";
import { Category } from "../entities/Category";
import { Classification } from "../entities/Classification";
import { Drug } from "../entities/drug";
import CategoryModule from "../modules/CategoryModule/CategoryModule";
import ClassificationModule from "../modules/ClassificationModule/ClassificationModule";
import createhttperror from 'http-errors'
import { Disease } from "../entities/disease";

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

            res.status(200).json(drugAnalytics);
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

            res.status(200).json({ drugAnalytics, category })
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
            res.status(200).json({ drugAnalytics, classification })

        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    static async specificDiseaseAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const disease = await AppDataSource.getRepository(Disease).createQueryBuilder('d')
                .select('d.name', 'name')
                .addSelect('COUNT(pb.diseaseId)', 'count')
                .leftJoin('d.diagnoses', 'pb')
                .groupBy('d.id')
                .addGroupBy('d.name')
                .getRawMany();
            res.status(200).json(disease);
        } catch (err) {
            console.log(err);
            next(err);
        }
    }

}
