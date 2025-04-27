import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers/verifyToken";

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
                res.status(401).json({ message: "Not Authenticated" });
                return;
            }

            const { decodedToken, expired } = await verifyToken(accessToken);

            if (expired) {
                res.status(401).json({ message: "Not Authenticated" });
                return;
            }
            req.body.role = (decodedToken as DecodedToken).role
            req.body.userId = (decodedToken as DecodedToken).userId;
            next();


        } catch (error) {
            res.status(500).json({ message: "Authentication error" });
        }
    }
}

export default Auth;
