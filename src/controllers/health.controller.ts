import { FastifyRequest, FastifyReply } from 'fastify';
import { db, redis } from '../db';
import { sql } from 'drizzle-orm';

export class HealthController {
  static async checkHealth(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.send({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'auth-microservice'
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  }

  static async checkReadiness(request: FastifyRequest, reply: FastifyReply) {
    try {
      await db.execute(sql`SELECT 1`);
      await redis.ping();
      
      return reply.send({ 
        status: 'ready', 
        timestamp: new Date().toISOString(),
        services: {
          database: 'ok',
          redis: 'ok'
        }
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(503).send({ 
        status: 'not ready', 
        timestamp: new Date().toISOString(),
        error: 'Serviços não disponíveis'
      });
    }
  }

  static async checkLiveness(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.send({ 
        status: 'alive', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  }
} 