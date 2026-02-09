import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  let model = null;

  // 1. INISIALISASI AI (Dibungkus aman)
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    // Cek apakah API Key ada
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Menggunakan 'gemini-pro' untuk stabilitas maksimal
      // Jika ingin model yang lebih cepat nanti, ubah menjadi 'gemini-1.5-flash'
            model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", // Coba ganti ke ini
        generationConfig: { responseMimeType: "application/json" }
      });
    } else {
      console.warn("⚠️ GOOGLE_GENAI_API_KEY tidak ditemukan. Aplikasi berjalan tanpa AI.");
    }
  } catch (error: any) {
    console.error("Gagal memuat library AI:", error.message);
  }

  try {
    // 2. BACA DATA REQUEST (Bungkus agar tidak crash jika data rusak)
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ 
        error: "Format permintaan salah. Harap kirim data JSON yang valid." 
      }, { status: 400 });
    }

    const { symptoms } = body;

    // 3. VALIDASI INPUT
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim() === "") {
      return NextResponse.json({ 
        error: "Mohon isi kolom gejala dengan teks." 
      }, { status: 400 });
    }

    console.log(`📨 Menerima gejala: "${symptoms}"`);

    // 4. EKSEKUSI AI
    if (model) {
      try {
        const prompt = `
          Anda adalah asisten medis. Berikan jawaban HANYA dalam format JSON MURNI (tanpa markdown, tanpa komentar tambahan).
          
          Struktur JSON yang diminta:
          {
            "condition": "Nama Penyakit/Gejala",
            "severity": "Rendah|Sedang|Tinggi",
            "description": "Penjelasan medis singkat",
            "advice": ["Saran 1", "Saran 2", "Saran 3"],
            "recommendation": "Rekomendasi tindakan akhir"
          }

          Analisis gejala berikut: "${symptoms}"
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();
        
        // Bersihkan format JSON jika AI memberikan tanda backtick (```json ... ```)
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Parsing JSON
        const parsedResult = JSON.parse(cleanText);
        
        console.log("✅ Berhasil mendapatkan respon AI.");
        return NextResponse.json(parsedResult);

      } catch (aiError: any) {
        console.warn("⚠️ AI Error:", aiError.message);
        // Jangan return disini, biarkan lanjut ke Fallback/Simulasi di bawah
      }
    }

    // 5. FALLBACK / SIMULASI (Jika AI gagal atau tidak ada API Key)
    console.log("🛠 Menggunakan Mode Simulasi...");
    const lowerSymptoms = symptoms.toLowerCase();
    let result = {};

    if (lowerSymptoms.includes("sakit kepala") || lowerSymptoms.includes("pusing") || lowerSymptoms.includes("migrain")) {
      result = {
        condition: "Sakit Kepala (Simulasi)",
        severity: "Sedang",
        description: "Simulasi: Anda mengalami ketidaknyamanan di area kepala. Bisa disebabkan kelelahan, stres, atau ketegangan mata.",
        advice: ["Istirahat sejenak dari layar gadget", "Minum air putih yang cukup", "Kompres kepala dengan air hangat/dingin"],
        recommendation: "Jika sakit berlanjut setelah istirahat, segera konsultasi ke dokter."
      };
    } else if (lowerSymptoms.includes("demam") || lowerSymptoms.includes("panas") || lowerSymptoms.includes("badan lemas")) {
      result = {
        condition: "Demam (Simulasi)",
        severity: "Sedang",
        description: "Simulasi: Kenaikan suhu tubuh yang menandakan sistem kekebalan sedang melawan infeksi.",
        advice: ["Perbanyak minum air mineral", "Kompres dahi dengan air hangat", "Gunakan pakaian tipis agar tidak kepanasan"],
        recommendation: "Pantau suhu tubuh. Jika di atas 38.5°C atau disertai menggigil, hubungi fasilitas kesehatan."
      };
    } else if (lowerSymptoms.includes("batuk") || lowerSymptoms.includes("pilek")) {
      result = {
        condition: "Infeksi Saluran Pernapasan Ringan (Simulasi)",
        severity: "Rendah",
        description: "Simulasi: Iritasi pada tenggorokan dan hidung.",
        advice: ["Minum madu dicampur air hangat", "Istirahat cukup", "Hindari debu dan asap rokok"],
        recommendation: "Jika sesak napas atau batuk berkepanjangan, segera ke dokter."
      };
    } else {
      result = {
        condition: "Gejala Umum (Simulasi)",
        severity: "Rendah",
        description: "Simulasi: Gejala yang Anda laporkan tidak spesifik terhadap database simulasi.",
        advice: ["Jaga pola makan sehat", "Tidur minimal 7-8 jam", "Kelola stres dengan baik"],
        recommendation: "Observasi gejala Anda selama 24 jam. Jika memburuk, segera periksa ke dokter."
      };
    }

    return NextResponse.json(result);

  } catch (error: any) {
    // ERROR CATCHING TERAKHIR
    console.error("❌ FATAL SYSTEM ERROR:", error.message);
    
    return NextResponse.json({ 
      error: "Terjadi kesalahan sistem internal.",
      details: error.message // Hanya untuk debugging, bisa dihapus jika ingin produksi
    }, { status: 500 });
  }
}