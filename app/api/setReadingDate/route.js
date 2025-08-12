import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const { meter_id, reading_date, units } = await request.json();

    // Validate required fields
    if (!meter_id || !reading_date || units === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: meter_id, reading_date, units" },
        { status: 400 }
      );
    }

    // Validate types
    if (typeof meter_id !== "number" || typeof units !== "number") {
      return NextResponse.json(
        { error: "meter_id and units must be numbers" },
        { status: 400 }
      );
    }

    // Validate date
    const dateObj = new Date(reading_date);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // Insert into Neon database
    const result = await sql`
      INSERT INTO meter_readings (meter_id, reading_date, units)
      VALUES (${meter_id}, ${reading_date}, ${units});
    `;

    return NextResponse.json({
      success: true,
      message: "Reading saved successfully",
      data: result[0]
    });
  } catch (error) {
    console.error("Error saving reading:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
