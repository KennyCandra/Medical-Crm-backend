import { Request, Response, NextFunction } from "express";

import { z, ZodError } from "zod";


const validate = (schema: z.ZodSchema<any, any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body)
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessage = error.errors.map(err => err.message).join(', ')
                res.status(400).json({ message: 'validation data', error: errorMessage })
                return
            }
            else {
                next(error)
            }
        }
    }
}

export default validate