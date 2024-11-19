const { z } = require("zod");

const taskUpdateSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).optional(),
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .optional(),
  due_date: z
    .string()
    .refine((val) => !isNaN(new Date(val)), { message: "Invalid due date" })
    .optional(),
  status: z.enum(["pending", "in-progress", "completed"]).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  tags: z
    .array(z.string())
    .min(1, { message: "At least one tag is required" })
    .optional(),
});

module.exports = taskUpdateSchema;
