"use client";

import { useState, useEffect } from "react";

interface TrackLayout {
  id: number;
  name: string;
  slug: string;
  path: string;
  preview: string | null;
}

interface Track {
  id: number;
  name: string;
  slug: string;
  path: string;
  layoutCount: number;
}

export const InstalledTracksManager = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTrack, setExpandedTrack] = useState<number | null>(null);
  const [loadedLayouts, setLoadedLayouts] = useState<
    Map<number, TrackLayout[]>
  >(new Map());
  const [loadingLayouts, setLoadingLayouts] = useState<Set<number>>(new Set());

  // Fetch installed tracks
  const fetchTracks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tracks");
      if (!response.ok) {
        throw new Error("Failed to fetch tracks");
      }
      const data = await response.json();
      setTracks(data.tracks || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching tracks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  // Filter tracks based on search
  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.slug.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const fetchTrackLayouts = async (trackId: number) => {
    // Check if layouts are already loaded
    if (loadedLayouts.has(trackId)) {
      return;
    }

    setLoadingLayouts((prev) => new Set(prev).add(trackId));

    try {
      const response = await fetch(`/api/tracks/${trackId}/layouts`);
      if (!response.ok) {
        throw new Error("Failed to fetch layouts");
      }
      const data = await response.json();
      setLoadedLayouts((prev) =>
        new Map(prev).set(trackId, data.layouts || []),
      );
    } catch (err: any) {
      console.error("Error fetching layouts:", err);
    } finally {
      setLoadingLayouts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(trackId);
        return newSet;
      });
    }
  };

  const toggleExpanded = async (trackId: number) => {
    const isCurrentlyExpanded = expandedTrack === trackId;
    setExpandedTrack(isCurrentlyExpanded ? null : trackId);

    // Fetch layouts if expanding and not already loaded
    if (!isCurrentlyExpanded && !loadedLayouts.has(trackId)) {
      await fetchTrackLayouts(trackId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading installed tracks...</p>
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
              Error Loading Tracks
            </h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchTracks}
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
          <h2 className="text-2xl font-bold text-gray-800">Installed Tracks</h2>
          <p className="text-gray-600 mt-1">
            {filteredTracks.length} of {tracks.length} tracks
            {searchTerm ? " (filtered)" : ""}
          </p>
        </div>
        <button
          onClick={fetchTracks}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tracks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tracks List */}
      {filteredTracks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">
            {searchTerm
              ? "No tracks match your search"
              : "No tracks installed yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTracks.map((track) => {
            const isExpanded = expandedTrack === track.id;
            const layouts = loadedLayouts.get(track.id) || [];
            const isLoadingLayouts = loadingLayouts.has(track.id);

            return (
              <div
                key={track.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
              >
                {/* Track Header */}
                <button
                  onClick={() => toggleExpanded(track.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {track.name}
                      </h3>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                        {track.layoutCount}{" "}
                        {track.layoutCount === 1 ? "layout" : "layouts"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{track.slug}</p>
                  </div>
                  <span
                    className={`text-2xl transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  >
                    ▼
                  </span>
                </button>

                {/* Layouts (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                    {isLoadingLayouts ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="ml-3 text-gray-600">
                          Loading layouts...
                        </span>
                      </div>
                    ) : layouts.length === 0 ? (
                      <p className="text-gray-600 text-center py-4">
                        No layouts found for this track
                      </p>
                    ) : (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                          Track Layouts ({layouts.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {layouts.map((layout) => (
                            <div
                              key={layout.id}
                              className="bg-white rounded-lg border border-gray-300 overflow-hidden hover:shadow-lg transition-shadow"
                            >
                              {/* Layout Preview */}
                              {layout.preview ? (
                                <div className="aspect-video bg-gray-200 overflow-hidden">
                                  <img
                                    src={layout.preview}
                                    alt={layout.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                                  <span className="text-4xl">🏁</span>
                                </div>
                              )}

                              {/* Layout Info */}
                              <div className="p-3">
                                <h5 className="font-medium text-gray-900 text-sm">
                                  {layout.name}
                                </h5>
                                <p className="text-xs text-gray-600 mt-1">
                                  {layout.slug}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
