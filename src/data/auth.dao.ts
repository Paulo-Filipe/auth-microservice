import { db } from '../db';
import { users, refreshTokens } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export class AuthDAO {
  static async findUserByEmail(email: string) {
    return db.select().from(users).where(eq(users.email, email)).limit(1);
  }

  static async findUserById(id: string) {
    return db.select().from(users).where(eq(users.id, id)).limit(1);
  }

  static async storeRefreshToken(tokenData: { 
    id: string; 
    userId: string; 
    token: string; 
    expiresAt: Date; 
  }) {
    return db.insert(refreshTokens).values(tokenData).returning();
  }

  static async findRefreshToken(tokenId: string) {
    return db.select().from(refreshTokens).where(eq(refreshTokens.id, tokenId)).limit(1);
  }

  static async deleteRefreshToken(tokenId: string) {
    return db.delete(refreshTokens).where(eq(refreshTokens.id, tokenId)).returning();
  }

  static async deleteAllUserTokens(userId: string) {
    return db.delete(refreshTokens).where(eq(refreshTokens.userId, userId)).returning();
  }

  static async findValidRefreshToken(tokenId: string, userId: string) {
    return db.select().from(refreshTokens).where(
      and(
        eq(refreshTokens.id, tokenId),
        eq(refreshTokens.userId, userId)
      )
    ).limit(1);
  }
} 