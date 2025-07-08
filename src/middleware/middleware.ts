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

    static async checkAdminRole(req: Request, res: Response, next: NextFunction) {
        const { role } = req.body;
        if (role !== "owner") {
            res.status(StatusCodes.FORBIDDEN).json({ message: ReasonPhrases.FORBIDDEN });
            return;
        }
        next();
    }

    static async checkDoctorRole(req: Request, res: Response, next: NextFunction) {
        const { role } = req.body;
        if (role !== "doctor") {
            res.status(StatusCodes.FORBIDDEN).json({ message: ReasonPhrases.FORBIDDEN });
            return;
        }
        next();
    }
}

export default Auth;
