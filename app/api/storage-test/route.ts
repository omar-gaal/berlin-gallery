import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { bucketName, s3Client } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1,
    });

    const response = await s3Client.send(command);

    return NextResponse.json({
      connected: true,
      bucket: bucketName,
      objectCount: response.Contents?.length ?? 0,
    });
  } catch {
    return NextResponse.json(
      {
        connected: false,
        error: "Unable to reach the configured S3 bucket.",
      },
      { status: 502 }
    );
  }
}
