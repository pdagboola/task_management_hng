const { z } = require("zod");

const taskQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => {
      const num = Number(val);
      if (isNaN(num) || num <= 0)
        throw new Error("Page must be a positive number.");
      return num;
    }),
  status: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .refine(
      (val) =>
        val === undefined ||
        val === null ||
        ["pending", "in-progress", "completed"].includes(val),
      {
        message:
          "Status can only include 'pending', 'in-progress' or 'completed'",
      }
    ),
  priority: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .refine(
      (val) =>
        val === undefined ||
        val === null ||
        ["high", "medium", "low"].includes(val),
      {
        message: "Priorities can only include 'high', 'medium' or 'low'",
      }
    ),
  tags: z
    .string()
    .optional()
    .transform((val) => {
      return val ? val.split(",").map((tag) => tag.trim()) : [];
    }),
});

module.exports = taskQuerySchema;
