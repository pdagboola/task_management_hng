const { z } = require("zod");

const taskQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => {
      const num = Number(val);
      if (isNaN(num) || num <= 0)
        throw new Error("Input must be a positive number.");
      return num;
    }),
  status: z
    .optional()
    .default("pending")
    .refine((val) => ["pending", "in-progress", "completed"].includes(val), {
      message:
        "Status can only include 'pending', 'in-progress' or 'completed'",
    }),
  priority: z
    .optional()
    .default("low")
    .refine((val) => ["high", "medium", "low"].includes(val), {
      message: "Priorities can only include 'high', 'medium' or 'low'",
    }),
  tags: z.string().optional(),
});

module.exports = taskQuerySchema;
