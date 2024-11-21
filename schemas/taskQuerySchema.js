const { z } = require("zod");
const { CustomError } = require("../utils/helpers");

const taskQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => {
      const num = Number(val);
      if (isNaN(num) || num <= 0)
        throw new CustomError(400, "Page must be a positive number.");
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
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") {
        return 10;
      }
      const num = Number(val);
      if (isNaN(num) || num <= 0) {
        throw new CustomError(400, "The limit must be a positive number");
      }
      return num < 10 ? num : 10;
    })
    .refine((val) => typeof val === "number" && val > 0, {
      message: "The input is not a positive number",
    }),
});

module.exports = taskQuerySchema;
