const { z } = require("zod");

const userLoginSchema = z.object({
  username: z
    .string()
    .min(8, { message: "Username should be a minimum of 8 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(128, { message: "Password can only be a maximum of 128 characters" }),
});

module.exports = userLoginSchema;
