import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db, redis } from '../db';
import { config } from '../config';
import { sql } from 'drizzle-orm';

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const dbCheck = await db.execute(sql`SELECT 1`);
      const redisCheck = await redis.ping();
      
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV,
        checks: {
          database: dbCheck ? 'ok' : 'error',
          redis: redisCheck === 'PONG' ? 'ok' : 'error',
        },
      };

      return reply.send(health);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV,
        error: 'Service unavailable',
      });
    }
  });

  fastify.get('/ready', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      await db.execute(sql`SELECT 1`);
      await redis.ping();
      
      return reply.send({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(503).send({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: 'Service not ready',
      });
    }
  });

  fastify.get('/live', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  });
} 