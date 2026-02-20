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

const ensureWeatherPresetsDir = () => {
  if (!fs.existsSync(WEATHER_PRESETS_DIR)) {
    fs.mkdirSync(WEATHER_PRESETS_DIR, { recursive: true });
  }
};

const getWeatherPresetFilePath = (id: string): string => {
  return path.resolve(WEATHER_PRESETS_DIR, `${id}.json`);
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// GET - List all weather presets
export const GET = async () => {
  try {
    ensureWeatherPresetsDir();

    const files = fs.readdirSync(WEATHER_PRESETS_DIR);
    const presets: WeatherPreset[] = [];

    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.resolve(WEATHER_PRESETS_DIR, file);
        const content = fs.readFileSync(filePath, "utf-8");
        presets.push(JSON.parse(content));
      }
    }

    // Sort by creation date (newest first)
    presets.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({
      success: true,
      presets,
      graphicsOptions: GRAPHICS_OPTIONS,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to list weather presets",
      },
      { status: 500 },
    );
  }
};

// POST - Create new weather preset
export const POST = async (req: NextRequest) => {
  try {
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

    ensureWeatherPresetsDir();

    const id = generateId();
    const now = new Date().toISOString();

    const preset: WeatherPreset = {
      id,
      name,
      description,
      graphics,
      baseTemperatureAmbient: Number(baseTemperatureAmbient) || 20,
      baseTemperatureRoad: Number(baseTemperatureRoad) || 10,
      variationAmbient: Number(variationAmbient) || 1,
      variationRoad: Number(variationRoad) || 1,
      createdAt: now,
      updatedAt: now,
    };

    const filePath = getWeatherPresetFilePath(id);
    fs.writeFileSync(filePath, JSON.stringify(preset, null, 2));

    return NextResponse.json(
      {
        success: true,
        preset,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create weather preset",
      },
      { status: 500 },
    );
  }
};
