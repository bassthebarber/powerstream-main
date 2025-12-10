// backend/src/api/middleware/validate.middleware.js
// Request validation using Zod schemas
import { z } from "zod";
import { ApiError } from "../../utils/errors.js";
import { logger } from "../../config/logger.js";

/**
 * Validation middleware factory
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {string} source - Where to validate: 'body', 'query', 'params', or 'all'
 */
export const validate = (schema, source = "body") => {
  return async (req, res, next) => {
    try {
      let dataToValidate;
      
      switch (source) {
        case "body":
          dataToValidate = req.body;
          break;
        case "query":
          dataToValidate = req.query;
          break;
        case "params":
          dataToValidate = req.params;
          break;
        case "all":
          dataToValidate = {
            body: req.body,
            query: req.query,
            params: req.params,
          };
          break;
        default:
          dataToValidate = req.body;
      }
      
      const validated = await schema.parseAsync(dataToValidate);
      
      // Replace with validated data
      if (source === "all") {
        req.body = validated.body || req.body;
        req.query = validated.query || req.query;
        req.params = validated.params || req.params;
      } else {
        req[source] = validated;
      }
      
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.errors.map(e => ({
          field: e.path.join("."),
          message: e.message,
        }));
        
        logger.warn("Validation failed:", errors);
        
        return next(new ApiError(400, "Validation failed", errors));
      }
      next(err);
    }
  };
};

// ============================================================
// COMMON VALIDATION SCHEMAS
// ============================================================

/**
 * MongoDB ObjectId validation
 */
export const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ID format");

/**
 * Email validation
 */
export const emailSchema = z.string().email("Invalid email format").toLowerCase().trim();

/**
 * Password validation
 */
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password too long");

/**
 * Pagination query params
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Search query params
 */
export const searchSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  ...paginationSchema.shape,
});

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().optional(),
}).refine(data => {
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: passwordSchema,
});

// ============================================================
// USER SCHEMAS
// ============================================================

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
});

export const userIdParamsSchema = z.object({
  userId: objectIdSchema,
});

// ============================================================
// POST SCHEMAS
// ============================================================

export const createPostSchema = z.object({
  content: z.string().min(1, "Content is required").max(5000),
  mediaUrls: z.array(z.string().url()).max(10).optional(),
  hashtags: z.array(z.string()).max(30).optional(),
  mentions: z.array(objectIdSchema).max(50).optional(),
});

export const postIdParamsSchema = z.object({
  postId: objectIdSchema,
});

// ============================================================
// COMMENT SCHEMAS
// ============================================================

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: objectIdSchema.optional(),
});

// ============================================================
// ID PARAMS SCHEMA
// ============================================================

export const idParamsSchema = z.object({
  id: objectIdSchema,
});

export default {
  validate,
  objectIdSchema,
  emailSchema,
  passwordSchema,
  paginationSchema,
  searchSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
  userIdParamsSchema,
  createPostSchema,
  postIdParamsSchema,
  createCommentSchema,
  idParamsSchema,
};




