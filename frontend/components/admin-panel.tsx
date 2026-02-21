"use client";

import { useState } from "react";
import { ContentUpload } from "@/components/content-upload";
import { PresetsManager } from "@/components/server-cfg-presets-manager";
import { WeatherPresetsManager } from "@/components/weather-presets-manager";
import { InstalledCarsManager } from "@/components/installed-cars-manager";
import { InstalledTracksManager } from "@/components/installed-tracks-manager";

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<
    "uploads" | "presets" | "weather" | "cars" | "tracks"
  >("uploads");

  // Track which tabs have been visited to enable lazy loading with caching
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    new Set(["uploads"]),
  );

  const handleTabChange = (
    tab: "uploads" | "presets" | "weather" | "cars" | "tracks",
  ) => {
    setActiveTab(tab);
    setVisitedTabs((prev) => new Set(prev).add(tab));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage files and server configurations
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 bg-white rounded-lg shadow-lg p-2 flex-wrap">
          <button
            onClick={() => handleTabChange("uploads")}
            className={`flex-1 min-w-max px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "uploads"
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            📤 File Uploads
          </button>
          <button
            onClick={() => handleTabChange("cars")}
            className={`flex-1 min-w-max px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "cars"
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            🏎️ Installed Cars
          </button>
          <button
            onClick={() => handleTabChange("tracks")}
            className={`flex-1 min-w-max px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "tracks"
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            🏁 Installed Tracks
          </button>
          <button
            onClick={() => handleTabChange("weather")}
            className={`flex-1 min-w-max px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "weather"
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            🌤️ Weather
          </button>
          <button
            onClick={() => handleTabChange("presets")}
            className={`flex-1 min-w-max px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "presets"
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            ⚙️ Server Presets
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {visitedTabs.has("uploads") && (
            <div className={activeTab === "uploads" ? "" : "hidden"}>
              <ContentUpload />
            </div>
          )}
          {visitedTabs.has("cars") && (
            <div className={activeTab === "cars" ? "" : "hidden"}>
              <InstalledCarsManager />
            </div>
          )}
          {visitedTabs.has("tracks") && (
            <div className={activeTab === "tracks" ? "" : "hidden"}>
              <InstalledTracksManager />
            </div>
          )}
          {visitedTabs.has("weather") && (
            <div className={activeTab === "weather" ? "" : "hidden"}>
              <WeatherPresetsManager />
            </div>
          )}
          {visitedTabs.has("presets") && (
            <div className={activeTab === "presets" ? "" : "hidden"}>
              <PresetsManager />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
