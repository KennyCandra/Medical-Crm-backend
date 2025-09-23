import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { Response } from "express";

export class ResponseHelper {
    static success<T>(res: Response, data?: T, message?: string) {
        return res.status(StatusCodes.OK).json({
            message: message || ReasonPhrases.OK,
            data: { ...data }
        });
    }

    static created<T>(res: Response, data?: T, message?: string) {
        return res.status(StatusCodes.CREATED).json({
            message: message || ReasonPhrases.CREATED,
            data: { ...data }
        });
    }

    static notFound(res: Response, message?: string) {
        return res.status(StatusCodes.NOT_FOUND).json({
            message: message || ReasonPhrases.NOT_FOUND
        });
    }

    static forbidden(res: Response, message?: string) {
        return res.status(StatusCodes.FORBIDDEN).json({
            message: message || ReasonPhrases.FORBIDDEN
        });
    }

    static badRequest(res: Response, message?: string) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: message || ReasonPhrases.BAD_REQUEST
        });
    }

    static error(res: Response, statusCode: number, message?: string) {
        return res.status(statusCode).json({
            message: message || 'Internal Server Error'
        });
    }

    static unauthorized(res: Response, message?: string) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: message || ReasonPhrases.UNAUTHORIZED
        });
    }
}