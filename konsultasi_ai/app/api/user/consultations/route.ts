// app/api/user/consultations/route.ts
import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID diperlukan' }, { status: 400 });
    }

    // Query ini SUDAH mengambil doctor_reply
    const query = `
      SELECT 
        id, 
        user_name, 
        symptoms, 
        ai_diagnosis, 
        doctor_reply,  <-- PASTIKAN BARIS INI ADA
        status, 
        created_at,
        heart_rate,
        blood_sugar,
        sleep_duration
      FROM consultations 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.query(query, [userId]);
    return NextResponse.json(rows);

  } catch (error: any) {
    console.error("Gagal mengambil consultations:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}