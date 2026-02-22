"use client";

import { useState, useEffect } from "react";

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
    name: string;
    cars: string[];
    config_track: string;
    track: string;
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

interface WeatherPreset {
  id: string;
  name: string;
  graphics: string;
}

interface CarSkin {
  id: number;
  name: string;
  slug: string;
  path: string;
  preview: string | null;
}

interface Car {
  id: number;
  name: string;
  brand: string;
  slug: string;
  path: string;
  skinCount: number;
}

interface CarEntry {
  id: string;
  carId: number;
  carName: string;
  skinId: number | "random";
  skinName: string;
  count: number;
}

interface Track {
  id: number;
  name: string;
  slug: string;
  path: string;
  layoutCount: number;
}

interface TrackLayout {
  id: number;
  name: string;
  slug: string;
  path: string;
  preview: string | null;
}

export const PresetsManager = () => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [weatherPresets, setWeatherPresets] = useState<WeatherPreset[]>([]);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [carEntries, setCarEntries] = useState<CarEntry[]>([]);
  const [loadingSkins, setLoadingSkins] = useState<Map<number, CarSkin[]>>(
    new Map(),
  );
  const [trackLayouts, setTrackLayouts] = useState<Map<number, TrackLayout[]>>(
    new Map(),
  );
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Preset | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    weatherPresets: [] as string[],
    config: {
      name: "AC_Server",
      cars: [] as string[],
      config_track: "",
      track: "magione",
      sun_angle: 48,
      password: "",
      admin_password: "",
      udp_port: 9600,
      tcp_port: 9600,
      http_port: 8081,
      max_ballast_kg: 0,
      qualify_max_wait_perc: 120,
      pickup_mode_enabled: 1,
      loop_mode: 1,
      sleep_time: 1,
      client_send_interval_hz: 18,
      send_buffer_size: 0,
      recv_buffer_size: 0,
      race_over_time: 180,
      kick_quorum: 85,
      voting_quorum: 80,
      vote_duration: 20,
      blacklist_mode: 1,
      fuel_rate: 100,
      damage_multiplier: 100,
      tyre_wear_rate: 100,
      allowed_tyres_out: 2,
      abs_allowed: 0,
      tc_allowed: 0,
      start_rule: 0,
      stability_allowed: 0,
      autoclutch_allowed: 0,
      tyre_blankets_allowed: 0,
      force_virtual_mirror: 1,
      register_to_lobby: 1,
      max_clients: 18,
      num_threads: 2,
      udp_plugin_local_port: 0,
      udp_plugin_address: "",
      auth_plugin_address: "",
      legal_tyres: [] as string[],
      welcome_message: "",
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

  // Fetch available cars
  const fetchCars = async () => {
    try {
      const response = await fetch("/api/cars");
      if (response.ok) {
        const data = await response.json();
        setAvailableCars(data.cars || []);
      }
    } catch (error) {
      console.error("Failed to fetch cars:", error);
    }
  };

  // Fetch available tracks
  const fetchTracks = async () => {
    try {
      const response = await fetch("/api/tracks");
      if (response.ok) {
        const data = await response.json();
        setAvailableTracks(data.tracks || []);
      }
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
    }
  };

  // Fetch track layouts
  const fetchTrackLayouts = async (trackId: number) => {
    if (trackLayouts.has(trackId)) {
      return trackLayouts.get(trackId)!;
    }

    try {
      const response = await fetch(`/api/tracks/${trackId}/layouts`);
      if (response.ok) {
        const data = await response.json();
        const layouts = data.layouts || [];
        setTrackLayouts((prev) => new Map(prev).set(trackId, layouts));
        return layouts;
      }
    } catch (error) {
      console.error("Failed to fetch track layouts:", error);
    }
    return [];
  };

  // Fetch car skins
  const fetchCarSkins = async (carId: number) => {
    if (loadingSkins.has(carId)) {
      return loadingSkins.get(carId)!;
    }

    try {
      const response = await fetch(`/api/cars/${carId}/skins`);
      if (response.ok) {
        const data = await response.json();
        const skins = data.skins || [];
        setLoadingSkins((prev) => new Map(prev).set(carId, skins));
        return skins;
      }
    } catch (error) {
      console.error("Failed to fetch car skins:", error);
    }
    return [];
  };

  useEffect(() => {
    fetchPresets();
    fetchWeatherPresets();
    fetchCars();
    fetchTracks();
  }, []);

  // Car entry management functions
  const addCarEntry = async (carId: number) => {
    const car = availableCars.find((c) => c.id === carId);
    if (!car) return;

    // Fetch skins for the car
    const skins = await fetchCarSkins(carId);

    const newEntry: CarEntry = {
      id: Date.now().toString(),
      carId: car.id,
      carName: car.name,
      skinId: "random",
      skinName: "Random",
      count: 1,
    };

    setCarEntries((prev) => [...prev, newEntry]);
  };

  const removeCarEntry = (entryId: string) => {
    setCarEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  };

  const updateCarEntry = (
    entryId: string,
    updates: Partial<Omit<CarEntry, "id">>,
  ) => {
    setCarEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId ? { ...entry, ...updates } : entry,
      ),
    );
  };

  const generateCarsArray = () => {
    const carsArray: string[] = [];
    carEntries.forEach((entry) => {
      const car = availableCars.find((c) => c.id === entry.carId);
      if (!car) return;

      for (let i = 0; i < entry.count; i++) {
        if (entry.skinId === "random") {
          carsArray.push(car.slug);
        } else {
          const skins = loadingSkins.get(entry.carId);
          const skin = skins?.find((s) => s.id === entry.skinId);
          if (skin) {
            carsArray.push(`${car.slug}/${skin.slug}`);
          } else {
            carsArray.push(car.slug);
          }
        }
      }
    });
    return carsArray;
  };

  const handleSavePreset = async () => {
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Preset name is required" });
      return;
    }

    // Generate CARS array from car entries
    const carsArray = generateCarsArray();

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
          config: {
            ...formData.config,
            CARS: carsArray,
          },
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
        setCarEntries([]);
        setSelectedTrackId(null);
        setFormData({
          name: "",
          description: "",
          weatherPresets: [],
          config: {
            name: "",
            cars: [],
            config_track: "",
            track: "",
            sun_angle: 48,
            password: "",
            admin_password: "",
            udp_port: 9600,
            tcp_port: 9600,
            http_port: 8081,
            max_ballast_kg: 0,
            qualify_max_wait_perc: 120,
            pickup_mode_enabled: 1,
            loop_mode: 1,
            sleep_time: 1,
            client_send_interval_hz: 18,
            send_buffer_size: 0,
            recv_buffer_size: 0,
            race_over_time: 180,
            kick_quorum: 85,
            voting_quorum: 80,
            vote_duration: 20,
            blacklist_mode: 1,
            fuel_rate: 100,
            damage_multiplier: 100,
            tyre_wear_rate: 100,
            allowed_tyres_out: 2,
            abs_allowed: 0,
            tc_allowed: 0,
            start_rule: 0,
            stability_allowed: 0,
            autoclutch_allowed: 0,
            tyre_blankets_allowed: 0,
            force_virtual_mirror: 1,
            register_to_lobby: 1,
            max_clients: 18,
            num_threads: 2,
            udp_plugin_local_port: 0,
            udp_plugin_address: "",
            auth_plugin_address: "",
            legal_tyres: [],
            welcome_message: "",
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

  const handleEditPreset = async (preset: Preset) => {
    setEditing(preset);
    setFormData({
      name: preset.name,
      description: preset.description || "",
      config: {
        name: preset.config.name || "",
        cars: preset.config.cars || [],
        config_track: preset.config.config_track || "",
        track: preset.config.track || "",
        sun_angle: preset.config.sun_angle ?? 48,
        password: preset.config.password || "",
        admin_password: preset.config.admin_password || "",
        udp_port: preset.config.udp_port ?? 9600,
        tcp_port: preset.config.tcp_port ?? 9600,
        http_port: preset.config.http_port ?? 8081,
        max_ballast_kg: preset.config.max_ballast_kg ?? 0,
        qualify_max_wait_perc: preset.config.qualify_max_wait_perc ?? 120,
        pickup_mode_enabled: preset.config.pickup_mode_enabled ?? 1,
        loop_mode: preset.config.loop_mode ?? 1,
        sleep_time: preset.config.sleep_time ?? 1,
        client_send_interval_hz: preset.config.client_send_interval_hz ?? 18,
        send_buffer_size: preset.config.send_buffer_size ?? 0,
        recv_buffer_size: preset.config.recv_buffer_size ?? 0,
        race_over_time: preset.config.race_over_time ?? 180,
        kick_quorum: preset.config.kick_quorum ?? 85,
        voting_quorum: preset.config.voting_quorum ?? 80,
        vote_duration: preset.config.vote_duration ?? 20,
        blacklist_mode: preset.config.blacklist_mode ?? 1,
        fuel_rate: preset.config.fuel_rate ?? 100,
        damage_multiplier: preset.config.damage_multiplier ?? 100,
        tyre_wear_rate: preset.config.tyre_wear_rate ?? 100,
        allowed_tyres_out: preset.config.allowed_tyres_out ?? 2,
        abs_allowed: preset.config.abs_allowed ?? 0,
        tc_allowed: preset.config.tc_allowed ?? 0,
        start_rule: preset.config.start_rule ?? 0,
        stability_allowed: preset.config.stability_allowed ?? 0,
        autoclutch_allowed: preset.config.autoclutch_allowed ?? 0,
        tyre_blankets_allowed: preset.config.tyre_blankets_allowed ?? 0,
        force_virtual_mirror: preset.config.force_virtual_mirror ?? 1,
        register_to_lobby: preset.config.register_to_lobby ?? 1,
        max_clients: preset.config.max_clients ?? 18,
        num_threads: preset.config.num_threads ?? 2,
        udp_plugin_local_port: preset.config.udp_plugin_local_port ?? 0,
        udp_plugin_address: preset.config.udp_plugin_address || "",
        auth_plugin_address: preset.config.auth_plugin_address || "",
        legal_tyres: preset.config.legal_tyres || [],
        welcome_message: preset.config.welcome_message || "",
      },
      weatherPresets: preset.weatherPresets || [],
    });

    // Parse CARS array and populate car entries
    const carEntriesMap = new Map<string, CarEntry>();
    const skinsToFetch = new Set<number>();

    for (const carString of preset.config.cars || []) {
      const [carSlug, skinSlug] = carString.split("/");
      const car = availableCars.find((c) => c.slug === carSlug);
      if (!car) continue;

      const key = `${car.id}-${skinSlug || "random"}`;

      if (carEntriesMap.has(key)) {
        const entry = carEntriesMap.get(key)!;
        entry.count++;
      } else {
        if (skinSlug) {
          skinsToFetch.add(car.id);
        }

        carEntriesMap.set(key, {
          id: `${car.id}-${skinSlug || "random"}-${Date.now()}`,
          carId: car.id,
          carName: car.name,
          skinId: skinSlug ? 0 : "random", // Will update after fetching skins
          skinName: skinSlug || "Random",
          count: 1,
        });
      }
    }

    // Fetch skins for cars that need them
    for (const carId of Array.from(skinsToFetch)) {
      await fetchCarSkins(carId);
    }

    // Update skin IDs now that skins are fetched
    const entries = Array.from(carEntriesMap.values()).map((entry) => {
      if (entry.skinName !== "Random") {
        const skins = loadingSkins.get(entry.carId);
        const skin = skins?.find((s) => s.slug === entry.skinName);
        if (skin) {
          return { ...entry, skinId: skin.id, skinName: skin.name };
        }
      }
      return entry;
    });

    setCarEntries(entries);

    // Handle track selection
    if (preset.config.track) {
      const track = availableTracks.find((t) => t.slug === preset.config.track);
      if (track) {
        setSelectedTrackId(track.id);
        // Fetch layouts for this track
        await fetchTrackLayouts(track.id);
      }
    } else {
      setSelectedTrackId(null);
    }

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
    setCarEntries([]);
    setSelectedTrackId(null);
    setFormData({
      name: "",
      description: "",
      weatherPresets: [],
      config: {
        name: "",
        cars: [],
        config_track: "",
        track: "",
        sun_angle: 48,
        password: "",
        admin_password: "",
        udp_port: 9600,
        tcp_port: 9600,
        http_port: 8081,
        max_ballast_kg: 0,
        qualify_max_wait_perc: 120,
        pickup_mode_enabled: 1,
        loop_mode: 1,
        sleep_time: 1,
        client_send_interval_hz: 18,
        send_buffer_size: 0,
        recv_buffer_size: 0,
        race_over_time: 180,
        kick_quorum: 85,
        voting_quorum: 80,
        vote_duration: 20,
        blacklist_mode: 1,
        fuel_rate: 100,
        damage_multiplier: 100,
        tyre_wear_rate: 100,
        allowed_tyres_out: 2,
        abs_allowed: 1,
        tc_allowed: 1,
        start_rule: 0,
        stability_allowed: 0,
        autoclutch_allowed: 0,
        tyre_blankets_allowed: 0,
        force_virtual_mirror: 1,
        register_to_lobby: 1,
        max_clients: 18,
        num_threads: 2,
        udp_plugin_local_port: 0,
        udp_plugin_address: "",
        auth_plugin_address: "",
        legal_tyres: [],
        welcome_message: "",
      },
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
            onClick={() => {
              setSelectedTrackId(null);
              setShowForm(true);
            }}
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

            {/* Car Selection */}
            <div className="border-t pt-6 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Car Selection
              </h4>

              {/* Selected Cars */}
              {carEntries.length > 0 && (
                <div className="mb-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-900">
                    Selected Cars ({carEntries.length} entries,{" "}
                    {carEntries.reduce((sum, e) => sum + e.count, 0)} total
                    slots)
                  </p>
                  {carEntries.map((entry) => {
                    const skins = loadingSkins.get(entry.carId) || [];
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 p-3 bg-white border border-gray-300 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {entry.carName}
                          </p>
                          {entry.skinId === "random" ? (
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              🎲 Random Skin
                            </p>
                          ) : (
                            <p className="text-xs text-gray-600">
                              {entry.skinName}
                            </p>
                          )}
                        </div>

                        {/* Skin Selection Dropdown */}
                        <div className="w-48">
                          <select
                            value={
                              entry.skinId === "random"
                                ? "random"
                                : entry.skinId
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "random") {
                                updateCarEntry(entry.id, {
                                  skinId: "random",
                                  skinName: "Random",
                                });
                              } else {
                                const skinId = parseInt(value);
                                const skin = skins.find((s) => s.id === skinId);
                                if (skin) {
                                  updateCarEntry(entry.id, {
                                    skinId: skin.id,
                                    skinName: skin.name,
                                  });
                                }
                              }
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="random">🎲 Random Skin</option>
                            {skins.map((skin) => (
                              <option key={skin.id} value={skin.id}>
                                {skin.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Count Input */}
                        <div className="w-20">
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={entry.count}
                            onChange={(e) => {
                              const count = Math.max(
                                1,
                                Math.min(99, parseInt(e.target.value) || 1),
                              );
                              updateCarEntry(entry.id, { count });
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-center text-gray-900 focus:ring-2 focus:ring-blue-500"
                            title="Number of times to add this car"
                          />
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeCarEntry(entry.id)}
                          className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Remove this car entry"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Available Cars */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Add Cars
                </label>
                {availableCars.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto p-2 bg-white border border-gray-300 rounded-lg">
                    {availableCars.map((car) => (
                      <button
                        key={car.id}
                        onClick={() => addCarEntry(car.id)}
                        className="flex items-center justify-between p-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded text-left transition-colors group"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {car.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {car.brand} • {car.skinCount} skins
                          </p>
                        </div>
                        <span className="text-blue-600 group-hover:text-blue-700 text-xl ml-2">
                          +
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    No cars available. Upload cars in the Files tab first.
                  </p>
                )}
              </div>
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
                    value={formData.config.name || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, name: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="AC_Server"
                  />
                </div>

                {/* TRACK */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Track
                  </label>
                  <select
                    value={selectedTrackId || ""}
                    onChange={async (e) => {
                      const trackId = e.target.value
                        ? parseInt(e.target.value)
                        : null;
                      setSelectedTrackId(trackId);

                      if (trackId) {
                        const track = availableTracks.find(
                          (t) => t.id === trackId,
                        );
                        if (track) {
                          setFormData({
                            ...formData,
                            config: {
                              ...formData.config,
                              track: track.slug,
                              config_track: "",
                            },
                          });
                          // Fetch layouts for this track
                          await fetchTrackLayouts(trackId);
                        }
                      } else {
                        setFormData({
                          ...formData,
                          config: {
                            ...formData.config,
                            track: "",
                            config_track: "",
                          },
                        });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a track...</option>
                    {availableTracks.map((track) => (
                      <option key={track.id} value={track.id}>
                        {track.name} ({track.layoutCount}{" "}
                        {track.layoutCount === 1 ? "layout" : "layouts"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* CONFIG_TRACK (Layout) */}
                {selectedTrackId && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Track Layout
                    </label>
                    {trackLayouts.has(selectedTrackId) ? (
                      <select
                        value={formData.config.config_track || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            config: {
                              ...formData.config,
                              config_track: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Default Layout</option>
                        {(trackLayouts.get(selectedTrackId) || []).map(
                          (layout) => (
                            <option key={layout.id} value={layout.slug}>
                              {layout.name}
                            </option>
                          ),
                        )}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                        <span className="text-sm text-gray-600">
                          Loading layouts...
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* SUN_ANGLE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Sun Angle
                  </label>
                  <input
                    type="number"
                    value={formData.config.sun_angle || 48}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          sun_angle: parseInt(e.target.value),
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
                    value={formData.config.udp_port || 9600}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          udp_port: parseInt(e.target.value),
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
                    value={formData.config.tcp_port || 9600}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          tcp_port: parseInt(e.target.value),
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
                    value={formData.config.http_port || 8081}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          http_port: parseInt(e.target.value),
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
                    value={formData.config.max_clients || 18}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          max_clients: parseInt(e.target.value),
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
                    value={formData.config.password || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          password: e.target.value,
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
                    value={formData.config.admin_password || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          admin_password: e.target.value,
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
                    value={formData.config.race_over_time || 180}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          race_over_time: parseInt(e.target.value),
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
                    value={formData.config.fuel_rate || 100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          fuel_rate: parseInt(e.target.value),
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
                    value={formData.config.damage_multiplier || 100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          damage_multiplier: parseInt(e.target.value),
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
                    value={formData.config.tyre_wear_rate || 100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          tyre_wear_rate: parseInt(e.target.value),
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
                    value={formData.config.abs_allowed || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          abs_allowed: parseInt(e.target.value),
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
                    value={formData.config.tc_allowed || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          tc_allowed: parseInt(e.target.value),
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
                    value={formData.config.welcome_message || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          welcome_message: e.target.value,
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
      <div className=" p-8">
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
                    {preset.config.name && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          Server Name
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.name}
                        </p>
                      </div>
                    )}
                    {preset.config.track && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          Track
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.track}
                        </p>
                      </div>
                    )}
                    {preset.config.max_clients && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          Max Clients
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.max_clients}
                        </p>
                      </div>
                    )}
                    {preset.config.udp_port && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          UDP Port
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.udp_port}
                        </p>
                      </div>
                    )}
                    {preset.config.tcp_port && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          TCP Port
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.tcp_port}
                        </p>
                      </div>
                    )}
                    {preset.config.http_port && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          HTTP Port
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.http_port}
                        </p>
                      </div>
                    )}
                    {preset.config.sun_angle !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          Sun Angle
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.sun_angle}°
                        </p>
                      </div>
                    )}
                    {preset.config.fuel_rate && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          Fuel Rate
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.fuel_rate}%
                        </p>
                      </div>
                    )}
                    {preset.config.damage_multiplier && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          Damage
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.damage_multiplier}%
                        </p>
                      </div>
                    )}
                    {preset.config.tyre_wear_rate && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          Tyre Wear
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.tyre_wear_rate}%
                        </p>
                      </div>
                    )}
                    {preset.config.abs_allowed !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          ABS
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.abs_allowed === 0
                            ? "Disabled"
                            : preset.config.abs_allowed === 1
                              ? "Allow Factory"
                              : "Allow Forced"}
                        </p>
                      </div>
                    )}
                    {preset.config.tc_allowed !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">
                          TC
                        </p>
                        <p className="text-gray-800 font-medium">
                          {preset.config.tc_allowed === 0
                            ? "Disabled"
                            : preset.config.tc_allowed === 1
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

                {preset.config.cars && preset.config.cars.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-xs font-semibold text-gray-900 mb-2">
                      Cars ({preset.config.cars.length} entries)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        // Group cars by slug and count occurrences
                        const carCounts = new Map<
                          string,
                          { count: number; carName: string; skinName?: string }
                        >();

                        preset.config.cars.forEach((carString) => {
                          const [carSlug, skinSlug] = carString.split("/");
                          const car = availableCars.find(
                            (c) => c.slug === carSlug,
                          );

                          if (car) {
                            const key = skinSlug
                              ? `${carSlug}/${skinSlug}`
                              : carSlug;

                            if (carCounts.has(key)) {
                              carCounts.get(key)!.count++;
                            } else {
                              carCounts.set(key, {
                                count: 1,
                                carName: car.name,
                                skinName: skinSlug,
                              });
                            }
                          }
                        });

                        return Array.from(carCounts.entries()).map(
                          ([key, data]) => (
                            <span
                              key={key}
                              className="px-2 py-1 bg-green-200 text-green-900 text-xs rounded flex items-center gap-1"
                              title={
                                data.skinName
                                  ? `${data.carName} - ${data.skinName}`
                                  : `${data.carName} - Random Skin`
                              }
                            >
                              <span>{data.carName}</span>
                              {data.skinName ? (
                                <span className="text-green-700">
                                  ({data.skinName})
                                </span>
                              ) : (
                                <span className="text-green-700 italic flex items-center gap-1">
                                  (🎲 Random)
                                </span>
                              )}
                              {data.count > 1 && (
                                <span className="font-semibold text-green-950">
                                  ×{data.count}
                                </span>
                              )}
                            </span>
                          ),
                        );
                      })()}
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
