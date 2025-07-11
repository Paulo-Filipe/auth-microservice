import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middleware/auth';
import { AuthController } from '../controllers/auth.controller';
import { 
  loginJsonSchema,
  refreshTokenJsonSchema,
  checkPermissionJsonSchema,
  checkPermissionsJsonSchema,
  checkGroupJsonSchema
} from '../schemas/auth';

/* eslint-disable @typescript-eslint/unbound-method */
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
  }, AuthController.login);

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
  }, AuthController.refreshToken);

  fastify.post('/logout', {
    preHandler: authenticateToken,
  }, AuthController.logout);

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
  }, AuthController.checkPermission);

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
  }, AuthController.checkPermissions);

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
  }, AuthController.checkGroup);

  fastify.get('/profile', {
    preHandler: authenticateToken,
  }, AuthController.getProfile);
} 