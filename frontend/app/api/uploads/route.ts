import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const BASE_UPLOAD_DIR = path.resolve(
  process.env.ROOT_PATH ?? "",
  "public/uploads",
);

export const GET = async () => {
  try {
    if (!fs.existsSync(BASE_UPLOAD_DIR)) {
      return NextResponse.json({
        success: true,
        files: [],
      });
    }

    const files: Array<{
      name: string;
      size: number;
      uploadedAt: string;
      type: string;
    }> = [];

    // Check for car and track subdirectories
    const types = ["car", "track"];
    for (const type of types) {
      const typeDir = path.resolve(BASE_UPLOAD_DIR, type);
      if (fs.existsSync(typeDir)) {
        const fileNames = fs.readdirSync(typeDir);
        fileNames.forEach((fileName) => {
          const filePath = path.resolve(typeDir, fileName);
          const stats = fs.statSync(filePath);
          files.push({
            name: fileName,
            size: stats.size,
            uploadedAt: stats.mtime.toISOString(),
            type: type,
          });
        });
      }
    }

    // Also check root directory for backwards compatibility
    const rootFiles = fs.readdirSync(BASE_UPLOAD_DIR);
    for (const fileName of rootFiles) {
      const filePath = path.resolve(BASE_UPLOAD_DIR, fileName);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        files.push({
          name: fileName,
          size: stats.size,
          uploadedAt: stats.mtime.toISOString(),
          type: "unknown",
        });
      }
    }

    return NextResponse.json({
      success: true,
      files: files.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      ),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list files",
      },
      { status: 500 },
    );
  }
};
