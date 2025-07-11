import { FastifyInstance } from 'fastify';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { UserController } from '../controllers/user.controller';
import { 
  createUserJsonSchema, 
  updateUserJsonSchema, 
  assignUserToGroupJsonSchema, 
  removeUserFromGroupJsonSchema,
  createUserGroupJsonSchema,
  updateUserGroupJsonSchema
} from '../schemas/users';

/* eslint-disable @typescript-eslint/unbound-method */
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
  }, UserController.createUser);

  fastify.get('/', {
    preHandler: [authenticateToken, requirePermission('users.read')],
  }, UserController.getAllUsers);

  fastify.get('/:id', {
    preHandler: [authenticateToken, requirePermission('users.read')],
  }, UserController.getUserById);

  fastify.put('/:id', {
    preHandler: [authenticateToken, requirePermission('users.update')],
    schema: {
      body: updateUserJsonSchema,
    },
  }, UserController.updateUser);

  fastify.delete('/:id', {
    preHandler: [authenticateToken, requirePermission('users.delete')],
  }, UserController.deleteUser);

  fastify.post('/groups', {
    preHandler: [authenticateToken, requirePermission('groups.create')],
    schema: {
      body: createUserGroupJsonSchema,
    },
  }, UserController.createUserGroup);

  fastify.get('/groups', {
    preHandler: [authenticateToken, requirePermission('groups.read')],
  }, UserController.getAllUserGroups);

  fastify.get('/groups/:id', {
    preHandler: [authenticateToken, requirePermission('groups.read')],
  }, UserController.getUserGroupById);

  fastify.put('/groups/:id', {
    preHandler: [authenticateToken, requirePermission('groups.update')],
    schema: {
      body: updateUserGroupJsonSchema,
    },
  }, UserController.updateUserGroup);

  fastify.delete('/groups/:id', {
    preHandler: [authenticateToken, requirePermission('groups.delete')],
  }, UserController.deleteUserGroup);

  fastify.post('/assign-group', {
    preHandler: [authenticateToken, requirePermission('groups.assign')],
    schema: {
      body: assignUserToGroupJsonSchema,
    },
  }, UserController.assignUserToGroup);

  fastify.delete('/remove-group', {
    preHandler: [authenticateToken, requirePermission('groups.remove')],
    schema: {
      body: removeUserFromGroupJsonSchema,
    },
  }, UserController.removeUserFromGroup);
} 