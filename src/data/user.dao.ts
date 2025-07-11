import { db } from '../db';
import { users, userGroups, userGroupMembers } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export class UserDAO {
  static async findByEmail(email: string) {
    return db.select().from(users).where(eq(users.email, email)).limit(1);
  }

  static async findById(id: string) {
    return db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).where(eq(users.id, id)).limit(1);
  }

  static async findAll() {
    return db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users);
  }

  static async create(userData: { email: string; password: string; name: string }) {
    return db.insert(users).values(userData).returning();
  }

  static async update(id: string, updateData: { name?: string; isActive?: boolean }) {
    return db.update(users).set({
      ...updateData,
      updatedAt: new Date(),
    }).where(eq(users.id, id)).returning();
  }

  static async delete(id: string) {
    return db.delete(users).where(eq(users.id, id)).returning();
  }

  static async findUserGroups() {
    return db.select().from(userGroups);
  }

  static async findUserGroupById(id: string) {
    return db.select().from(userGroups).where(eq(userGroups.id, id)).limit(1);
  }

  static async createUserGroup(groupData: { name: string; description?: string | null; accessLevelId: string }) {
    return db.insert(userGroups).values(groupData).returning();
  }

  static async updateUserGroup(id: string, updateData: { name?: string; description?: string | null; accessLevelId?: string }) {
    return db.update(userGroups).set({
      ...updateData,
      updatedAt: new Date(),
    }).where(eq(userGroups.id, id)).returning();
  }

  static async deleteUserGroup(id: string) {
    return db.delete(userGroups).where(eq(userGroups.id, id)).returning();
  }

  static async addUserToGroup(userId: string, groupId: string) {
    return db.insert(userGroupMembers).values({
      userId,
      groupId,
    }).returning();
  }

  static async removeUserFromGroup(userId: string, groupId: string) {
    return db.delete(userGroupMembers).where(
      and(
        eq(userGroupMembers.userId, userId),
        eq(userGroupMembers.groupId, groupId)
      )
    ).returning();
  }

  static async findUserGroupMembership(userId: string, groupId: string) {
    return db.select().from(userGroupMembers).where(
      and(
        eq(userGroupMembers.userId, userId),
        eq(userGroupMembers.groupId, groupId)
      )
    ).limit(1);
  }
} 