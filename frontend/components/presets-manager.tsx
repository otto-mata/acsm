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

interface WeatherPreset {
  id: string;
  name: string;
  graphics: string;
}

export const PresetsManager = () => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [weatherPresets, setWeatherPresets] = useState<WeatherPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Preset | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    weatherPresets: [] as string[],
    config: {
      NAME: "",
      CARS: [] as string[],
      CONFIG_TRACK: "",
      TRACK: "",
      SUN_ANGLE: 48,
      PASSWORD: "",
      ADMIN_PASSWORD: "",
      UDP_PORT: 9600,
      TCP_PORT: 9600,
      HTTP_PORT: 8081,
      MAX_BALLAST_KG: 0,
      QUALIFY_MAX_WAIT_PERC: 120,
      PICKUP_MODE_ENABLED: 1,
      LOOP_MODE: 1,
      SLEEP_TIME: 1,
      CLIENT_SEND_INTERVAL_HZ: 18,
      SEND_BUFFER_SIZE: 0,
      RECV_BUFFER_SIZE: 0,
      RACE_OVER_TIME: 180,
      KICK_QUORUM: 85,
      VOTING_QUORUM: 80,
      VOTE_DURATION: 20,
      BLACKLIST_MODE: 1,
      FUEL_RATE: 100,
      DAMAGE_MULTIPLIER: 100,
      TYRE_WEAR_RATE: 100,
      ALLOWED_TYRES_OUT: 2,
      ABS_ALLOWED: 0,
      TC_ALLOWED: 0,
      START_RULE: 0,
      STABILITY_ALLOWED: 0,
      AUTOCLUTCH_ALLOWED: 0,
      TYRE_BLANKETS_ALLOWED: 0,
      FORCE_VIRTUAL_MIRROR: 1,
      REGISTER_TO_LOBBY: 1,
      MAX_CLIENTS: 18,
      NUM_THREADS: 2,
      UDP_PLUGIN_LOCAL_PORT: 0,
      UDP_PLUGIN_ADDRESS: "",
      AUTH_PLUGIN_ADDRESS: "",
      LEGAL_TYRES: [] as string[],
      WELCOME_MESSAGE: "",
    },
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

  // Fetch weather presets
  const fetchWeatherPresets = async () => {
    try {
      const response = await fetch("/api/weather-presets");
      if (response.ok) {
        const data = await response.json();
        setWeatherPresets(data.presets || []);
      }
    } catch (error) {
      console.error("Failed to fetch weather presets:", error);
    }
  };

  useEffect(() => {
    fetchPresets();
    fetchWeatherPresets();
  }, []);

  const handleSavePreset = async () => {
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Preset name is required" });
      return;
    }

    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/presets/${editing.id}` : "/api/presets";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          weatherPresets: formData.weatherPresets,
          config: formData.config,
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: editing
            ? "Preset updated successfully"
            : "Preset created successfully",
        });
        setShowForm(false);
        setEditing(null);
        setFormData({
          name: "",
          description: "",
          weatherPresets: [],
          config: {
            NAME: "",
            CARS: [],
            CONFIG_TRACK: "",
            TRACK: "",
            SUN_ANGLE: 48,
            PASSWORD: "",
            ADMIN_PASSWORD: "",
            UDP_PORT: 9600,
            TCP_PORT: 9600,
            HTTP_PORT: 8081,
            MAX_BALLAST_KG: 0,
            QUALIFY_MAX_WAIT_PERC: 120,
            PICKUP_MODE_ENABLED: 1,
            LOOP_MODE: 1,
            SLEEP_TIME: 1,
            CLIENT_SEND_INTERVAL_HZ: 18,
            SEND_BUFFER_SIZE: 0,
            RECV_BUFFER_SIZE: 0,
            RACE_OVER_TIME: 180,
            KICK_QUORUM: 85,
            VOTING_QUORUM: 80,
            VOTE_DURATION: 20,
            BLACKLIST_MODE: 1,
            FUEL_RATE: 100,
            DAMAGE_MULTIPLIER: 100,
            TYRE_WEAR_RATE: 100,
            ALLOWED_TYRES_OUT: 2,
            ABS_ALLOWED: 0,
            TC_ALLOWED: 0,
            START_RULE: 0,
            STABILITY_ALLOWED: 0,
            AUTOCLUTCH_ALLOWED: 0,
            TYRE_BLANKETS_ALLOWED: 0,
            FORCE_VIRTUAL_MIRROR: 1,
            REGISTER_TO_LOBBY: 1,
            MAX_CLIENTS: 18,
            NUM_THREADS: 2,
            UDP_PLUGIN_LOCAL_PORT: 0,
            UDP_PLUGIN_ADDRESS: "",
            AUTH_PLUGIN_ADDRESS: "",
            LEGAL_TYRES: [],
            WELCOME_MESSAGE: "",
          },
        });
        fetchPresets();
      } else {
        setMessage({ type: "error", text: "Failed to save preset" });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error saving preset",
      });
    }
  };

  const handleEditPreset = (preset: Preset) => {
    setEditing(preset);
    setFormData({
      name: preset.name,
      description: preset.description || "",
      config: preset.config,
      weatherPresets: preset.weatherPresets || [],
    });
    setShowForm(true);
  };

  const handleDeletePreset = async (id: string) => {
    if (!confirm("Are you sure you want to delete this preset?")) return;

    try {
      const response = await fetch(`/api/presets/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Preset deleted successfully" });
        fetchPresets();
      } else {
        setMessage({ type: "error", text: "Failed to delete preset" });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          "Delete error: " +
          (error instanceof Error ? error.message : "Unknown error"),
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
    setFormData({
      name: "",
      description: "",
      config: "{}",
      weatherPresets: [],
    });
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Server Presets</h2>
          <p className="text-gray-600 mt-1">
            Create and manage server configuration presets
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + New Preset
          </button>
        )}
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

      {/* Form */}
      {showForm && (
        <div className="bg-blue-50 rounded-lg shadow p-8 border border-blue-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            {editing ? "Edit Preset" : "Create New Preset"}
          </h3>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Preset Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Default Racing Server"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of this preset"
              />
            </div>

            {/* Weather Presets */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Add Weather Presets
              </label>
              {weatherPresets.length > 0 ? (
                <div className="space-y-2">
                  {weatherPresets.map((weatherPreset) => (
                    <div
                      key={weatherPreset.id}
                      className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {weatherPreset.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {weatherPreset.graphics === "3_clear"
                            ? "☀️ Clear"
                            : "☁️ Heavy Clouds"}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (
                            formData.weatherPresets.includes(weatherPreset.id)
                          ) {
                            setFormData({
                              ...formData,
                              weatherPresets: formData.weatherPresets.filter(
                                (id) => id !== weatherPreset.id,
                              ),
                            });
                          } else {
                            setFormData({
                              ...formData,
                              weatherPresets: [
                                ...formData.weatherPresets,
                                weatherPreset.id,
                              ],
                            });
                          }
                        }}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          formData.weatherPresets.includes(weatherPreset.id)
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        {formData.weatherPresets.includes(weatherPreset.id)
                          ? "Remove"
                          : "Add"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  No weather presets available. Create one in the Weather tab
                  first.
                </p>
              )}
              {formData.weatherPresets.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Selected Weather Presets ({formData.weatherPresets.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.weatherPresets.map((id) => {
                      const weather = weatherPresets.find((w) => w.id === id);
                      return weather ? (
                        <span
                          key={id}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                        >
                          {weather.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Server Configuration */}
            <div className="border-t pt-6 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Server Configuration
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NAME */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Server Name
                  </label>
                  <input
                    type="text"
                    value={formData.config.NAME || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, NAME: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="AC_Server"
                  />
                </div>

                {/* TRACK */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Track
                  </label>
                  <input
                    type="text"
                    value={formData.config.TRACK || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, TRACK: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="magione"
                  />
                </div>

                {/* CONFIG_TRACK */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Track Config
                  </label>
                  <input
                    type="text"
                    value={formData.config.CONFIG_TRACK || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          CONFIG_TRACK: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="Track configuration"
                  />
                </div>

                {/* SUN_ANGLE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Sun Angle
                  </label>
                  <input
                    type="number"
                    value={formData.config.SUN_ANGLE || 48}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          SUN_ANGLE: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* UDP_PORT */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    UDP Port
                  </label>
                  <input
                    type="number"
                    value={formData.config.UDP_PORT || 9600}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          UDP_PORT: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* TCP_PORT */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    TCP Port
                  </label>
                  <input
                    type="number"
                    value={formData.config.TCP_PORT || 9600}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          TCP_PORT: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* HTTP_PORT */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    HTTP Port
                  </label>
                  <input
                    type="number"
                    value={formData.config.HTTP_PORT || 8081}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          HTTP_PORT: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* MAX_CLIENTS */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Max Clients
                  </label>
                  <input
                    type="number"
                    value={formData.config.MAX_CLIENTS || 18}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          MAX_CLIENTS: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.config.PASSWORD || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          PASSWORD: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* ADMIN_PASSWORD */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={formData.config.ADMIN_PASSWORD || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          ADMIN_PASSWORD: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* RACE_OVER_TIME */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Race Over Time (seconds)
                  </label>
                  <input
                    type="number"
                    value={formData.config.RACE_OVER_TIME || 180}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          RACE_OVER_TIME: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* FUEL_RATE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Fuel Rate (%)
                  </label>
                  <input
                    type="number"
                    value={formData.config.FUEL_RATE || 100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          FUEL_RATE: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* DAMAGE_MULTIPLIER */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Damage Multiplier (%)
                  </label>
                  <input
                    type="number"
                    value={formData.config.DAMAGE_MULTIPLIER || 100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          DAMAGE_MULTIPLIER: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* TYRE_WEAR_RATE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tyre Wear Rate (%)
                  </label>
                  <input
                    type="number"
                    value={formData.config.TYRE_WEAR_RATE || 100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          TYRE_WEAR_RATE: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* ABS_ALLOWED */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    ABS Allowed
                  </label>
                  <select
                    value={formData.config.ABS_ALLOWED || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          ABS_ALLOWED: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Disabled</option>
                    <option value={1}>Allow Factory</option>
                    <option value={2}>Allow Forced</option>
                  </select>
                </div>

                {/* TC_ALLOWED */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    TC Allowed
                  </label>
                  <select
                    value={formData.config.TC_ALLOWED || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          TC_ALLOWED: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Disabled</option>
                    <option value={1}>Allow Factory</option>
                    <option value={2}>Allow Forced</option>
                  </select>
                </div>

                {/* WELCOME_MESSAGE */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Welcome Message
                  </label>
                  <textarea
                    value={formData.config.WELCOME_MESSAGE || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          WELCOME_MESSAGE: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Welcome message for players"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSavePreset}
                className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {editing ? "Update Preset" : "Create Preset"}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Presets List */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          All Presets ({presets.length})
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">Loading presets...</div>
          </div>
        ) : presets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No presets yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {preset.name}
                    </h4>
                    {preset.description && (
                      <p className="text-gray-600 text-sm mt-1">
                        {preset.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPreset(preset)}
                      className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePreset(preset.id)}
                      className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded text-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {preset.config.NAME && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          Server Name
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.NAME}
                        </p>
                      </div>
                    )}
                    {preset.config.TRACK && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          Track
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.TRACK}
                        </p>
                      </div>
                    )}
                    {preset.config.MAX_CLIENTS && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          Max Clients
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.MAX_CLIENTS}
                        </p>
                      </div>
                    )}
                    {preset.config.UDP_PORT && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          UDP Port
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.UDP_PORT}
                        </p>
                      </div>
                    )}
                    {preset.config.TCP_PORT && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          TCP Port
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.TCP_PORT}
                        </p>
                      </div>
                    )}
                    {preset.config.HTTP_PORT && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          HTTP Port
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.HTTP_PORT}
                        </p>
                      </div>
                    )}
                    {preset.config.SUN_ANGLE !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          Sun Angle
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.SUN_ANGLE}°
                        </p>
                      </div>
                    )}
                    {preset.config.FUEL_RATE && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          Fuel Rate
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.FUEL_RATE}%
                        </p>
                      </div>
                    )}
                    {preset.config.DAMAGE_MULTIPLIER && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          Damage
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.DAMAGE_MULTIPLIER}%
                        </p>
                      </div>
                    )}
                    {preset.config.TYRE_WEAR_RATE && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          Tyre Wear
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.TYRE_WEAR_RATE}%
                        </p>
                      </div>
                    )}
                    {preset.config.ABS_ALLOWED !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          ABS
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.ABS_ALLOWED === 0
                            ? "Disabled"
                            : preset.config.ABS_ALLOWED === 1
                              ? "Allow Factory"
                              : "Allow Forced"}
                        </p>
                      </div>
                    )}
                    {preset.config.TC_ALLOWED !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          TC
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.TC_ALLOWED === 0
                            ? "Disabled"
                            : preset.config.TC_ALLOWED === 1
                              ? "Allow Factory"
                              : "Allow Forced"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {preset.weatherPresets && preset.weatherPresets.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs font-semibold text-gray-900 mb-2">
                      Weather Presets ({preset.weatherPresets.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {preset.weatherPresets.map((weatherId) => {
                        const weather = weatherPresets.find(
                          (w) => w.id === weatherId,
                        );
                        return weather ? (
                          <span
                            key={weatherId}
                            className="px-2 py-1 bg-blue-200 text-blue-900 text-xs rounded"
                          >
                            {weather.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-6 text-xs text-gray-500 mt-3">
                  <span>Created: {formatDate(preset.createdAt)}</span>
                  <span>Updated: {formatDate(preset.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
