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

export const PATCH = async (req: NextRequest) => {
  try {
    const { filename, currentType, newType } = await req.json();

    if (!filename || !currentType || !newType) {
      return NextResponse.json(
        {
          success: false,
          error: "Filename, currentType, and newType required",
        },
        { status: 400 },
      );
    }

    if (currentType === newType) {
      return NextResponse.json(
        { success: false, error: "File is already in this category" },
        { status: 400 },
      );
    }

    if (
      !["car", "track"].includes(newType) ||
      !["car", "track"].includes(currentType)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid type. Must be 'car' or 'track'" },
        { status: 400 },
      );
    }

    const SOURCE_DIR = path.resolve(BASE_UPLOAD_DIR, currentType);
    const TARGET_DIR = path.resolve(BASE_UPLOAD_DIR, newType);
    const sourcePath = path.resolve(SOURCE_DIR, filename);
    const targetPath = path.resolve(TARGET_DIR, filename);

    // Security checks
    if (
      !sourcePath.startsWith(SOURCE_DIR) ||
      !targetPath.startsWith(TARGET_DIR)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid file path" },
        { status: 400 },
      );
    }

    if (!fs.existsSync(sourcePath)) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 },
      );
    }

    // Create target directory if it doesn't exist
    if (!fs.existsSync(TARGET_DIR)) {
      fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    // Check if file already exists in target
    if (fs.existsSync(targetPath)) {
      return NextResponse.json(
        {
          success: false,
          error: "File with same name already exists in target category",
        },
        { status: 400 },
      );
    }

    // Move the file
    fs.renameSync(sourcePath, targetPath);

    return NextResponse.json({
      success: true,
      message: `File moved from ${currentType} to ${newType} successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Move failed",
      },
      { status: 500 },
    );
  }
};
