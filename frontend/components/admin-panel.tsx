"use client";

import { useState } from "react";
import { AdminDashboard } from "@/components/admin-dashboard";
import { PresetsManager } from "@/components/presets-manager";
import { WeatherPresetsManager } from "@/components/weather-presets-manager";

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<"uploads" | "presets" | "weather">(
    "uploads",
  );

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
            onClick={() => setActiveTab("uploads")}
            className={`flex-1 min-w-max px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "uploads"
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            📤 File Uploads
          </button>
          <button
            onClick={() => setActiveTab("weather")}
            className={`flex-1 min-w-max px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "weather"
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            🌤️ Weather
          </button>
          <button
            onClick={() => setActiveTab("presets")}
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
          {activeTab === "uploads" && <AdminDashboard />}
          {activeTab === "weather" && <WeatherPresetsManager />}
          {activeTab === "presets" && <PresetsManager />}
        </div>
      </div>
    </div>
  );
};
