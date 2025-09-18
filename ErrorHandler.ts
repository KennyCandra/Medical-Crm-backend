import { NextFunction, Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import createHttpError from "http-errors";
import { DatabaseError, handlePostgresError } from "./src/utils/postgresErrorHandler";


export default function ErrorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (typeof err === "object" && err !== null && "detail" in err) {
        handlePostgresError(err as DatabaseError, res);
        return
    }
    let status: number = StatusCodes.INTERNAL_SERVER_ERROR;
    let message: string = ReasonPhrases.INTERNAL_SERVER_ERROR;

    if (createHttpError.isHttpError(err)) {
        status = err.statusCode;
        message = err.message;
    }
    res.status(status).json({ message: message });
}