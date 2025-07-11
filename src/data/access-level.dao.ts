import { db } from '../db';
import { accessLevels } from '../db/schema';
import { eq } from 'drizzle-orm';

export class AccessLevelDAO {
  static async findAll() {
    return db.select().from(accessLevels);
  }

  static async findById(id: string) {
    return db.select().from(accessLevels).where(eq(accessLevels.id, id)).limit(1);
  }

  static async create(accessLevelData: { name: string; description?: string; permissions: string[] }) {
    return db.insert(accessLevels).values(accessLevelData).returning();
  }

  static async update(id: string, updateData: { name?: string; description?: string; permissions?: string[] }) {
    return db.update(accessLevels).set({
      ...updateData,
      updatedAt: new Date(),
    }).where(eq(accessLevels.id, id)).returning();
  }

  static async delete(id: string) {
    return db.delete(accessLevels).where(eq(accessLevels.id, id)).returning();
  }
} 