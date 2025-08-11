// app/api/readings/route.js
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const meter_id = searchParams.get('meter_id');

    if (!meter_id || !['1', '2'].includes(meter_id)) {
      return NextResponse.json(
        { error: 'meter_id query parameter is required and must be 1 or 2' },
        { status: 400 }
      );
    }

    const readings = await sql`
      SELECT id, meter_id, reading_date, total_units
      FROM meter_reading
      WHERE meter_id = ${Number(meter_id)}
      ORDER BY reading_date DESC
    `;

    return NextResponse.json({ readings });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
