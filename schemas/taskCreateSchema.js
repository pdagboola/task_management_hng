const { z } = require("zod");

const taskCreateSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  due_date: z
    .string()
    .refine((val) => !isNaN(new Date(val)), { message: "Invalid due date" }),
  status: z.enum(["pending", "in-progress", "completed"]).default("pending"),
  priority: z.enum(["high", "medium", "low"]).default("low"),
  tags: z.array(z.string()).min(1, { message: "At least one tag is required" }),
});

module.exports = taskCreateSchema;
