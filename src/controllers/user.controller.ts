import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service';
import { CreateUserRequest, UpdateUserRequest } from '../schemas/users';

export class UserController {
  static async createUser(request: FastifyRequest, reply: FastifyReply) {
    const userData = request.body as CreateUserRequest;

    try {
      const result = await UserService.createUser(userData);
      return reply.code(201).send(result);
    } catch (error) {
      request.log.error(error);
      const errorMessage = (error as Error).message;
      const statusCode = errorMessage === 'Email já está em uso' ? 400 : 500;
      return reply.code(statusCode).send({ error: errorMessage });
    }
  }

  static async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await UserService.getAllUsers();
      return reply.send(users);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  }

  static async getUserById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    try {
      const user = await UserService.getUserById(id);
      return reply.send(user);
    } catch (error) {
      request.log.error(error);
      const errorMessage = (error as Error).message;
      const statusCode = errorMessage === 'Usuário não encontrado' ? 404 : 500;
      return reply.code(statusCode).send({ error: errorMessage });
    }
  }

  static async updateUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const updateData = request.body as UpdateUserRequest;

    try {
      const result = await UserService.updateUser(id, updateData);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      const errorMessage = (error as Error).message;
      const statusCode = errorMessage === 'Usuário não encontrado' ? 404 : 500;
      return reply.code(statusCode).send({ error: errorMessage });
    }
  }

  static async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    try {
      const result = await UserService.deleteUser(id);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      const errorMessage = (error as Error).message;
      const statusCode = errorMessage === 'Usuário não encontrado' ? 404 : 500;
      return reply.code(statusCode).send({ error: errorMessage });
    }
  }

  static async createUserGroup(request: FastifyRequest, reply: FastifyReply) {
    const groupData = request.body as { name: string; description?: string; accessLevelId: string };

    try {
      const result = await UserService.createUserGroup(groupData);
      return reply.code(201).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  }

  static async getAllUserGroups(request: FastifyRequest, reply: FastifyReply) {
    try {
      const groups = await UserService.getAllUserGroups();
      return reply.send(groups);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  }

  static async getUserGroupById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    try {
      const group = await UserService.getUserGroupById(id);
      return reply.send(group);
    } catch (error) {
      request.log.error(error);
      const errorMessage = (error as Error).message;
      const statusCode = errorMessage === 'Grupo de usuários não encontrado' ? 404 : 500;
      return reply.code(statusCode).send({ error: errorMessage });
    }
  }

  static async updateUserGroup(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const updateData = request.body as { name?: string; description?: string; accessLevelId?: string };

    try {
      const result = await UserService.updateUserGroup(id, updateData);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      const errorMessage = (error as Error).message;
      const statusCode = errorMessage === 'Grupo de usuários não encontrado' ? 404 : 500;
      return reply.code(statusCode).send({ error: errorMessage });
    }
  }

  static async deleteUserGroup(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    try {
      const result = await UserService.deleteUserGroup(id);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      const errorMessage = (error as Error).message;
      const statusCode = errorMessage === 'Grupo de usuários não encontrado' ? 404 : 500;
      return reply.code(statusCode).send({ error: errorMessage });
    }
  }

  static async assignUserToGroup(request: FastifyRequest, reply: FastifyReply) {
    const { userId, groupId } = request.body as { userId: string; groupId: string };

    try {
      const result = await UserService.assignUserToGroup(userId, groupId);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      const errorMessage = (error as Error).message;
      const statusCode = errorMessage === 'Usuário já pertence a este grupo' ? 400 : 500;
      return reply.code(statusCode).send({ error: errorMessage });
    }
  }

  static async removeUserFromGroup(request: FastifyRequest, reply: FastifyReply) {
    const { userId, groupId } = request.body as { userId: string; groupId: string };

    try {
      const result = await UserService.removeUserFromGroup(userId, groupId);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      const errorMessage = (error as Error).message;
      const statusCode = errorMessage === 'Usuário não pertence a este grupo' ? 400 : 500;
      return reply.code(statusCode).send({ error: errorMessage });
    }
  }
} 