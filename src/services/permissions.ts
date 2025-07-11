import { db } from '../db';
import { users, userGroupMembers, userGroups, accessLevels } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface UserPermissions {
  userId: string;
  permissions: string[];
  groups: string[];
}

export class PermissionService {
  static async getUserPermissions(userId: string): Promise<UserPermissions | null> {
    const userWithPermissions = await db
      .select({
        userId: users.id,
        groupName: userGroups.name,
        permissions: accessLevels.permissions,
      })
      .from(users)
      .leftJoin(userGroupMembers, eq(users.id, userGroupMembers.userId))
      .leftJoin(userGroups, eq(userGroupMembers.groupId, userGroups.id))
      .leftJoin(accessLevels, eq(userGroups.accessLevelId, accessLevels.id))
      .where(eq(users.id, userId));

    if (userWithPermissions.length === 0) {
      return null;
    }

    const allPermissions = new Set<string>();
    const groups = new Set<string>();

    for (const row of userWithPermissions) {
      if (row.groupName) {
        groups.add(row.groupName);
      }
      if (row.permissions) {
        row.permissions.forEach(permission => allPermissions.add(permission));
      }
    }

    return {
      userId,
      permissions: Array.from(allPermissions),
      groups: Array.from(groups),
    };
  }

  static async checkPermission(userId: string, permission: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    
    if (!userPermissions) {
      return false;
    }

    return userPermissions.permissions.includes(permission);
  }

  static async checkPermissions(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    
    if (!userPermissions) {
      return false;
    }

    return permissions.every(permission => 
      userPermissions.permissions.includes(permission)
    );
  }

  static async checkAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    
    if (!userPermissions) {
      return false;
    }

    return permissions.some(permission => 
      userPermissions.permissions.includes(permission)
    );
  }

  static async checkGroup(userId: string, groupName: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    
    if (!userPermissions) {
      return false;
    }

    return userPermissions.groups.includes(groupName);
  }
} 