import { User } from "../entities/user";
import pkg from "jsonwebtoken";

const { sign } = pkg;

export function CreateAuthenticationToken(user: User) {
  const accessToken = sign(
    { userId: user.id, role: user.role },
    process.env['JWT_SECRET_ACCESS'] as string,
    { expiresIn: "15m" }
  );
  const refreshToken = sign(
    { userId: user.id },
    process.env['JWT_SECRET_REFRESH'] as string,
    { expiresIn: "60d" }
  );
  return { accessToken, refreshToken };
}
