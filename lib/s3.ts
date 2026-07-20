import "server-only";

import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

/**
 * Server-only S3 client module for Railway's S3-compatible bucket.
 * 
 * This module initializes and exports a singleton S3Client configured
 * to connect to Railway's S3-compatible storage service using the
 * environment variables validated in lib/env.ts.
 * 
 * IMPORTANT: This module can ONLY be imported and executed on the server.
 * It will fail if imported into client-side React code.
 */

/**
 * Singleton S3Client instance configured for Railway's S3-compatible bucket.
 * 
 * Configuration:
 * - Endpoint: Railway's S3-compatible endpoint (from AWS_ENDPOINT_URL)
 * - Region: Configured via AWS_DEFAULT_REGION
 * - Credentials: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from Railway
 * 
 * Railway provides an S3-compatible interface that works with the standard
 * AWS SDK by pointing to their custom endpoint URL.
 */
export const s3Client = new S3Client({
  endpoint: env.aws.endpointUrl,
  region: env.aws.region,
  credentials: {
    accessKeyId: env.aws.accessKeyId,
    secretAccessKey: env.aws.secretAccessKey,
  },
});

/**
 * Export the S3 bucket name separately for use in server-side operations.
 * 
 * This is the name of the Railway S3-compatible bucket where images
 * will be stored: "berlin-gallery-images"
 */
export const bucketName = env.bucketName;
