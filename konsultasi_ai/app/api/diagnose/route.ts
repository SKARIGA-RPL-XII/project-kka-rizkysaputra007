import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    // 1. Cek API Key secara eksplisit di dalam fungsi
    const apiKey = process.env.GEMINI_API_KEY;
    
    console.log("🔑 CHECK: Apakah API Key ada?", !!apiKey);

    if (!apiKey) {
      return NextResponse.json({ 
        error: "Server Error: API Key tidak ditemukan di server." 
      }, { status: 500 });
    }

    // 2. Inisialisasi Model DI DALAM try/catch (Lebih aman)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { symptoms, metrics } = await req.json();

    // 3. Prompt Sederhana
    const prompt = `
      Analisa keluhan ini: "${symptoms}".
      Data vital: HR ${metrics?.heartRate}, Sugar ${metrics?.bloodSugar}, Sleep ${metrics?.sleepDuration}.
      Return JSON only with keys: condition, severity, description, advice (array), recommendation, riskFactors (array), medications (array name,dosage).
    `;

    console.log("🚀 Request ke Gemini...");

    // 4. Generate
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("📨 Response Raw:", responseText.substring(0, 50) + "...");

    // 5. Bersihkan & Parse JSON
    const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleaned);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("🔴 DETAIL ERROR DI ROUTE /api/diagnose:");
    console.error("Nama Error:", error.name);
    console.error("Pesan:", error.message);
    console.error("Stack:", error.stack);

    return NextResponse.json({ 
      error: 'Internal Server Error', 
      debugInfo: error.message // Bisa dilihat di Network tab browser
    }, { status: 500 });
  }
}