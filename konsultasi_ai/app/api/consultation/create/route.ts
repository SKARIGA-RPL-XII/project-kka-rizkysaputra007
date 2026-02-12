import { NextResponse } from 'next/server';
import pool from '../../../lib/db'; // Gunakan path relatif ini jika @/lib/db error

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log("📨 Data Masuk ke API Create:", body);

    const { userId, userName, symptoms, diagnosisData, metrics } = body;

    if (!userName || !symptoms) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const heartRate = metrics?.heartRate || null;
    const bloodSugar = metrics?.bloodSugar || null;
    const sleepDuration = metrics?.sleepDuration || null;

    const diagnosisJson = JSON.stringify(diagnosisData || {});

    const query = `
      INSERT INTO consultations 
      (user_id, user_name, symptoms, ai_diagnosis, heart_rate, blood_sugar, sleep_duration, created_at, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'pending')
    `;

    const values = [
      userId || null, 
      userName, 
      symptoms, 
      diagnosisJson, 
      heartRate, 
      bloodSugar, 
      sleepDuration
    ];

    const [result] = await pool.query(query, values);

    console.log("✅ Sukses Insert ke DB, ID:", (result as any).insertId);

    return NextResponse.json({ 
      success: true, 
      consultationId: (result as any).insertId 
    });

  } catch (error: any) {
    console.error("🔴 Error API Create:", error);
    return NextResponse.json({ 
      error: 'Gagal menyimpan ke database', 
      details: error.message 
    }, { status: 500 });
  }
}