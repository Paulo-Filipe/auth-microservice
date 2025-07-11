import { AuthDAO } from '../data/auth.dao';
import { AuthService } from './auth';
import { PermissionService } from './permissions';
import { LoginRequest, RefreshTokenRequest } from '../schemas/auth';

export class AuthServiceLayer {
  static async login(credentials: LoginRequest) {
    const [user] = await AuthDAO.findUserByEmail(credentials.email);

    if (!user || !user.isActive) {
      throw new Error('Credenciais inválidas');
    }

    const isValidPassword = await AuthService.comparePassword(credentials.password, user.password);
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    const accessToken = await AuthService.generateAccessToken(user.id, user.email, user.name);
    const refreshToken = await AuthService.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(tokenData: RefreshTokenRequest) {
    const payload = await AuthService.verifyRefreshToken(tokenData.refreshToken);
    if (!payload) {
      throw new Error('Token de refresh inválido');
    }

    const [user] = await AuthDAO.findUserById(payload.sub);

    if (!user || !user.isActive) {
      throw new Error('Usuário não encontrado ou inativo');
    }

    await AuthService.revokeRefreshToken(payload.tokenId);

    const newAccessToken = await AuthService.generateAccessToken(user.id, user.email, user.name);
    const newRefreshToken = await AuthService.generateRefreshToken(user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(userId: string) {
    await AuthService.revokeAllUserTokens(userId);
    return { message: 'Logout realizado com sucesso' };
  }

  static async checkPermission(userId: string, permission: string) {
    const hasPermission = await PermissionService.checkPermission(userId, permission);
    return { hasPermission };
  }

  static async checkPermissions(userId: string, permissions: string[]) {
    const hasPermissions = await PermissionService.checkPermissions(userId, permissions);
    return { hasPermissions };
  }

  static async checkGroup(userId: string, groupName: string) {
    const isInGroup = await PermissionService.checkGroup(userId, groupName);
    return { isInGroup };
  }

  static async getUserProfile(userId: string) {
    const [user] = await AuthDAO.findUserById(userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const userPermissions = await PermissionService.getUserPermissions(userId);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      permissions: userPermissions?.permissions || [],
      groups: userPermissions?.groups || [],
    };
  }
} 