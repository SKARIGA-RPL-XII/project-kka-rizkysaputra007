import { NextResponse } from 'next/server';
import pool from '../../../lib/db'; 

export async function GET(req: Request) {
  try {
    // Query untuk mengambil data login history dari tabel login_history
    // Diurutkan dari yang terbaru (DESC) dan dibatasi 50 data terakhir
    const query = `
      SELECT id, user_id, email, login_time, status 
      FROM login_history 
      ORDER BY login_time DESC 
      LIMIT 50
    `;

    const [rows] = await pool.query(query);

    return NextResponse.json(rows);

  } catch (error: any) {
    console.error("Error fetch login history:", error);
    return NextResponse.json({ error: 'Gagal mengambil data riwayat login' }, { status: 500 });
  }
}