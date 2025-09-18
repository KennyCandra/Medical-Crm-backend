import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../../ormconfig";
import { Category } from "../entities/Category";
import { Classification } from "../entities/Classification";
import { Drug } from "../entities/drug";
import CategoryModule from "../modules/CategoryModule";
import ClassificationModule from "../modules/ClassificationModule";
import createhttperror from "http-errors";
import { Disease } from "../entities/disease";
import { Diagnosis } from "../entities/diagnosis";
import { StatusCodes, ReasonPhrases } from "http-status-codes";


type Row1 = {
  month: string;
  count: string;
  cumulativeCount: string;
  diseaseName: string;
}

type Row2 = {
  year: string;
  count: string
}
export class AnalyticsController {
  static async basicAnalytics(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const drugAnalytics = await AppDataSource.getRepository(Category)
        .createQueryBuilder("cat")
        .select("cat.name", "name")
        .addSelect("COUNT(p.id)", "count")
        .addSelect("cat.id", "id")
        .leftJoin("cat.classifications", "c")
        .leftJoin("c.drugs", "d")
        .leftJoin("d.prescribedDrugs", "p")
        .groupBy("cat.id")
        .addGroupBy("cat.name")
        .getRawMany();

      res
        .status(StatusCodes.OK)
        .json({ message: ReasonPhrases.OK, data: { drugAnalytics } });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async speificCategoryAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw createhttperror(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)
      }

      const category = await CategoryModule.findCat(id);
      if (!category) {
        throw createhttperror(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
      }
      const drugAnalytics = await AppDataSource.getRepository(Classification)
        .createQueryBuilder("c")
        .select("c.name", "name")
        .addSelect("COUNT(p.id)", "count")
        .addSelect("c.id", "id")
        .leftJoin("c.drugs", "d")
        .leftJoin("d.prescribedDrugs", "p")
        .where("c.category = :id", { id: id })
        .groupBy("c.id")
        .getRawMany();

      res
        .status(StatusCodes.OK)
        .json({ message: ReasonPhrases.OK, data: { drugAnalytics, category } });
    } catch (err) {
      next(err);
    }
  }

  static async specificClassificationAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw createhttperror(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
      }
      const classification = await ClassificationModule.findClass(id);
      if (!classification) {
        throw createhttperror(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
      }
      const drugAnalytics = await AppDataSource.getRepository(Drug)
        .createQueryBuilder("d")
        .select("d.name", "name")
        .addSelect("COUNT(p.id)", "count")
        .addSelect("d.id", "id")
        .leftJoin("d.prescribedDrugs", "p")
        .where("d.classification = :id", { id: id })
        .groupBy("d.name")
        .addGroupBy("d.id")
        .getRawMany();
      res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        data: { drugAnalytics, classification },
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async specificDiseaseAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { diseaseId } = req.params;
      const { year, firstMonth, lastMonth } = req.query;
      const disease = await AppDataSource.getRepository(Diagnosis);
      let currentYear = new Date().getFullYear();
      let currentMonth = new Date().getMonth() + 1;

      let yearQuery = year ? parseInt(year as string) : currentYear;
      let firstMonthQuery = firstMonth ? parseInt(firstMonth as string) : 1;
      let lastMonthQuery = lastMonth
        ? parseInt(lastMonth as string)
        : currentYear === yearQuery
          ? currentMonth
          : 12;

      if (
        yearQuery < 1900 ||
        yearQuery > 2100 ||
        firstMonthQuery < 1 ||
        firstMonthQuery > 12 ||
        lastMonthQuery < 1 ||
        lastMonthQuery > 12 ||
        firstMonthQuery > lastMonthQuery
      ) {
        throw createhttperror.BadRequest("invalid date range");
      }
      const results = await disease.query(
        `SELECT
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
                  AND EXTRACT(MONTH FROM d.diagnosed_at) BETWEEN $3 AND $4
                GROUP BY 
                  EXTRACT(MONTH FROM d.diagnosed_at),
                  dis."name"
                ORDER BY 
                  "month"
              `,
        [diseaseId as Disease["id"], yearQuery, firstMonthQuery, lastMonthQuery]
      );

      const results2 = await disease.query(
        `
        SELECT 
          EXTRACT(YEAR FROM d.diagnosed_at) AS "year",
          COUNT(d.id) AS "count"
        FROM 
          diagnosis AS d
        WHERE 
          d."diseaseId" = $1
          AND EXTRACT(YEAR FROM d.diagnosed_at) < $2
        GROUP BY 
          "year"
      `,
        [diseaseId as Disease["id"], yearQuery]
      );

      const firstData = results.map((row: Row1) => ({
        month: parseInt(row.month),
        monthName: new Date(
          yearQuery,
          parseInt(row.month) - 1,
          1
        ).toLocaleString("default", { month: "long" }),
        count: parseInt(row.count),
        cumulativeCount: parseInt(row.cumulativeCount),
        diseaseName: row.diseaseName,
      }));

      const secondData = results2.map((row: Row2) => ({
        year: parseInt(row.year),
        count: parseInt(row.count),
      }));

      const previousYearsCount = secondData.reduce(
        (prev: number, count: { year: number; count: number }) =>
          prev + count.count,
        0
      );
      const data = {
        current: firstData,
        previous: previousYearsCount,
      };
      res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, data });
    } catch (err) {
      next(err);
    }
  }
}
