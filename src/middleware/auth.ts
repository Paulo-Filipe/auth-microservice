import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService, TokenPayload } from '../services/auth';
import { PermissionService } from '../services/permissions';

declare module 'fastify' {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

export const authenticateToken = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({ error: 'Token de acesso requerido' });
    return;
  }

  const token = authHeader.substring(7);
  const payload = await AuthService.verifyAccessToken(token);

  if (!payload) {
    reply.code(401).send({ error: 'Token inválido' });
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    reply.code(401).send({ error: 'Token expirado' });
    return;
  }

  request.user = payload;
};

export const requirePermission = (permission: string) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      reply.code(401).send({ error: 'Usuário não autenticado' });
      return;
    }

    const hasPermission = await PermissionService.checkPermission(
      request.user.sub,
      permission
    );

    if (!hasPermission) {
      reply.code(403).send({ error: 'Permissão insuficiente' });
      return;
    }
  };
};

export const requirePermissions = (permissions: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      reply.code(401).send({ error: 'Usuário não autenticado' });
      return;
    }

    const hasPermissions = await PermissionService.checkPermissions(
      request.user.sub,
      permissions
    );

    if (!hasPermissions) {
      reply.code(403).send({ error: 'Permissões insuficientes' });
      return;
    }
  };
};

export const requireAnyPermission = (permissions: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      reply.code(401).send({ error: 'Usuário não autenticado' });
      return;
    }

    const hasAnyPermission = await PermissionService.checkAnyPermission(
      request.user.sub,
      permissions
    );

    if (!hasAnyPermission) {
      reply.code(403).send({ error: 'Nenhuma permissão necessária encontrada' });
      return;
    }
  };
};

export const requireGroup = (groupName: string) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      reply.code(401).send({ error: 'Usuário não autenticado' });
      return;
    }

    const isInGroup = await PermissionService.checkGroup(
      request.user.sub,
      groupName
    );

    if (!isInGroup) {
      reply.code(403).send({ error: 'Acesso negado para este grupo' });
      return;
    }
  };
}; 