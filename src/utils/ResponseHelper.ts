import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { Response } from "express";

export class ResponseHelper {
    static success<T>(res: Response, data?: T, message?: string) {
        res.status(StatusCodes.OK).json({
            message: message || ReasonPhrases.OK,
            data: { ...data }
        });
        return;
    }

    static created<T>(res: Response, data?: T, message?: string) {
        res.status(StatusCodes.CREATED).json({
            message: message || ReasonPhrases.CREATED,
            data: { ...data }
        });
        return;
    }

    static notFound(res: Response, message?: string) {
        res.status(StatusCodes.NOT_FOUND).json({
            message: message || ReasonPhrases.NOT_FOUND
        });
        return;
    }

    static forbidden(res: Response, message?: string) {
        res.status(StatusCodes.FORBIDDEN).json({
            message: message || ReasonPhrases.FORBIDDEN
        });
        return;
    }

    static badRequest(res: Response, message?: string) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: message || ReasonPhrases.BAD_REQUEST
        });
        return;
    }

    static error(res: Response, statusCode: number, message?: string) {
        res.status(statusCode).json({
            message: message || 'Internal Server Error'
        });
        return;
    }

    static unauthorized(res: Response, message?: string) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            message: message || ReasonPhrases.UNAUTHORIZED
        });
        return;
    }

    static conflict(res: Response, message?: string) {
        res.status(StatusCodes.CONFLICT).json({
            message: message || ReasonPhrases.CONFLICT
        });
        return;
    }

    static CustomErr(res: Response, message?: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
        res.status(statusCode).json({
            message: message || ReasonPhrases.INTERNAL_SERVER_ERROR
        });
        return;
    }
}