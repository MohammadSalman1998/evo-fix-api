// src\utils\uploadImage.ts
import cloudinary from "../configs/cloudinary";
import { Readable } from "stream";

export async function uploadImage(file: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "EvoFix-Requests-Images" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      }
    );

    const readableStream = new Readable();
    readableStream.push(file);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
}
