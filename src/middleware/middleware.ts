import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers/verifyToken";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

declare module "express-serve-static-core" {
    interface Request {
        Authorization: string;
        userId: string;
    }
}

interface DecodedToken {
    userId: string;
    exp: number;
    role: string
}

class Auth {
    static async checkToken(req: Request, res: Response, next: NextFunction) {
        try {
            console.log(req.body)
            const accessToken = req.get('Authorization');
            if (!accessToken) {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: ReasonPhrases.UNAUTHORIZED });
                return;
            }

            const { decodedToken, expired } = await verifyToken(accessToken);

            if (expired) {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: ReasonPhrases.UNAUTHORIZED });
                return;
            }
            req.body.role = (decodedToken as DecodedToken).role
            req.body.userId = (decodedToken as DecodedToken).userId;
            next();


        } catch (error) {
            next(error);
        }
    }

    static checkRoles(allowedRoles: string[]) {
        return async (req: Request, res: Response, next: NextFunction) => {
            const { role } = req.body;
            if (!allowedRoles.includes(role)) {
                res.status(StatusCodes.FORBIDDEN).json({ message: ReasonPhrases.FORBIDDEN });
                return;
            }
            next();
        };
    }
}

export default Auth;
