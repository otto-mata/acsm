"use client";

import { useState, useEffect } from "react";

interface Preset {
  id: string;
  name: string;
  description?: string;
  weatherPresets?: string[];
  config: {
    NAME: string;
    CARS: string[];
    CONFIG_TRACK: string;
    TRACK: string;
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

export const DeployPresetManager = () => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [deploying, setDeploying] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [backendUrl, setBackendUrl] = useState("http://localhost:5000");

  // Fetch presets
  const fetchPresets = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/presets");
      if (response.ok) {
        const data = await response.json();
        setPresets(data.presets || []);
      }
    } catch (error) {
      console.error("Failed to fetch presets:", error);
      setMessage({
        type: "error",
        text: "Failed to load presets",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  const handleDeployPreset = async () => {
    if (!selectedPresetId) {
      setMessage({ type: "error", text: "Please select a preset to deploy" });
      return;
    }

    const preset = presets.find((p) => p.id === selectedPresetId);
    if (!preset) {
      setMessage({ type: "error", text: "Selected preset not found" });
      return;
    }

    setDeploying(true);
    setMessage(null);

    try {
      // Prepare car entries with metadata
      const carEntries = preset.config.CARS.map((carString) => {
        const [carSlug, skinSlug] = carString.split("/");
        return {
          car: carSlug,
          skin: skinSlug || null, // null indicates random skin
          isRandom: !skinSlug,
        };
      });

      // Prepare form data
      const formData = new FormData();
      formData.append("server_config", JSON.stringify(preset.config));
      formData.append("entries", JSON.stringify(preset.config.CARS));
      formData.append("car_entries", JSON.stringify(carEntries));

      // Send to backend
      const response = await fetch(`${backendUrl}/presets`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Preset "${preset.name}" deployed successfully!`,
        });
        setSelectedPresetId("");
      } else {
        const errorText = await response.text();
        setMessage({
          type: "error",
          text: `Failed to deploy preset: ${errorText}`,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? `Deployment error: ${error.message}`
            : "Unknown deployment error",
      });
    } finally {
      setDeploying(false);
    }
  };

  const selectedPreset = presets.find((p) => p.id === selectedPresetId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Deploy Preset</h2>
          <p className="text-gray-600 mt-1">
            Deploy a server preset to the Assetto Corsa server
          </p>
        </div>
        <button
          onClick={fetchPresets}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Backend URL Configuration */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Backend Configuration
        </h3>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Backend URL
          </label>
          <input
            type="text"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500"
            placeholder="http://localhost:5000"
          />
          <p className="text-xs text-gray-600 mt-2">
            The URL where your Flask backend is running
          </p>
        </div>
      </div>

      {/* Preset Selection */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Preset to Deploy
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading presets...</span>
          </div>
        ) : presets.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              No presets available. Create one in the Server Presets tab first.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select a preset --</option>
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                  {preset.description ? ` - ${preset.description}` : ""}
                </option>
              ))}
            </select>

            {selectedPreset && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Preset Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">
                      Server Name:
                    </span>
                    <span className="ml-2 text-gray-900">
                      {selectedPreset.config.NAME || "Not set"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Track:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedPreset.config.TRACK || "Not set"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">
                      Track Layout:
                    </span>
                    <span className="ml-2 text-gray-900">
                      {selectedPreset.config.CONFIG_TRACK || "Default"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Cars:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedPreset.config.CARS.length} entries
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">
                      Max Clients:
                    </span>
                    <span className="ml-2 text-gray-900">
                      {selectedPreset.config.MAX_CLIENTS || "Not set"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">UDP Port:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedPreset.config.UDP_PORT || "Not set"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleDeployPreset}
              disabled={!selectedPresetId || deploying}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                !selectedPresetId || deploying
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {deploying ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Deploying...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  Deploy Preset to Server
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div className="text-sm text-gray-800">
            <p className="font-semibold mb-2">How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Select a preset from the dropdown</li>
              <li>Review the configuration details</li>
              <li>
                Click "Deploy" to send the configuration to the Flask backend
              </li>
              <li>The backend will create the server configuration files</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
