import { sign } from "jsonwebtoken";

export const createToken = (payload: any, expiresIn: string) => {
    return sign(payload, process.env.JWT_SECRET as string, { expiresIn })
}
