import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  if (q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  // Bias the search to Vietnam since most pickups are local. Drop the
  // countrycodes filter if you want global coverage.
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
    q
  )}&limit=1&countrycodes=vn&accept-language=vi`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Ride-and-Rent (graduation project; team@liquidledger.io)",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not look up the address." },
        { status: 502 }
      );
    }

    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    if (data.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const top = data[0];
    return NextResponse.json({
      results: [
        {
          lat: Number(top.lat),
          lng: Number(top.lon),
          address: top.display_name,
        },
      ],
    });
  } catch {
    return NextResponse.json(
      { error: "Address service error." },
      { status: 502 }
    );
  }
}
