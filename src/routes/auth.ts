import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AuthService } from '../services/auth';
import { PermissionService } from '../services/permissions';
import { authenticateToken } from '../middleware/auth';
import { 
  loginJsonSchema,
  refreshTokenJsonSchema,
  checkPermissionJsonSchema,
  checkPermissionsJsonSchema,
  checkGroupJsonSchema
} from '../schemas/auth';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/login', {
    schema: {
      body: loginJsonSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
              },
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = request.body as { email: string; password: string };

    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user || !user.isActive) {
        return reply.code(401).send({ error: 'Credenciais inválidas' });
      }

      const isValidPassword = await AuthService.comparePassword(password, user.password);
      if (!isValidPassword) {
        return reply.code(401).send({ error: 'Credenciais inválidas' });
      }

      const accessToken = await AuthService.generateAccessToken(user.id, user.email, user.name);
      const refreshToken = await AuthService.generateRefreshToken(user.id);

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.post('/refresh', {
    schema: {
      body: refreshTokenJsonSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { refreshToken } = request.body as { refreshToken: string };

    try {
      const payload = await AuthService.verifyRefreshToken(refreshToken);
      if (!payload) {
        return reply.code(401).send({ error: 'Token de refresh inválido' });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.sub))
        .limit(1);

      if (!user || !user.isActive) {
        return reply.code(401).send({ error: 'Usuário não encontrado ou inativo' });
      }

      await AuthService.revokeRefreshToken(payload.tokenId);

      const newAccessToken = await AuthService.generateAccessToken(user.id, user.email, user.name);
      const newRefreshToken = await AuthService.generateRefreshToken(user.id);

      return reply.send({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.post('/logout', {
    preHandler: authenticateToken,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (request.user) {
        await AuthService.revokeAllUserTokens(request.user.sub);
      }
      return reply.send({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.post('/check-permission', {
    preHandler: authenticateToken,
    schema: {
      body: checkPermissionJsonSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            hasPermission: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { permission } = request.body as { permission: string };

    try {
      const hasPermission = await PermissionService.checkPermission(
        request.user!.sub,
        permission
      );

      return reply.send({ hasPermission });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.post('/check-permissions', {
    preHandler: authenticateToken,
    schema: {
      body: checkPermissionsJsonSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            hasPermissions: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { permissions } = request.body as { permissions: string[] };

    try {
      const hasPermissions = await PermissionService.checkPermissions(
        request.user!.sub,
        permissions
      );

      return reply.send({ hasPermissions });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.post('/check-group', {
    preHandler: authenticateToken,
    schema: {
      body: checkGroupJsonSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            isInGroup: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { groupName } = request.body as { groupName: string };

    try {
      const isInGroup = await PermissionService.checkGroup(
        request.user!.sub,
        groupName
      );

      return reply.send({ isInGroup });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.get('/profile', {
    preHandler: authenticateToken,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userPermissions = await PermissionService.getUserPermissions(request.user!.sub);
      
      return reply.send({
        user: request.user,
        permissions: userPermissions?.permissions || [],
        groups: userPermissions?.groups || [],
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });
} 