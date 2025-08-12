import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const meter_id = searchParams.get("meter_id");
   

    if (!meter_id) {
      return NextResponse.json({ error: "meter_id parameter is required" }, { status: 400 });
    }

    const meterIdNum = parseInt(meter_id, 10);
    if (isNaN(meterIdNum)) {
      return NextResponse.json({ error: "meter_id must be a valid number" }, { status: 400 });
    }

    const result = await sql`
      SELECT * FROM meter_readings
      WHERE meter_id = ${meterIdNum}
      ORDER BY reading_date DESC
      LIMIT 1;
    `;
    console.log("Fetched reading:", result);

    if (result.length === 0) {
      return NextResponse.json({ error: "No reading found for this meter" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching reading:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
