import { FastifyInstance } from 'fastify';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { AccessLevelController } from '../controllers/access-level.controller';
import { createAccessLevelJsonSchema, updateAccessLevelJsonSchema } from '../schemas/access-levels';

/* eslint-disable @typescript-eslint/unbound-method */
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
  }, AccessLevelController.createAccessLevel);

  fastify.get('/', {
    preHandler: [authenticateToken, requirePermission('access-levels.read')],
  }, AccessLevelController.getAllAccessLevels);

  fastify.get('/:id', {
    preHandler: [authenticateToken, requirePermission('access-levels.read')],
  }, AccessLevelController.getAccessLevelById);

  fastify.put('/:id', {
    preHandler: [authenticateToken, requirePermission('access-levels.update')],
    schema: {
      body: updateAccessLevelJsonSchema,
    },
  }, AccessLevelController.updateAccessLevel);

  fastify.delete('/:id', {
    preHandler: [authenticateToken, requirePermission('access-levels.delete')],
  }, AccessLevelController.deleteAccessLevel);
} 