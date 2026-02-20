"use client";

import { useState, useEffect } from "react";

interface WeatherPreset {
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

export const WeatherPresetsManager = () => {
  const [presets, setPresets] = useState<WeatherPreset[]>([]);
  const [graphicsOptions, setGraphicsOptions] =
    useState<string[]>(GRAPHICS_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<WeatherPreset | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    graphics: "3_clear",
    baseTemperatureAmbient: 20,
    baseTemperatureRoad: 10,
    variationAmbient: 1,
    variationRoad: 1,
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch presets
  const fetchPresets = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/weather-presets");
      if (response.ok) {
        const data = await response.json();
        setPresets(data.presets || []);
        if (data.graphicsOptions) {
          setGraphicsOptions(data.graphicsOptions);
        }
      }
    } catch (error) {
      console.error("Failed to fetch weather presets:", error);
      setMessage({
        type: "error",
        text: "Failed to load weather presets",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  const handleSavePreset = async () => {
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Preset name is required" });
      return;
    }

    try {
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `/api/weather-presets/${editing.id}`
        : "/api/weather-presets";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          graphics: formData.graphics,
          baseTemperatureAmbient: formData.baseTemperatureAmbient,
          baseTemperatureRoad: formData.baseTemperatureRoad,
          variationAmbient: formData.variationAmbient,
          variationRoad: formData.variationRoad,
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: editing
            ? "Weather preset updated successfully"
            : "Weather preset created successfully",
        });
        setShowForm(false);
        setEditing(null);
        setFormData({
          name: "",
          description: "",
          graphics: "3_clear",
          baseTemperatureAmbient: 20,
          baseTemperatureRoad: 10,
          variationAmbient: 1,
          variationRoad: 1,
        });
        fetchPresets();
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.error || "Failed to save weather preset",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Error saving weather preset",
      });
    }
  };

  const handleEditPreset = (preset: WeatherPreset) => {
    setEditing(preset);
    setFormData({
      name: preset.name,
      description: preset.description || "",
      graphics: preset.graphics,
      baseTemperatureAmbient: preset.baseTemperatureAmbient,
      baseTemperatureRoad: preset.baseTemperatureRoad,
      variationAmbient: preset.variationAmbient,
      variationRoad: preset.variationRoad,
    });
    setShowForm(true);
  };

  const handleDeletePreset = async (id: string) => {
    if (!confirm("Are you sure you want to delete this weather preset?"))
      return;

    try {
      const response = await fetch(`/api/weather-presets/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Weather preset deleted successfully",
        });
        fetchPresets();
      } else {
        setMessage({ type: "error", text: "Failed to delete weather preset" });
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
      graphics: "3_clear",
      baseTemperatureAmbient: 20,
      baseTemperatureRoad: 10,
      variationAmbient: 1,
      variationRoad: 1,
    });
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getGraphicsDisplay = (graphics: string): string => {
    return graphics === "3_clear" ? "☀️ Clear" : "☁️ Heavy Clouds";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Weather Conditions
          </h2>
          <p className="text-gray-600 mt-1">
            Create and manage weather presets for your server configurations
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + New Weather
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
            {editing ? "Edit Weather Preset" : "Create New Weather Preset"}
          </h3>

          <div className="space-y-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Name */}
            <div className="lg:col-span-2">
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
                placeholder="e.g., Sunny Morning"
              />
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of this weather condition"
              />
            </div>

            {/* Graphics */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Graphics *
              </label>
              <select
                value={formData.graphics}
                onChange={(e) =>
                  setFormData({ ...formData, graphics: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {graphicsOptions.map((option) => (
                  <option key={option} value={option}>
                    {getGraphicsDisplay(option)}
                  </option>
                ))}
              </select>
            </div>

            {/* Base Ambient Temperature */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Base Ambient Temp (°C)
              </label>
              <input
                type="number"
                value={formData.baseTemperatureAmbient}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    baseTemperatureAmbient: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500 focus:border-transparent"
                step="0.1"
              />
            </div>

            {/* Base Road Temperature */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Base Road Temp (°C)
              </label>
              <input
                type="number"
                value={formData.baseTemperatureRoad}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    baseTemperatureRoad: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500 focus:border-transparent"
                step="0.1"
              />
            </div>

            {/* Variation Ambient */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Ambient Variation
              </label>
              <input
                type="number"
                value={formData.variationAmbient}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    variationAmbient: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500 focus:border-transparent"
                step="0.1"
              />
            </div>

            {/* Variation Road */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Road Variation
              </label>
              <input
                type="number"
                value={formData.variationRoad}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    variationRoad: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500 focus:border-transparent"
                step="0.1"
              />
            </div>

            {/* Buttons */}
            <div className="lg:col-span-2 flex gap-3 pt-4">
              <button
                onClick={handleSavePreset}
                className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {editing ? "Update Weather" : "Create Weather"}
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

      {/* Presets Grid */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          All Weather Presets ({presets.length})
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">Loading weather presets...</div>
          </div>
        ) : presets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No weather presets yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
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
                </div>

                <div className="bg-gray-50 rounded p-3 mb-3 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Graphics:</span>
                    <span className="font-medium">
                      {getGraphicsDisplay(preset.graphics)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ambient Temp:</span>
                    <span className="font-medium">
                      {preset.baseTemperatureAmbient}°C (±
                      {preset.variationAmbient}°C)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Road Temp:</span>
                    <span className="font-medium">
                      {preset.baseTemperatureRoad}°C (±
                      {preset.variationRoad}°C)
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditPreset(preset)}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePreset(preset.id)}
                    className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="text-xs text-gray-500 mt-3">
                  Updated: {formatDate(preset.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
