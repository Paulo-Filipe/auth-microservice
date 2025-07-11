import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { users, userGroups, userGroupMembers } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthService } from '../services/auth';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { 
  createUserJsonSchema, 
  updateUserJsonSchema, 
  assignUserToGroupJsonSchema, 
  removeUserFromGroupJsonSchema,
  createUserGroupJsonSchema,
  updateUserGroupJsonSchema
} from '../schemas/users';

export default async function usersRoutes(fastify: FastifyInstance) {
  fastify.post('/', {
    preHandler: [authenticateToken, requirePermission('users.create')],
    schema: {
      body: createUserJsonSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password, name } = request.body as { email: string; password: string; name: string };

    try {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return reply.code(400).send({ error: 'Email já está em uso' });
      }

      const hashedPassword = await AuthService.hashPassword(password);

      const [newUser] = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          name,
        })
        .returning();

      if (!newUser) {
        return reply.code(500).send({ error: 'Erro ao criar usuário' });
      }

      return reply.code(201).send({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt.toISOString(),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.get('/', {
    preHandler: [authenticateToken, requirePermission('users.read')],
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const allUsers = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users);

      return reply.send(allUsers);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.get('/:id', {
    preHandler: [authenticateToken, requirePermission('users.read')],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!user) {
        return reply.code(404).send({ error: 'Usuário não encontrado' });
      }

      return reply.send(user);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.put('/:id', {
    preHandler: [authenticateToken, requirePermission('users.update')],
    schema: {
      body: updateUserJsonSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const updateData = request.body as { name?: string; isActive?: boolean };

    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        return reply.code(404).send({ error: 'Usuário não encontrado' });
      }

      return reply.send({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        isActive: updatedUser.isActive,
        updatedAt: updatedUser.updatedAt.toISOString(),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.delete('/:id', {
    preHandler: [authenticateToken, requirePermission('users.delete')],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      const [deletedUser] = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning();

      if (!deletedUser) {
        return reply.code(404).send({ error: 'Usuário não encontrado' });
      }

      return reply.send({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.post('/groups', {
    preHandler: [authenticateToken, requirePermission('groups.create')],
    schema: {
      body: createUserGroupJsonSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, description, accessLevelId } = request.body as { name: string; description?: string; accessLevelId: string };

    try {
      const [newGroup] = await db
        .insert(userGroups)
        .values({
          name,
          description: description || null,
          accessLevelId,
        })
        .returning();

      return reply.code(201).send(newGroup);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.get('/groups', {
    preHandler: [authenticateToken, requirePermission('groups.read')],
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const groups = await db
        .select()
        .from(userGroups);

      return reply.send(groups);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.put('/groups/:id', {
    preHandler: [authenticateToken, requirePermission('groups.update')],
    schema: {
      body: updateUserGroupJsonSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const updateData = request.body as { name?: string; description?: string; accessLevelId?: string };

    try {
      const [updatedGroup] = await db
        .update(userGroups)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(userGroups.id, id))
        .returning();

      if (!updatedGroup) {
        return reply.code(404).send({ error: 'Grupo não encontrado' });
      }

      return reply.send(updatedGroup);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.delete('/groups/:id', {
    preHandler: [authenticateToken, requirePermission('groups.delete')],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      const [deletedGroup] = await db
        .delete(userGroups)
        .where(eq(userGroups.id, id))
        .returning();

      if (!deletedGroup) {
        return reply.code(404).send({ error: 'Grupo não encontrado' });
      }

      return reply.send({ message: 'Grupo deletado com sucesso' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.post('/assign-group', {
    preHandler: [authenticateToken, requirePermission('groups.assign')],
    schema: {
      body: assignUserToGroupJsonSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId, groupId } = request.body as { userId: string; groupId: string };

    try {
      const existingMembership = await db
        .select()
        .from(userGroupMembers)
        .where(
          and(
            eq(userGroupMembers.userId, userId),
            eq(userGroupMembers.groupId, groupId)
          )
        )
        .limit(1);

      if (existingMembership.length > 0) {
        return reply.code(400).send({ error: 'Usuário já pertence ao grupo' });
      }

      const [newMembership] = await db
        .insert(userGroupMembers)
        .values({
          userId,
          groupId,
        })
        .returning();

      return reply.code(201).send(newMembership);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.post('/remove-group', {
    preHandler: [authenticateToken, requirePermission('groups.remove')],
    schema: {
      body: removeUserFromGroupJsonSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId, groupId } = request.body as { userId: string; groupId: string };

    try {
      const [removedMembership] = await db
        .delete(userGroupMembers)
        .where(
          and(
            eq(userGroupMembers.userId, userId),
            eq(userGroupMembers.groupId, groupId)
          )
        )
        .returning();

      if (!removedMembership) {
        return reply.code(404).send({ error: 'Usuário não pertence ao grupo' });
      }

      return reply.send({ message: 'Usuário removido do grupo com sucesso' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.get('/:id/groups', {
    preHandler: [authenticateToken, requirePermission('users.read')],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      const userGroupsData = await db
        .select({
          groupId: userGroups.id,
          groupName: userGroups.name,
          groupDescription: userGroups.description,
          joinedAt: userGroupMembers.createdAt,
        })
        .from(userGroupMembers)
        .innerJoin(userGroups, eq(userGroupMembers.groupId, userGroups.id))
        .where(eq(userGroupMembers.userId, id));

      return reply.send(userGroupsData);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });
} 