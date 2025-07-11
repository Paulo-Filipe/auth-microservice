import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(1, 'Nome requerido'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Nome requerido').optional(),
  isActive: z.boolean().optional(),
});

export const assignUserToGroupSchema = z.object({
  userId: z.string().uuid('ID do usuário inválido'),
  groupId: z.string().uuid('ID do grupo inválido'),
});

export const removeUserFromGroupSchema = z.object({
  userId: z.string().uuid('ID do usuário inválido'),
  groupId: z.string().uuid('ID do grupo inválido'),
});

export const createUserGroupSchema = z.object({
  name: z.string().min(1, 'Nome do grupo requerido'),
  description: z.string().optional(),
  accessLevelId: z.string().uuid('ID do nível de acesso inválido'),
});

export const updateUserGroupSchema = z.object({
  name: z.string().min(1, 'Nome do grupo requerido').optional(),
  description: z.string().optional(),
  accessLevelId: z.string().uuid('ID do nível de acesso inválido').optional(),
});

export const createUserJsonSchema = zodToJsonSchema(createUserSchema, 'createUserSchema');
export const updateUserJsonSchema = zodToJsonSchema(updateUserSchema, 'updateUserSchema');
export const assignUserToGroupJsonSchema = zodToJsonSchema(assignUserToGroupSchema, 'assignUserToGroupSchema');
export const removeUserFromGroupJsonSchema = zodToJsonSchema(removeUserFromGroupSchema, 'removeUserFromGroupSchema');
export const createUserGroupJsonSchema = zodToJsonSchema(createUserGroupSchema, 'createUserGroupSchema');
export const updateUserGroupJsonSchema = zodToJsonSchema(updateUserGroupSchema, 'updateUserGroupSchema');

export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
export type AssignUserToGroupRequest = z.infer<typeof assignUserToGroupSchema>;
export type RemoveUserFromGroupRequest = z.infer<typeof removeUserFromGroupSchema>;
export type CreateUserGroupRequest = z.infer<typeof createUserGroupSchema>;
export type UpdateUserGroupRequest = z.infer<typeof updateUserGroupSchema>; 