import { NextResponse } from "next/server";
import { Database } from "@/lib/db";

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

async function getCarsFromDatabase(): Promise<Car[]> {
  const cars = await Database.instance.all<any>(
    "SELECT * FROM cars ORDER BY brand, name",
  );

  if (cars.length === 0) {
    return [];
  }

  return cars;
}

export async function GET() {
  try {
    const cars = await getCarsFromDatabase();
    return NextResponse.json({ cars }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching cars:", error);
    return NextResponse.json(
      { error: "Failed to fetch cars", message: error.message },
      { status: 500 },
    );
  }
}
