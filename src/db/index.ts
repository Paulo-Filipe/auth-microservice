import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { config } from '../config';
import * as schema from './schema';

const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export const redis = new Redis(config.REDIS_URL);

redis.on('connect', () => {
  console.log('Conectado ao Redis');
});

redis.on('error', (error: Error) => {
  console.error('Erro na conexão com Redis:', error);
});

export const closeConnections = async () => {
  await pool.end();
  redis.disconnect();
}; 