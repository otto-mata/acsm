import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const WEATHER_PRESETS_DIR = path.resolve(
  process.env.ROOT_PATH ?? "",
  "data/weather-presets",
);

export interface WeatherPreset {
  id: string;
  name: string;
  description?: string;
  graphics: string;
  baseTemperatureAmbient: number;
  baseTemperatureRoad: number;
  variationAmbient: number;
  variationRoad: number;
  createdAt: string;
  updatedAt: string;
}

const GRAPHICS_OPTIONS = ["3_clear", "7_heavy_clouds"];

const getWeatherPresetFilePath = (id: string): string => {
  return path.resolve(WEATHER_PRESETS_DIR, `${id}.json`);
};

// GET - Get single weather preset
export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    const { id } = await params;
    const filePath = getWeatherPresetFilePath(id);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          success: false,
          error: "Weather preset not found",
        },
        { status: 404 },
      );
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const preset = JSON.parse(content);

    return NextResponse.json({
      success: true,
      preset,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get weather preset",
      },
      { status: 500 },
    );
  }
};

// PUT - Update weather preset
export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    const { id } = await params;
    const {
      name,
      description,
      graphics,
      baseTemperatureAmbient,
      baseTemperatureRoad,
      variationAmbient,
      variationRoad,
    } = await req.json();

    if (!name || !graphics) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and graphics are required",
        },
        { status: 400 },
      );
    }

    if (!GRAPHICS_OPTIONS.includes(graphics)) {
      return NextResponse.json(
        {
          success: false,
          error: `Graphics must be one of: ${GRAPHICS_OPTIONS.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const filePath = getWeatherPresetFilePath(id);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          success: false,
          error: "Weather preset not found",
        },
        { status: 404 },
      );
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const existingPreset = JSON.parse(content) as WeatherPreset;

    const updatedPreset: WeatherPreset = {
      ...existingPreset,
      name,
      description,
      graphics,
      baseTemperatureAmbient: Number(baseTemperatureAmbient) || 20,
      baseTemperatureRoad: Number(baseTemperatureRoad) || 10,
      variationAmbient: Number(variationAmbient) || 1,
      variationRoad: Number(variationRoad) || 1,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(filePath, JSON.stringify(updatedPreset, null, 2));

    return NextResponse.json({
      success: true,
      preset: updatedPreset,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update weather preset",
      },
      { status: 500 },
    );
  }
};

// DELETE - Delete weather preset
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    const { id } = await params;
    const filePath = getWeatherPresetFilePath(id);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          success: false,
          error: "Weather preset not found",
        },
        { status: 404 },
      );
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({
      success: true,
      message: "Weather preset deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete weather preset",
      },
      { status: 500 },
    );
  }
};
