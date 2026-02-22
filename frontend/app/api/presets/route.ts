import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const PRESETS_DIR = path.resolve(process.env.ROOT_PATH ?? "", "data/presets");

interface Car {
  name: string;
  skin: string;
  hasRandomSkin: boolean;
}

interface Preset {
  id: string;
  name: string;
  description?: string;
  weatherPresets?: string[];
  config: {
    name?: string;
    cars?: Car[];
    config_track?: string;
    track?: string;
    sun_angle?: number;
    password?: string;
    admin_password?: string;
    udp_port?: number;
    tcp_port?: number;
    http_port?: number;
    max_ballast_kg?: number;
    qualify_max_wait_perc?: number;
    pickup_mode_enabled?: number;
    loop_mode?: number;
    sleep_time?: number;
    client_send_interval_hz?: number;
    send_buffer_size?: number;
    recv_buffer_size?: number;
    race_over_time?: number;
    kick_quorum?: number;
    voting_quorum?: number;
    vote_duration?: number;
    blacklist_mode?: number;
    fuel_rate?: number;
    damage_multiplier?: number;
    tyre_wear_rate?: number;
    allowed_tyres_out?: number;
    abs_allowed?: number;
    tc_allowed?: number;
    start_rule?: number;
    stability_allowed?: number;
    autoclutch_allowed?: number;
    tyre_blankets_allowed?: number;
    force_virtual_mirror?: number;
    register_to_lobby?: number;
    max_clients?: number;
    num_threads?: number;
    udp_plugin_local_port?: number;
    udp_plugin_address?: string;
    auth_plugin_address?: string;
    legal_tyres?: string[];
    welcome_message?: string;
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
