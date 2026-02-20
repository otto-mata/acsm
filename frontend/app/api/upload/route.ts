import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const BASE_UPLOAD_DIR = path.resolve(
  process.env.ROOT_PATH ?? "",
  "public/uploads",
);

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const files = formData.getAll("file") as File[];
  const types = formData.getAll("type") as string[];

  if (!files || files.length === 0) {
    return NextResponse.json({
      success: false,
      error: "No files provided",
    });
  }

  try {
    let uploadedCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = types[i] || "car";
      const UPLOAD_DIR = path.resolve(BASE_UPLOAD_DIR, fileType);

      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(path.resolve(UPLOAD_DIR, file.name), buffer);
      uploadedCount++;
    }

    return NextResponse.json({
      success: true,
      count: uploadedCount,
      message: `Successfully uploaded ${uploadedCount} file(s)`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    const { filename, type } = await req.json();

    if (!filename) {
      return NextResponse.json(
        { success: false, error: "Filename required" },
        { status: 400 },
      );
    }

    const fileType = type || "car";
    const UPLOAD_DIR = path.resolve(BASE_UPLOAD_DIR, fileType);
    const filePath = path.resolve(UPLOAD_DIR, filename);

    // Security check: ensure the file is within UPLOAD_DIR
    if (!filePath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json(
        { success: false, error: "Invalid file path" },
        { status: 400 },
      );
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 },
      );
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      },
      { status: 500 },
    );
  }
};
