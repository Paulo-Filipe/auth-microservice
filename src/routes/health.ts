import { FastifyInstance } from 'fastify';
import { HealthController } from '../controllers/health.controller';

/* eslint-disable @typescript-eslint/unbound-method */
export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/', HealthController.checkHealth);

  fastify.get('/ready', HealthController.checkReadiness);

  fastify.get('/live', HealthController.checkLiveness);
} 