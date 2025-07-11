import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().default('postgresql://user:password@localhost:5432/auth_db'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  PASETO_SECRET: z.string().min(32),
  PASETO_ISSUER: z.string().default('auth-microservice'),
  ACCESS_TOKEN_TTL: z.coerce.number().default(900),
  REFRESH_TOKEN_TTL: z.coerce.number().default(604800),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('Erro na configuração do ambiente:', error);
    process.exit(1);
  }
};

export const config = parseEnv(); 