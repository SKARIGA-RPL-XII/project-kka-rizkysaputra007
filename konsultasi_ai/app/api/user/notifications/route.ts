import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'kesehatan_ai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function query(sql: string, params?: any[]) {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    await connection.end();
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    // Fallback user ID
    const targetUserId = userId ? userId : 1; 

    // Ambil konsultasi yang statusnya 'replied' (Dokter sudah balas)
    const notifications = await query(`
      SELECT id, user_name, symptoms, doctor_reply, created_at 
      FROM consultations 
      WHERE user_id = ? AND status = 'replied' 
      ORDER BY created_at DESC
    `, [targetUserId]) as any[];

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}