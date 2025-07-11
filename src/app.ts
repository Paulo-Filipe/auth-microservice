import fastify from 'fastify';
import { config } from './config';

export const app = fastify({
  logger: {
    level: config.NODE_ENV === 'production' ? 'warn' : 'info',
  },
});

// Registrar plugins
app.register(import('@fastify/helmet'));
app.register(import('@fastify/cors'), {
  origin: config.NODE_ENV === 'production' ? false : true,
});
app.register(import('@fastify/rate-limit'), {
  max: 100,
  timeWindow: '1 minute',
});
app.register(import('@fastify/swagger'), {
  openapi: {
    info: {
      title: 'Auth Microservice',
      description: 'Microsserviço de autenticação com PASETO',
      version: '1.0.0',
    },
  },
});
app.register(import('@fastify/swagger-ui'), {
  routePrefix: '/docs',
});

// Registrar rotas
app.register(import('./routes/auth'), { prefix: '/auth' });
app.register(import('./routes/users'), { prefix: '/users' });
app.register(import('./routes/access-levels'), { prefix: '/access-levels' });
app.register(import('./routes/health'), { prefix: '/health' }); 