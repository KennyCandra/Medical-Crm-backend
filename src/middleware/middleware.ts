import { Response, Request, NextFunction } from "express";

declare module "express-serve-static-core" {
    interface Request {
        Authorization: string;
        userId: string;
    }
}

export class Auth {

    static isAuth(req: Request, res: Response, next: NextFunction) {
        try {
            const accessToken = req.get('Authorization');

            if (!accessToken) {
                res.status(401).json({ message: 'not authenticated' })
                return
            }

            next()
        }
        catch (err) {
            next(err)
        }

    }
}