import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "crypto";

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

const ensurePresetsDir = () => {
  if (!fs.existsSync(PRESETS_DIR)) {
    fs.mkdirSync(PRESETS_DIR, { recursive: true });
  }
};

const getPresetFilePath = (id: string): string => {
  return path.resolve(PRESETS_DIR, `${id}.json`);
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// GET - List all presets
export const GET = async () => {
  try {
    ensurePresetsDir();

    const files = fs.readdirSync(PRESETS_DIR);
    const presets: Preset[] = [];

    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.resolve(PRESETS_DIR, file);
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
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to list presets",
      },
      { status: 500 },
    );
  }
};

// POST - Create new preset
export const POST = async (req: NextRequest) => {
  try {
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

    ensurePresetsDir();

    const id = generateId();
    const now = new Date().toISOString();

    const preset: Preset = {
      id,
      name,
      description,
      weatherPresets: weatherPresets || [],
      config: config || {},
      createdAt: now,
      updatedAt: now,
    };

    const filePath = getPresetFilePath(id);
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
          error instanceof Error ? error.message : "Failed to create preset",
      },
      { status: 500 },
    );
  }
};
