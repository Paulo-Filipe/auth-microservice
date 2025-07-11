import { V4 } from 'paseto';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { db, redis } from '../db';
import { refreshTokens } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
  iss: string;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
  iat: number;
  exp: number;
  iss: string;
}

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly secretKey = Buffer.from(config.PASETO_SECRET, 'utf8');

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async generateAccessToken(userId: string, email: string, name: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: userId,
      email,
      name,
      iat: now,
      exp: now + config.ACCESS_TOKEN_TTL,
      iss: config.PASETO_ISSUER,
    };

    return V4.sign(payload, this.secretKey);
  }

  static async generateRefreshToken(userId: string): Promise<string> {
    const tokenId = randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = new Date((now + config.REFRESH_TOKEN_TTL) * 1000);

    const payload = {
      sub: userId,
      tokenId,
      iat: now,
      exp: now + config.REFRESH_TOKEN_TTL,
      iss: config.PASETO_ISSUER,
    };

    const token = await V4.sign(payload, this.secretKey);

    await db.insert(refreshTokens).values({
      userId,
      token: tokenId,
      expiresAt,
    });

    return token;
  }

  static async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const payload = await V4.verify(token, this.secretKey) as any;
      return payload as TokenPayload;
    } catch {
      return null;
    }
  }

  static async verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
    try {
      const payload = await V4.verify(token, this.secretKey) as RefreshTokenPayload;
      
      const refreshToken = await db
        .select()
        .from(refreshTokens)
        .where(
          and(
            eq(refreshTokens.token, payload.tokenId),
            eq(refreshTokens.userId, payload.sub)
          )
        )
        .limit(1);

      if (refreshToken.length === 0) {
        return null;
      }

      const tokenData = refreshToken[0];
      if (!tokenData || tokenData.expiresAt < new Date()) {
        await this.revokeRefreshToken(payload.tokenId);
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  static async revokeRefreshToken(tokenId: string): Promise<void> {
    await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.token, tokenId));
  }

  static async revokeAllUserTokens(userId: string): Promise<void> {
    await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.userId, userId));
  }

  static async isTokenBlacklisted(tokenId: string): Promise<boolean> {
    const result = await redis.get(`blacklist:${tokenId}`);
    return result !== null;
  }

  static async blacklistToken(tokenId: string, ttl: number): Promise<void> {
    await redis.setex(`blacklist:${tokenId}`, ttl, 'true');
  }
} 