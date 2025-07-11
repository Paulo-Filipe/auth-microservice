import { AccessLevelDAO } from '../data/access-level.dao';
import { CreateAccessLevelRequest, UpdateAccessLevelRequest } from '../schemas/access-levels';

export class AccessLevelService {
  static async createAccessLevel(accessLevelData: CreateAccessLevelRequest) {
    const filteredData = Object.fromEntries(
      Object.entries(accessLevelData).filter(([, value]) => value !== undefined)
    ) as { name: string; description?: string; permissions: string[] };
    
    const [newAccessLevel] = await AccessLevelDAO.create(filteredData);

    if (!newAccessLevel) {
      throw new Error('Erro ao criar nível de acesso');
    }

    return {
      id: newAccessLevel.id,
      name: newAccessLevel.name,
      description: newAccessLevel.description,
      permissions: newAccessLevel.permissions,
      createdAt: newAccessLevel.createdAt.toISOString(),
    };
  }

  static async getAllAccessLevels() {
    return await AccessLevelDAO.findAll();
  }

  static async getAccessLevelById(id: string) {
    const [accessLevel] = await AccessLevelDAO.findById(id);
    
    if (!accessLevel) {
      throw new Error('Nível de acesso não encontrado');
    }

    return accessLevel;
  }

  static async updateAccessLevel(id: string, updateData: UpdateAccessLevelRequest) {
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== undefined)
    ) as { name?: string; description?: string; permissions?: string[] };
    
    const [updatedAccessLevel] = await AccessLevelDAO.update(id, filteredUpdateData);

    if (!updatedAccessLevel) {
      throw new Error('Nível de acesso não encontrado');
    }

    return {
      id: updatedAccessLevel.id,
      name: updatedAccessLevel.name,
      description: updatedAccessLevel.description,
      permissions: updatedAccessLevel.permissions,
      updatedAt: updatedAccessLevel.updatedAt.toISOString(),
    };
  }

  static async deleteAccessLevel(id: string) {
    const [deletedAccessLevel] = await AccessLevelDAO.delete(id);

    if (!deletedAccessLevel) {
      throw new Error('Nível de acesso não encontrado');
    }

    return { message: 'Nível de acesso deletado com sucesso' };
  }
} 