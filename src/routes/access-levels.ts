import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { accessLevels } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { createAccessLevelJsonSchema, updateAccessLevelJsonSchema } from '../schemas/access-levels';

export default async function accessLevelsRoutes(fastify: FastifyInstance) {
  fastify.post('/', {
    preHandler: [authenticateToken, requirePermission('access-levels.create')],
    schema: {
      body: createAccessLevelJsonSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            permissions: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, description, permissions } = request.body as { name: string; description?: string; permissions: string[] };

    try {
      const existingLevel = await db
        .select()
        .from(accessLevels)
        .where(eq(accessLevels.name, name))
        .limit(1);

      if (existingLevel.length > 0) {
        return reply.code(400).send({ error: 'Nível de acesso já existe' });
      }

      const [newAccessLevel] = await db
        .insert(accessLevels)
        .values({
          name,
          description: description || null,
          permissions,
        })
        .returning();

      if (!newAccessLevel) {
        return reply.code(500).send({ error: 'Erro ao criar nível de acesso' });
      }

      return reply.code(201).send({
        id: newAccessLevel.id,
        name: newAccessLevel.name,
        description: newAccessLevel.description,
        permissions: newAccessLevel.permissions,
        createdAt: newAccessLevel.createdAt.toISOString(),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.get('/', {
    preHandler: [authenticateToken, requirePermission('access-levels.read')],
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const allAccessLevels = await db
        .select()
        .from(accessLevels);

      return reply.send(allAccessLevels);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.get('/:id', {
    preHandler: [authenticateToken, requirePermission('access-levels.read')],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      const [accessLevel] = await db
        .select()
        .from(accessLevels)
        .where(eq(accessLevels.id, id))
        .limit(1);

      if (!accessLevel) {
        return reply.code(404).send({ error: 'Nível de acesso não encontrado' });
      }

      return reply.send(accessLevel);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.put('/:id', {
    preHandler: [authenticateToken, requirePermission('access-levels.update')],
    schema: {
      body: updateAccessLevelJsonSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const updateData = request.body as { name?: string; description?: string; permissions?: string[] };

    try {
      const [updatedAccessLevel] = await db
        .update(accessLevels)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(accessLevels.id, id))
        .returning();

      if (!updatedAccessLevel) {
        return reply.code(404).send({ error: 'Nível de acesso não encontrado' });
      }

      return reply.send(updatedAccessLevel);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });

  fastify.delete('/:id', {
    preHandler: [authenticateToken, requirePermission('access-levels.delete')],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      const [deletedAccessLevel] = await db
        .delete(accessLevels)
        .where(eq(accessLevels.id, id))
        .returning();

      if (!deletedAccessLevel) {
        return reply.code(404).send({ error: 'Nível de acesso não encontrado' });
      }

      return reply.send({ message: 'Nível de acesso deletado com sucesso' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });
} 