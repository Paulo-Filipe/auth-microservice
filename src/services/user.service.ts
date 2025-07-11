import { UserDAO } from '../data/user.dao';
import { AuthService } from './auth';
import { CreateUserRequest, UpdateUserRequest } from '../schemas/users';

export class UserService {
  static async createUser(userData: CreateUserRequest) {
    const existingUser = await UserDAO.findByEmail(userData.email);
    
    if (existingUser.length > 0) {
      throw new Error('Email já está em uso');
    }

    const hashedPassword = await AuthService.hashPassword(userData.password);

    const [newUser] = await UserDAO.create({
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
    });

    if (!newUser) {
      throw new Error('Erro ao criar usuário');
    }

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt.toISOString(),
    };
  }

  static async getAllUsers() {
    return await UserDAO.findAll();
  }

  static async getUserById(id: string) {
    const [user] = await UserDAO.findById(id);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  static async updateUser(id: string, updateData: UpdateUserRequest) {
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== undefined)
    ) as { name?: string; isActive?: boolean };
    
    const [updatedUser] = await UserDAO.update(id, filteredUpdateData);

    if (!updatedUser) {
      throw new Error('Usuário não encontrado');
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      isActive: updatedUser.isActive,
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  }

  static async deleteUser(id: string) {
    const [deletedUser] = await UserDAO.delete(id);

    if (!deletedUser) {
      throw new Error('Usuário não encontrado');
    }

    return { message: 'Usuário deletado com sucesso' };
  }

  static async createUserGroup(groupData: { name: string; description?: string; accessLevelId: string }) {
    const [newGroup] = await UserDAO.createUserGroup({
      name: groupData.name,
      description: groupData.description || null,
      accessLevelId: groupData.accessLevelId,
    });

    if (!newGroup) {
      throw new Error('Erro ao criar grupo de usuários');
    }

    return {
      id: newGroup.id,
      name: newGroup.name,
      description: newGroup.description,
      accessLevelId: newGroup.accessLevelId,
      createdAt: newGroup.createdAt.toISOString(),
    };
  }

  static async getAllUserGroups() {
    return await UserDAO.findUserGroups();
  }

  static async getUserGroupById(id: string) {
    const [group] = await UserDAO.findUserGroupById(id);
    
    if (!group) {
      throw new Error('Grupo de usuários não encontrado');
    }

    return group;
  }

  static async updateUserGroup(id: string, updateData: { name?: string; description?: string; accessLevelId?: string }) {
    const [updatedGroup] = await UserDAO.updateUserGroup(id, {
      ...updateData,
      description: updateData.description || null,
    });

    if (!updatedGroup) {
      throw new Error('Grupo de usuários não encontrado');
    }

    return {
      id: updatedGroup.id,
      name: updatedGroup.name,
      description: updatedGroup.description,
      accessLevelId: updatedGroup.accessLevelId,
      updatedAt: updatedGroup.updatedAt.toISOString(),
    };
  }

  static async deleteUserGroup(id: string) {
    const [deletedGroup] = await UserDAO.deleteUserGroup(id);

    if (!deletedGroup) {
      throw new Error('Grupo de usuários não encontrado');
    }

    return { message: 'Grupo de usuários deletado com sucesso' };
  }

  static async assignUserToGroup(userId: string, groupId: string) {
    const existingMembership = await UserDAO.findUserGroupMembership(userId, groupId);
    
    if (existingMembership.length > 0) {
      throw new Error('Usuário já pertence a este grupo');
    }

    const [membership] = await UserDAO.addUserToGroup(userId, groupId);

    if (!membership) {
      throw new Error('Erro ao adicionar usuário ao grupo');
    }

    return { message: 'Usuário adicionado ao grupo com sucesso' };
  }

  static async removeUserFromGroup(userId: string, groupId: string) {
    const [removedMembership] = await UserDAO.removeUserFromGroup(userId, groupId);

    if (!removedMembership) {
      throw new Error('Usuário não pertence a este grupo');
    }

    return { message: 'Usuário removido do grupo com sucesso' };
  }
} 