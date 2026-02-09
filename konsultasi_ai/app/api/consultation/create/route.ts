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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, userName, symptoms, diagnosisData } = body;

    // Format data diagnosa menjadi string yang mudah dibaca dokter
    const diagnosisText = `
KONDISI: ${diagnosisData.condition}
TINGKAT KEPARAHAN: ${diagnosisData.severity}
DESKRIPSI: ${diagnosisData.description}
SARAN: ${diagnosisData.advice.join(', ')}
REKOMENDASI: ${diagnosisData.recommendation}
    `.trim();

    // Simpan ke Database
    await query(
      'INSERT INTO consultations (user_id, user_name, symptoms, ai_diagnosis, status) VALUES (?, ?, ?, ?, ?)',
      [userId, userName, symptoms, diagnosisText, 'pending']
    );

    return NextResponse.json({ success: true, message: 'Konsultasi dikirim ke antrian dokter.' });

  } catch (error: any) {
    console.error("Error saving consultation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}