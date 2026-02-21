import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/lib/db";

interface CarSkin {
  id: number;
  name: string;
  slug: string;
  path: string;
  preview: string | null;
}

async function getCarSkinsFromDatabase(carId: number): Promise<CarSkin[]> {
  const skins = await Database.instance.all<any>(
    "SELECT * FROM car_skins WHERE car_id = ? ORDER BY name",
    [carId],
  );

  return skins.map((skin) => ({
    id: skin.id,
    name: skin.name,
    slug: skin.slug,
    path: skin.path,
    preview: skin.preview
      ? `data:image/jpeg;base64,${Buffer.from(skin.preview).toString("base64")}`
      : null,
  }));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const carId = parseInt(id, 10);

    if (isNaN(carId)) {
      return NextResponse.json({ error: "Invalid car ID" }, { status: 400 });
    }

    const skins = await getCarSkinsFromDatabase(carId);
    return NextResponse.json({ skins }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching car skins:", error);
    return NextResponse.json(
      { error: "Failed to fetch car skins", message: error.message },
      { status: 500 },
    );
  }
}
