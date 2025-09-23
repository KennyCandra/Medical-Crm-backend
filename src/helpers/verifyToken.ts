import pkg from "jsonwebtoken";

const { verify } = pkg;

export const verifyToken = async (
  token: string,
  tokenType: "access" | "refresh"
): Promise<{ decodedToken: any; expired: boolean }> => {
  try {
    const decodedToken = verify(token, tokenType === "access" ? process.env['JWT_SECRET_ACCESS'] as string : process.env['JWT_SECRET_REFRESH'] as string);
    return { decodedToken, expired: false };
  } catch (error) {
    return { decodedToken: null, expired: true };
  }
};
