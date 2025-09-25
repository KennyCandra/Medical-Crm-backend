import { FindOptionsSelect, LessThan, ObjectLiteral } from "typeorm";
import { RefreshToken } from "../entities/refreshToken";
import { User } from "../entities/user";
import BasicModule from "./BasicModule";

export default class RefreshTokenModule extends BasicModule<RefreshToken> {
  private static instance: RefreshTokenModule;
  protected entityClass = RefreshToken;
  protected entityName = "RefreshToken";

  public static getInstance() {
    if (!this.instance) {
      this.instance = new RefreshTokenModule();
    }
    return this.instance;
  }
  static async createRefreshToken(
    user: User,
    tokenSignature: string
  ): Promise<RefreshToken> {
    return await this.getInstance().getRepository().create({
      user,
      tokenSignature,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
    }) as RefreshToken;
  }


  static async findRefreshToken(
    tokenSignature: string
  ): Promise<RefreshToken | null> {
    await this.cleanExpiredTokens();
    const relations = ["user", "user.doctorProfile"];
    const where = { tokenSignature };
    const order = {};
    const selection: FindOptionsSelect<ObjectLiteral> = {};
    const tokens = await this.getInstance().customFind(relations, where, order, selection);
    return tokens[0] || null;
  }

  static async cleanExpiredTokens(): Promise<void> {
    await this.getInstance().deleteWithWhere({
      expiresAt: LessThan(new Date()),
    });
  }

  static async deleteAllRefreshTokens(userId: string): Promise<void> {
    await this.getInstance().deleteWithWhere({
      user: {
        id: userId,
      },
    });
  }

}
