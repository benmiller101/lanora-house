import { db } from "../db";
import { imageBlobs } from "../../shared/schema";
import { eq } from "drizzle-orm";

export async function uploadFile(buffer: Buffer, key: string, mimeType: string): Promise<string> {
  const base64 = buffer.toString("base64");
  await db
    .insert(imageBlobs)
    .values({ key, data: base64, mimeType })
    .onConflictDoUpdate({ target: imageBlobs.key, set: { data: base64, mimeType } });
  return `/api/image/${key}`;
}

export async function getImageBlob(key: string): Promise<{ data: Buffer; mimeType: string } | null> {
  const [blob] = await db.select().from(imageBlobs).where(eq(imageBlobs.key, key)).limit(1);
  if (!blob) return null;
  return { data: Buffer.from(blob.data, "base64"), mimeType: blob.mimeType };
}
