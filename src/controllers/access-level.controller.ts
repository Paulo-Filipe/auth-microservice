import { FastifyRequest, FastifyReply } from 'fastify';
import { AccessLevelService } from '../services/access-level.service';
import { CreateAccessLevelRequest, UpdateAccessLevelRequest } from '../schemas/access-levels';

export class AccessLevelController {
  static async createAccessLevel(request: FastifyRequest, reply: FastifyReply) {
    const accessLevelData = request.body as CreateAccessLevelRequest;

    try {
      const result = await AccessLevelService.createAccessLevel(accessLevelData);
      return reply.code(201).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  }

  static async getAllAccessLevels(request: FastifyRequest, reply: FastifyReply) {
    try {
      const accessLevels = await AccessLevelService.getAllAccessLevels();
      return reply.send(accessLevels);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  }

  static async getAccessLevelById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    try {
      const accessLevel = await AccessLevelService.getAccessLevelById(id);
      return reply.send(accessLevel);
    } catch (error) {
      request.log.error(error);
      const errorMessage = (error as Error).message;
      const statusCode = errorMessage === 'Nível de acesso não encontrado' ? 404 : 500;
      return reply.code(statusCode).send({ error: errorMessage });
    }
  }

  static async updateAccessLevel(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const updateData = request.body as UpdateAccessLevelRequest;

    try {
      const result = await AccessLevelService.updateAccessLevel(id, updateData);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      const errorMessage = (error as Error).message;
      const statusCode = errorMessage === 'Nível de acesso não encontrado' ? 404 : 500;
      return reply.code(statusCode).send({ error: errorMessage });
    }
  }

  static async deleteAccessLevel(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    try {
      const result = await AccessLevelService.deleteAccessLevel(id);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      const errorMessage = (error as Error).message;
      const statusCode = errorMessage === 'Nível de acesso não encontrado' ? 404 : 500;
      return reply.code(statusCode).send({ error: errorMessage });
    }
  }
} 