import { Request, Response, NextFunction } from "express";

import { z, ZodError } from "zod";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

const validate = (schema: z.ZodSchema<any, any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body)
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessage = error.errors.map(err => err.message).join(', ')
                const errorField = error.errors.map(err => err.path).join(', ')
                res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST, error: errorMessage, errorField })
                return
            }
            else {
                next(error)
            }
        }
    }
}

export default validate