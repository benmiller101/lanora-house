import fs from "fs";
import path from "path";

const uploadsBase = path.join(process.cwd(), "public", "uploads");

export async function uploadFile(buffer: Buffer, key: string, _mimeType: string): Promise<string> {
  const filePath = path.join(uploadsBase, key);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/${key}`;
}
