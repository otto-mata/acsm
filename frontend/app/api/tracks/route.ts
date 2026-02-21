import { NextResponse } from "next/server";
import { Database } from "@/lib/db";

export async function GET() {
  try {
    const tracks = await getTracksFromDatabase();

    return NextResponse.json({ tracks });
  } catch (error: any) {
    console.error("Error fetching tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracks", details: error.message },
      { status: 500 },
    );
  }
}

async function getTracksFromDatabase() {
  const tracksData = await Database.instance.all(
    "SELECT id, name, slug, path FROM tracks ORDER BY name",
  );

  // Get layout count for each track
  const tracksWithLayoutCount = await Promise.all(
    tracksData.map(async (track: any) => {
      const layoutCountResult = await Database.instance.get(
        "SELECT COUNT(*) as count FROM track_layouts WHERE track_id = ?",
        [track.id],
      );

      return {
        id: track.id,
        name: track.name,
        slug: track.slug,
        path: track.path,
        layoutCount: layoutCountResult.count || 0,
      };
    }),
  );

  return tracksWithLayoutCount;
}
