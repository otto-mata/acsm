"use client";

import { useState, useEffect } from "react";

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
  skins: CarSkin[];
}

export const InstalledCarsManager = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [expandedCar, setExpandedCar] = useState<number | null>(null);
  const [loadedSkins, setLoadedSkins] = useState<Map<number, CarSkin[]>>(
    new Map(),
  );
  const [loadingSkins, setLoadingSkins] = useState<Set<number>>(new Set());

  // Fetch installed cars
  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cars");
      if (!response.ok) {
        throw new Error("Failed to fetch cars");
      }
      const data = await response.json();
      setCars(data.cars || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching cars:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Get unique brands for filter
  const brands = Array.from(new Set(cars.map((car) => car.brand))).sort();

  // Filter cars based on search and brand
  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand === "all" || car.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  const fetchCarSkins = async (carId: number) => {
    // Check if skins are already loaded
    if (loadedSkins.has(carId)) {
      return;
    }

    setLoadingSkins((prev) => new Set(prev).add(carId));

    try {
      const response = await fetch(`/api/cars/${carId}/skins`);
      if (!response.ok) {
        throw new Error("Failed to fetch skins");
      }
      const data = await response.json();
      setLoadedSkins((prev) => new Map(prev).set(carId, data.skins || []));
    } catch (err: any) {
      console.error("Error fetching skins:", err);
    } finally {
      setLoadingSkins((prev) => {
        const newSet = new Set(prev);
        newSet.delete(carId);
        return newSet;
      });
    }
  };

  const toggleExpanded = async (carId: number) => {
    const isCurrentlyExpanded = expandedCar === carId;
    setExpandedCar(isCurrentlyExpanded ? null : carId);

    // Fetch skins if expanding and not already loaded
    if (!isCurrentlyExpanded && !loadedSkins.has(carId)) {
      await fetchCarSkins(carId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading installed cars...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="text-red-800 font-semibold mb-1">
              Error Loading Cars
            </h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchCars}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Installed Cars</h2>
          <p className="text-gray-600 mt-1">
            {filteredCars.length} of {cars.length} cars
            {searchTerm || selectedBrand !== "all" ? " (filtered)" : ""}
          </p>
        </div>
        <button
          onClick={fetchCars}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search cars by name, brand, or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="sm:w-64">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Brands ({cars.length})</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand} ({cars.filter((c) => c.brand === brand).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cars List */}
      {filteredCars.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <span className="text-6xl mb-4 block">🏎️</span>
          <p className="text-gray-600 text-lg">
            {cars.length === 0
              ? "No cars installed on the server"
              : "No cars match your filters"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCars.map((car) => {
            const isExpanded = expandedCar === car.id;
            const carSkins = loadedSkins.get(car.id) || car.skins;
            const isLoadingSkins = loadingSkins.has(car.id);
            return (
              <div
                key={car.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Car Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(car.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏎️</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {car.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-600">
                              {car.brand}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500 font-mono">
                              {car.slug}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        className={`text-gray-400 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Car Details (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Path:
                      </h4>
                      <p className="text-sm text-gray-600 font-mono bg-white px-3 py-2 rounded border border-gray-200">
                        {car.path}
                      </p>
                    </div>

                    {isLoadingSkins ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">
                            Loading skins...
                          </p>
                        </div>
                      </div>
                    ) : carSkins.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Available Skins ({carSkins.length}):
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {carSkins.map((skin) => (
                            <div
                              key={skin.id}
                              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                            >
                              {skin.preview ? (
                                <div className="relative aspect-video bg-gray-100">
                                  <img
                                    src={skin.preview}
                                    alt={skin.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                  <span className="text-4xl opacity-30">
                                    🏎️
                                  </span>
                                </div>
                              )}
                              <div className="p-3">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {skin.name}
                                </p>
                                <p className="text-xs text-gray-500 font-mono mt-1 truncate">
                                  {skin.slug}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {cars.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="text-3xl font-bold text-blue-700">
              {cars.length}
            </div>
            <div className="text-sm text-blue-600 mt-1">Total Cars</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="text-3xl font-bold text-purple-700">
              {brands.length}
            </div>
            <div className="text-sm text-purple-600 mt-1">Brands</div>
          </div>
        </div>
      )}
    </div>
  );
};
