import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const PRESETS_DIR = path.resolve(process.env.ROOT_PATH ?? "", "data/presets");

interface Preset {
  id: string;
  name: string;
  description?: string;
  weatherPresets?: string[];
  config: {
    NAME?: string;
    CARS?: string[];
    CONFIG_TRACK?: string;
    TRACK?: string;
    SUN_ANGLE?: number;
    PASSWORD?: string;
    ADMIN_PASSWORD?: string;
    UDP_PORT?: number;
    TCP_PORT?: number;
    HTTP_PORT?: number;
    MAX_BALLAST_KG?: number;
    QUALIFY_MAX_WAIT_PERC?: number;
    PICKUP_MODE_ENABLED?: number;
    LOOP_MODE?: number;
    SLEEP_TIME?: number;
    CLIENT_SEND_INTERVAL_HZ?: number;
    SEND_BUFFER_SIZE?: number;
    RECV_BUFFER_SIZE?: number;
    RACE_OVER_TIME?: number;
    KICK_QUORUM?: number;
    VOTING_QUORUM?: number;
    VOTE_DURATION?: number;
    BLACKLIST_MODE?: number;
    FUEL_RATE?: number;
    DAMAGE_MULTIPLIER?: number;
    TYRE_WEAR_RATE?: number;
    ALLOWED_TYRES_OUT?: number;
    ABS_ALLOWED?: number;
    TC_ALLOWED?: number;
    START_RULE?: number;
    STABILITY_ALLOWED?: number;
    AUTOCLUTCH_ALLOWED?: number;
    TYRE_BLANKETS_ALLOWED?: number;
    FORCE_VIRTUAL_MIRROR?: number;
    REGISTER_TO_LOBBY?: number;
    MAX_CLIENTS?: number;
    NUM_THREADS?: number;
    UDP_PLUGIN_LOCAL_PORT?: number;
    UDP_PLUGIN_ADDRESS?: string;
    AUTH_PLUGIN_ADDRESS?: string;
    LEGAL_TYRES?: string[];
    WELCOME_MESSAGE?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const getPresetFilePath = (id: string): string => {
  return path.resolve(PRESETS_DIR, `${id}.json`);
};

// GET - Get single preset
export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    const { id } = await params;
    const filePath = getPresetFilePath(id);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          success: false,
          error: "Preset not found",
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
        error: error instanceof Error ? error.message : "Failed to get preset",
      },
      { status: 500 },
    );
  }
};

// PUT - Update preset
export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    const { id } = await params;
    const { name, description, weatherPresets, config } = await req.json();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Name is required",
        },
        { status: 400 },
      );
    }

    const filePath = getPresetFilePath(id);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          success: false,
          error: "Preset not found",
        },
        { status: 404 },
      );
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const existingPreset = JSON.parse(content) as Preset;

    const updatedPreset: Preset = {
      ...existingPreset,
      name,
      description,
      weatherPresets: weatherPresets || [],
      config: config || {},
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
          error instanceof Error ? error.message : "Failed to update preset",
      },
      { status: 500 },
    );
  }
};

// DELETE - Delete preset
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    const { id } = await params;
    const filePath = getPresetFilePath(id);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          success: false,
          error: "Preset not found",
        },
        { status: 404 },
      );
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({
      success: true,
      message: "Preset deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete preset",
      },
      { status: 500 },
    );
  }
};
