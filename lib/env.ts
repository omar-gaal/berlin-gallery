import "server-only";

import { z } from "zod";

/**
 * Server-only environment variable validation module.
 * 
 * This module validates all required AWS/S3 environment variables at runtime.
 * It uses Zod to ensure type safety and prevent runtime errors.
 * 
 * IMPORTANT: This module can ONLY be imported and executed on the server.
 * It will fail if imported into client-side React code.
 */

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  AWS_ENDPOINT_URL: z.string().url("AWS_ENDPOINT_URL must be a valid URL"),
  AWS_S3_BUCKET_NAME: z.string().min(1, "AWS_S3_BUCKET_NAME is required"),
  AWS_DEFAULT_REGION: z.string().min(1, "AWS_DEFAULT_REGION is required"),
  AWS_ACCESS_KEY_ID: z.string().min(1, "AWS_ACCESS_KEY_ID is required"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, "AWS_SECRET_ACCESS_KEY is required"),
});

type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns the validated config.
 * Throws a detailed error if any required variables are missing or invalid.
 */
function validateEnv(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages?.join(", ")}`)
      .join("\n");

    throw new Error(
      `Invalid or missing environment variables:\n${errorMessages}\n\n` +
        `Please ensure all required AWS variables are set in your .env file.`
    );
  }

  return parsed.data;
}

// Validate on module load to fail fast
const config = validateEnv();

export const env = {
  databaseUrl: config.DATABASE_URL,
  aws: {
    endpointUrl: config.AWS_ENDPOINT_URL,
    region: config.AWS_DEFAULT_REGION,
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
  bucketName: config.AWS_S3_BUCKET_NAME,
};
