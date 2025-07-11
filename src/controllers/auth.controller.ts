import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthServiceLayer } from '../services/auth.service';
import { LoginRequest, RefreshTokenRequest } from '../schemas/auth';

export class AuthController {
  static async login(request: FastifyRequest, reply: FastifyReply) {
    const credentials = request.body as LoginRequest;

    try {
      const result = await AuthServiceLayer.login(credentials);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(401).send({ error: (error as Error).message });
    }
  }

  static async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    const tokenData = request.body as RefreshTokenRequest;

    try {
      const result = await AuthServiceLayer.refreshToken(tokenData);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(401).send({ error: (error as Error).message });
    }
  }

  static async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (request.user) {
        const result = await AuthServiceLayer.logout(request.user.sub);
        return reply.send(result);
      }
      return reply.send({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  }

  static async checkPermission(request: FastifyRequest, reply: FastifyReply) {
    const { permission } = request.body as { permission: string };

    try {
      const result = await AuthServiceLayer.checkPermission(request.user!.sub, permission);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  }

  static async checkPermissions(request: FastifyRequest, reply: FastifyReply) {
    const { permissions } = request.body as { permissions: string[] };

    try {
      const result = await AuthServiceLayer.checkPermissions(request.user!.sub, permissions);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  }

  static async checkGroup(request: FastifyRequest, reply: FastifyReply) {
    const { groupName } = request.body as { groupName: string };

    try {
      const result = await AuthServiceLayer.checkGroup(request.user!.sub, groupName);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  }

  static async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await AuthServiceLayer.getUserProfile(request.user!.sub);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  }
} 