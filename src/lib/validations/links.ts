import { z } from "zod";

export const createLinkSchema = z.object({
  originalUrl: z.string().url(),
  customAlias: z.string().min(3).max(30).optional(),
});