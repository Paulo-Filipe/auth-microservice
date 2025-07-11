import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const createAccessLevelSchema = z.object({
  name: z.string().min(1, 'Nome requerido'),
  description: z.string().optional(),
  permissions: z.array(z.string().min(1)).min(1, 'Pelo menos uma permissão requerida'),
});

export const updateAccessLevelSchema = z.object({
  name: z.string().min(1, 'Nome requerido').optional(),
  description: z.string().optional(),
  permissions: z.array(z.string().min(1)).min(1, 'Pelo menos uma permissão requerida').optional(),
});

export const createAccessLevelJsonSchema = zodToJsonSchema(createAccessLevelSchema, 'createAccessLevelSchema');
export const updateAccessLevelJsonSchema = zodToJsonSchema(updateAccessLevelSchema, 'updateAccessLevelSchema');

export type CreateAccessLevelRequest = z.infer<typeof createAccessLevelSchema>;
export type UpdateAccessLevelRequest = z.infer<typeof updateAccessLevelSchema>; 