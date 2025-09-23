import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers/verifyToken";
import { ResponseHelper } from "../utils/ResponseHelper";

declare module "express-serve-static-core" {
  interface Request {
    Authorization: string;
    user: {
      role: string;
      id: string
    }
  }
}

interface DecodedToken {
  userId: string;
  exp: number;
  role: string;
}

class Auth {
  static async checkToken(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken = req.get("Authorization");
      if (!accessToken) {
        ResponseHelper.unauthorized(res);
        return;
      }

      const { decodedToken, expired } = await verifyToken(accessToken, "access");

      if (expired) {
        ResponseHelper.unauthorized(res);
        return;
      }
      req.user = {
        role: (decodedToken as DecodedToken).role,
        id: (decodedToken as DecodedToken).userId
      }
      next();
    } catch (error) {
      next(error);
    }
  }

  static checkRoles(allowedRoles: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { role } = req.user;
      if (role === "admin") {
        next();
        return;
      }

      if (!allowedRoles.includes(role)) {
        ResponseHelper.forbidden(res);
        return;
      }
      next();
    };
  }
}

export default Auth;
