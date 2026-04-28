import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "Invalid coordinates." },
      { status: 400 }
    );
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json(
      { error: "Coordinates out of range." },
      { status: 400 }
    );
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Ride-and-Rent (graduation project; team@liquidledger.io)",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not look up the address." },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { display_name?: string };
    return NextResponse.json({
      address: data.display_name ?? "",
    });
  } catch {
    return NextResponse.json(
      { error: "Address service error." },
      { status: 502 }
    );
  }
}
