import { LessThan } from "typeorm";
import { AppDataSource } from "../../ormconfig";
import { RefreshToken } from "../entities/refreshToken";
import { User } from "../entities/user";

export default class RefreshTokenModule {
  static async createRefreshToken(
    user: User,
    tokenSignature: string
  ): Promise<RefreshToken> {
    const token = new RefreshToken();
    token.user = user;
    token.tokenSignature = tokenSignature;
    token.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60);
    return token;
  }


  static async findRefreshToken(
    tokenSignature: string
  ): Promise<RefreshToken | null> {
    await this.cleanExpiredTokens();
    return await AppDataSource.getRepository(RefreshToken).findOne({
      where: {
        tokenSignature,
      },
      relations: {
        user: {
          doctorProfile: {
            specialization: true,
          },
        },
      },
    });
  }

  static async cleanExpiredTokens(): Promise<void> {
    await AppDataSource.getRepository(RefreshToken).delete({
      expiresAt: LessThan(new Date()),
    });
  }

  static async deleteAllRefreshTokens(userId: string): Promise<void> {
    await AppDataSource.getRepository(RefreshToken).delete({
      user: {
        id: userId,
      },
    });
  }
}
