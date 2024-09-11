import { GetObjectCommand, GetObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { S3_ACCESS_KEY_ID, S3_BUCKET_NAME, S3_REGION, S3_SECRET_ACCESS_KEY } from "../config.js";

type Directory = "videos" | "samples" | "speeches";

const client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
});

export async function getObject(dir: Directory, key: string): Promise<GetObjectCommandOutput | null> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: `${dir}/${key}`,
  });

  try {
    const document = await client.send(command);

    if (!document) {
      throw new Error();
    }

    return document;
  } catch {
    return null;
  }
}

export async function uploadObject(buffer: Buffer, key: string, contentType: string) {
  const upload = new Upload({
    client,
    params: {
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    },
    queueSize: 4,
    partSize: 5 * 1024 * 1024,
  });

  await upload.done();
}
