// app/api/readings/route.js
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const { meter_id, reading_date, total_units } = await request.json();

    if (
      !meter_id ||
      ![1, 2].includes(meter_id) ||
      !reading_date ||
      typeof total_units !== 'number' ||
      total_units < 0
    ) {
      return NextResponse.json(
        { error: 'Invalid input. Please check all fields.' },
        { status: 400 }
      );
    }

    // Insert into DB
    await sql`
      INSERT INTO meter_reading (meter_id, reading_date, total_units)
      VALUES (${meter_id}, ${reading_date}, ${total_units})
    `;

    return NextResponse.json({ success: true, message: 'Reading saved' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
