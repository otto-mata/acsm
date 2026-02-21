import { NextResponse } from "next/server";
import { Database } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const trackId = parseInt(id);

    if (isNaN(trackId)) {
      return NextResponse.json({ error: "Invalid track ID" }, { status: 400 });
    }

    const layouts = await getTrackLayoutsFromDatabase(trackId);

    return NextResponse.json({ layouts });
  } catch (error: any) {
    console.error("Error fetching track layouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch track layouts", details: error.message },
      { status: 500 },
    );
  }
}

async function getTrackLayoutsFromDatabase(trackId: number) {
  const layoutsData = await Database.instance.all(
    "SELECT id, name, slug, path, preview FROM track_layouts WHERE track_id = ? ORDER BY name",
    [trackId],
  );

  // Convert BLOB preview to base64 if it exists
  const layoutsWithPreview = layoutsData.map((layout: any) => ({
    id: layout.id,
    name: layout.name,
    slug: layout.slug,
    path: layout.path,
    preview: layout.preview
      ? `data:image/png;base64,${Buffer.from(layout.preview).toString("base64")}`
      : null,
  }));

  return layoutsWithPreview;
}
