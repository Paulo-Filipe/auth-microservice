import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const loginJsonSchema = zodToJsonSchema(loginSchema, 'loginSchema');

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Token de refresh requerido'),
});

export const checkPermissionSchema = z.object({
  permission: z.string().min(1, 'Permissão requerida'),
});

export const checkPermissionsSchema = z.object({
  permissions: z.array(z.string().min(1)).min(1, 'Pelo menos uma permissão requerida'),
});

export const checkGroupSchema = z.object({
  groupName: z.string().min(1, 'Nome do grupo requerido'),
});

export const refreshTokenJsonSchema = zodToJsonSchema(refreshTokenSchema, 'refreshTokenSchema');
export const checkPermissionJsonSchema = zodToJsonSchema(checkPermissionSchema, 'checkPermissionSchema');
export const checkPermissionsJsonSchema = zodToJsonSchema(checkPermissionsSchema, 'checkPermissionsSchema');
export const checkGroupJsonSchema = zodToJsonSchema(checkGroupSchema, 'checkGroupSchema');

export type LoginRequest = z.infer<typeof loginSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
export type CheckPermissionRequest = z.infer<typeof checkPermissionSchema>;
export type CheckPermissionsRequest = z.infer<typeof checkPermissionsSchema>;
export type CheckGroupRequest = z.infer<typeof checkGroupSchema>; 