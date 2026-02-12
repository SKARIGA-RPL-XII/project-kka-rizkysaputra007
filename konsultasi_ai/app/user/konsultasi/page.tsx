"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Send, Mic, BrainCircuit, User, Bot, 
  CheckCircle, Stethoscope, Loader2, AlertCircle, 
  Activity, Tag, Sparkles, Heart, Moon, Droplets,
  ChevronDown, ChevronUp
} from "lucide-react";

// --- TYPING & INTERFACES ---
type MessageSender = "user" | "ai";

type Message = {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date;
  type?: "text" | "diagnosis" | "error";
  diagnosisData?: DiagnosisResult;
  symptoms?: string; 
  metrics?: HealthMetrics;
  isManual?: boolean; // Flag baru untuk membedakan manual bot
};

interface HealthMetrics {
  heartRate?: string;
  sleepDuration?: string;
  bloodSugar?: string;
}

interface DiagnosisResult {
  condition: string;
  severity: "Rendah" | "Sedang" | "Tinggi";
  description: string;
  advice: string[];
  recommendation: string;
  riskFactors?: string[]; 
  medications?: { name: string; dosage: string }[];
}

const COMMON_DISEASES = [
  "Demam Tinggi", "Flu & Batuk", "Sakit Kepala (Migrain)", 
  "Maag / Asam Lambung", "Nyeri Sendi", "Diabetes (Kencing Manis)", 
  "Hipertensi (Tekanan Darah Tinggi)", "Gatal & Ruam Kulit", 
  "Sesak Napas", "Insomnia (Susah Tidur)", "Diare", "Lemas & Lesu",
  "Alergi Makanan/Debu", "Sakit Tenggorokan", "Pusing Berputar (Vertigo)",
  "Nyeri Punggung Bawah", "Sariawan", "Batuk Kering", "Kram Perut", "Flu Mata"
];

export default function KonsultasiAIPage() {
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Halo! Saya asisten diagnosa AI. Silakan jelaskan keluhan Anda.",
      sender: "ai",
      timestamp: new Date(),
      type: "text"
    },
  ]);
  
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmittingToDoctor, setIsSubmittingToDoctor] = useState(false);
  
  // State Form Vital
  const [heartRate, setHeartRate] = useState("");
  const [sleepDuration, setSleepDuration] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [isVitalsExpanded, setIsVitalsExpanded] = useState(false); // State baru untuk collapsible
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing, isSubmittingToDoctor]);

  const handleQuickSelect = (disease: string) => {
    setInput(prev => prev ? `${prev}, ${disease}` : disease);
  };

  // --- FUNGSI BOT MANUAL (FALLBACK) ---
    // --- FUNGSI BOT MANUAL (FALLBACK) - VERSI DIPERLUAS ---
  const getManualDiagnosis = (symptoms: string, metrics?: HealthMetrics): DiagnosisResult => {
    const lowerSym = symptoms.toLowerCase();
    
    // Struktur Default
    let condition = "Keluhan Umum";
    let severity: "Rendah" | "Sedang" | "Tinggi" = "Rendah";
    let advice: string[] = ["Istirahat yang cukup.", "Perbanyak minum air putih.", "Konsumsi makanan bergizi."];
    let medications: { name: string; dosage: string }[] = [];
    let riskFactors: string[] = [];

    // --- PRIORITAS 1: KONDISI KRITIS (SEVERITY TINGGI) ---
    if (lowerSym.includes("sesak") || lowerSym.includes("napas berat") || lowerSym.includes("dada sesak")) {
      condition = "Gangguan Pernapasan Akut";
      severity = "Tinggi";
      advice = [
        "Segera berhenti aktivitas fisik.",
        "Posisikan tubuh duduk tegak dan bersandar.",
        "Buka jendela untuk sirkulasi udara.",
        "JANGAN MENUNGGU, segera ke IGD jika sesak tidak reda dalam 5 menit."
      ];
      medications = [{ name: "Oksigen Tambahan", dosage: "Jika tersedia" }];
      riskFactors = ["Riwayat Asma", "Penyakit Paru-Paru", "Penyakit Jantung", "Obesitas"];
    }
    // PRIORITAS 2: JANTUNG DARAH TINGGI (Metrik)
    else if (metrics?.heartRate && parseInt(metrics.heartRate) > 120) {
      condition = "Takikardia (Detak Jantung Cepat)";
      severity = "Tinggi";
      advice = [
        "Duduk atau berbaring dengan tenang.",
        "Tarik napas dalam secara perlahan.",
        "Hindari konsumsi kafein dan nikotin.",
        "Periksa ke dokter spesialis jantung segera."
      ];
      medications = [{ name: "Beta-Blocker", dosage: "Sesuai resep dokter" }];
      riskFactors = ["Stres berlebihan", "Anemia", "Masalah Tiroid", "Gaya hidup tidak sehat"];
    }
    // PRIORITAS 3: DIABETES / GULA DARAH (Metrik)
    else if (metrics?.bloodSugar && parseInt(metrics.bloodSugar) > 200) {
      condition = "Hiperglikemia (Gula Darah Sangat Tinggi)";
      severity = "Tinggi";
      advice = [
        "Minum air putih banyak-banyak.",
        "Hindari makanan manis dan karbohidrat sederhana.",
        "Lakukan aktivitas ringan berjalan kaki 15 menit.",
        "Cek kembali gula darah dalam 1-2 jam."
      ];
      medications = [{ name: "Insulin", dosage: "Sesuai resep dokter" }, { name: "Metformin", dosage: "Sesuai resep dokter" }];
      riskFactors = ["Riwayat Diabetes", "Obesitas", "Polimakanan", "Kurang aktivitas fisik"];
    }
    // --- PRIORITAS 4: NEUROLOGI (Saraf & Otak) ---
    else if (lowerSym.includes("pusing") || lowerSym.includes("sakit kepala") || lowerSym.includes("migrain") || lowerSym.includes("vertigo")) {
      condition = lowerSym.includes("vertigo") ? "Vertigo (Pusing Berputar)" : "Sakit Kepala (Migrain / Tegang)";
      severity = "Sedang";
      advice = [
        "Cari ruangan yang tenang dan minim cahaya.",
        "Kompres bagian kepala dengan air es atau hangat.",
        "Hindari gadget (HP/Laptop) selama 1 jam.",
        "Minum obat pereda nyeri jika perlu."
      ];
      medications = [{ name: "Paracetamol", dosage: "500mg per 6 jam" }, { name: "Sumatriptan", dosage: "Hanya jika migrain parah" }];
      riskFactors = ["Stres / Tegang", "Dehidrasi", "Kurang Tidur", "Masalah Tulang Leher"];
    }
    // --- PRIORITAS 5: PENCERNAAN ---
    else if (lowerSym.includes("maag") || lowerSym.includes("asam lambung") || lowerSym.includes("perut mual") || lowerSym.includes("mulas") || lowerSym.includes("berak") || lowerSym.includes("diare")) {
      condition = "Gangguan Pencernaan (Maag / Infeksi Usus)";
      severity = "Sedang";
      advice = [
        "Hindari makanan pedas, asam, dan berminyak.",
        "Makan dalam porsi kecil tapi sering.",
        "Konsumsi makanan yang mudah dicerna (bubur, pisang).",
        "Perbanyak minum oralit untuk mengganti cairan tubuh."
      ];
      medications = [{ name: "Antasida (Promag)", dosage: "1x sebelum makan" }, { name: "Zincat", dosage: "Sesuai dosis" }];
      riskFactors = ["Polamakanan tidak teratur", "Stres", "Infeksi Bakteri", "Alergi Makanan"];
    }
    // --- PRIORITAS 6: PERNAFASAN (Tidak Kritis) ---
    else if (lowerSym.includes("batuk") || lowerSym.includes("flu") || lowerSym.includes("pilek") || lowerSym.includes("tenggorokan")) {
      condition = "Infeksi Saluran Pernapasan (Flu / Batuk)";
      severity = "Sedang";
      advice = [
        "Gunakan masker saat berada di dekat orang lain.",
        "Kompres dada dengan air hangat.",
        "Rajin mencuci tangan dengan sabun.",
        "Konsumsi makanan kaya vitamin C (Jeruk, Sayuran)."
      ];
      medications = [{ name: "Obat Batuk Pilek", dosage: "3x sehari" }, { name: "Paracetamol", dosage: "Jika demam" }];
      riskFactors = ["Kekebalan tubuh lemah", "Pergantian musim", "Paparan asap rokok"];
    }
    // --- PRIORITAS 7: MUSKULOSKELETAL ---
    else if (lowerSym.includes("nyeri sendi") || lowerSym.includes("kaki sakit") || lowerSym.includes("pegal") || lowerSym.includes("tulang")) {
      condition = "Nyeri Otot & Sendi (Rematik / Cedera Ringan)";
      severity = "Rendah";
      advice = [
        "Istirahatkan bagian yang sakit.",
        "Kompres dingin pada area nyeri selama 15-20 menit.",
        "Hindari aktivitas berat sementara.",
        "Lakukan peregangan ringan setelah nyeri berkurang."
      ];
      medications = [{ name: "Ibuprofen", dosage: "400mg setelah makan" }, { name: "Krim Antiradang", dosage: "Oles 2x sehari" }];
      riskFactors = ["Aktivitas berat berlebihan", "Postur tubuh salah", "Penuaan"];
    }
    // --- PRIORITAS 8: KULIT ---
    else if (lowerSym.includes("gatal") || lowerSym.includes("kulit merah") || lowerSym.includes("panu") || lowerSym.includes("ruam")) {
      condition = "Iritasi / Alergi Kulit";
      severity = "Rendah";
      advice = [
        "Jangan digaruk agar tidak infeksi.",
        "Gunakan bedak dingin atau salep anti-gatal.",
        "Hindari sabun mandi yang keras.",
        "Kenakan pakaian berbahan katun longgar."
      ];
      medications = [{ name: "Salep Anti-Gatal (Calamine)", dosage: "Oles 3x sehari" }, { name: "Antihistamin", dosage: "Sesuai dosis" }];
      riskFactors = ["Alergi Makanan/Debu/Debu", "Gigitan Serangga", "Kulit Kering"];
    }
    // --- PRIORITAS 9: METABOLIK / UMUM ---
    else if (lowerSym.includes("lemas") || lowerSym.includes("letih") || lowerSym.includes("lapar berlebih") || lowerSym.includes("berat badan turun")) {
      condition = "Kelelahan & Gangguan Metabolik";
      severity = "Sedang";
      advice = [
        "Cek tekanan darah dan gula darah.",
        "Tidur minimal 7-8 jam per malam.",
        "Konsumsi makanan bernutrisi tinggi (Telur, Daging, Sayur Hijau).",
        "Istirahat total 1-2 hari."
      ];
      medications = [{ name: "Multivitamin", dosage: "1x sehari" }];
      riskFactors = ["Anemia", "Hipertiroid", "Depresi", "Diabetes tidak terdiagnosis"];
    }

    // --- PEMERIKSAAN TAMBAHAN DARI METRICS (BERDASARKAN KONDISI UTAMA) ---
    if (metrics?.heartRate && parseInt(metrics.heartRate) > 100 && condition !== "Takikardia") {
      if (severity !== "Tinggi") severity = "Sedang";
      riskFactors.push("Detak jantung meningkat (Tahap Waspada)");
    }
    if (metrics?.bloodSugar && parseInt(metrics.bloodSugar) > 140 && condition !== "Hiperglikemia") {
      if (severity !== "Tinggi") severity = "Sedang";
      riskFactors.push("Gula darah di atas normal (Pra-diabetes)");
    }
    if (metrics?.sleepDuration && parseFloat(metrics.sleepDuration) < 5) {
      riskFactors.push("Kurang tidur (Insomnia)");
    }

    // --- REKOMENDASI FINAL ---
    let recommendation = "Pantau perkembangan gejala Anda. Jika tidak kunjung membaik dalam 3 hari, segera konsultasi ke fasilitas kesehatan terdekat.";
    if (severity === "Tinggi") {
      recommendation = "KONDISI ANDA MENUNJUKKAN GEJALA YANG MEMBUTUHKAN PERHATIAN MEDIS SEGERA. Jangan abaikan gejala ini.";
    }

    return {
      condition,
      severity,
      description: "Analisa berdasarkan protokol medis dasar. (Catatan: Sistem AI utama sedang tidak dapat diakses, maka digunakan logika manual berbasis kriteria ini sebagai alternatif).",
      advice,
      recommendation,
      riskFactors: riskFactors,
      medications
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isAnalyzing) return;

    const userSymptoms = input; 
    const metrics: HealthMetrics = {
      heartRate: heartRate || undefined,
      sleepDuration: sleepDuration || undefined, 
      bloodSugar: bloodSugar || undefined,
    };

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userSymptoms,
      sender: "user",
      timestamp: new Date(),
      type: "text",
      metrics 
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); 
    setHeartRate("");
    setSleepDuration("");
    setBloodSugar("");
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symptoms: userSymptoms,
          metrics: metrics 
        }),
      });

      if (!response.ok) throw new Error("Gagal menghubungi server diagnosis.");

      const data: DiagnosisResult = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Berdasarkan analisa gejala dan data vital Anda:",
        sender: "ai",
        timestamp: new Date(),
        type: "diagnosis",
        diagnosisData: data,
        symptoms: userSymptoms,
        metrics: metrics
      };
      
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error: any) {
      // JIKA AI ERROR, GUNAKAN BOT MANUAL
      console.warn("AI Down, switching to Manual Bot");
      const manualData = getManualDiagnosis(userSymptoms, metrics);

      const manualMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "AI Diagnosa sedang tidak dapat diakses. Berikut adalah analisa berdasarkan protokol standar:",
        sender: "ai",
        timestamp: new Date(),
        type: "diagnosis",
        diagnosisData: manualData,
        symptoms: userSymptoms,
        metrics: metrics,
        isManual: true // Tandai ini sebagai hasil manual
      };
      
      setMessages((prev) => [...prev, manualMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConsultDoctor = async (diagnosisData: DiagnosisResult, originalSymptoms: string, metrics?: HealthMetrics) => {
    setIsSubmittingToDoctor(true);

    const userStr = localStorage.getItem("user");
    let userId = 0;
    let userName = "Guest";

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user.id || 0;
        userName = user.name || "User";
      } catch (e) { console.error("Gagal parsing user", e); }
    }

    try {
      const res = await fetch('/api/consultation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          userName, 
          symptoms: originalSymptoms, 
          diagnosisData,
          metrics 
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server Error ${res.status}: ${errorText}`);
      }

      const result = await res.json();

      if (result.success) {
        if (result.consultationId) {
          localStorage.setItem("latestConsultationId", String(result.consultationId));
        }
        router.push("/user/chat-dokter");
      } else {
        alert("Gagal mengirim ke dokter: " + (result.error || "Terjadi kesalahan"));
      }
    } catch (error: any) {
      console.error("Error handleConsultDoctor:", error);
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setIsSubmittingToDoctor(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0B1121] text-slate-100 font-sans overflow-hidden relative">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-purple-500/10 rounded-full blur-[80px]"></div>
      </div>
      
      {/* HEADER */}
      <header className="relative z-20 border-b border-white/5 bg-[#0B1121]/80 backdrop-blur-xl p-4 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2.5 rounded-full hover:bg-white/5 transition-colors text-slate-400 hover:text-white border border-transparent hover:border-white/10">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <h1 className="font-bold text-base leading-tight tracking-tight text-white">AI Diagnosa Medis</h1>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-emerald-400 font-medium">Online • Ready</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-medium text-slate-300">DB Sync: Active</span>
          </div>
        </div>
      </header>

      {/* CHAT AREA */}
      <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full space-y-8 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[90%] md:max-w-[85%] gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
              
              {/* AVATAR */}
              <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center border border-white/5 shadow-sm mt-1 ${
                msg.sender === "user" 
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600" 
                  : "bg-slate-800"
              }`}>
                {msg.sender === "user" ? <User className="w-4 h-4 text-white" /> : <BrainCircuit className="w-4 h-4 text-cyan-400" />}
              </div>

              {/* TEXT BUBBLE */}
              {msg.type === "text" && (
                <div className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                   {msg.sender === "user" && msg.metrics && (
                     <div className="mb-1 flex flex-wrap gap-2 justify-end opacity-70 scale-90 origin-bottom-right">
                        {msg.metrics.heartRate && <span className="px-2 py-0.5 rounded bg-slate-700 text-[10px] text-rose-300 flex items-center gap-1"><Heart className="w-3 h-3"/> {msg.metrics.heartRate} bpm</span>}
                        {msg.metrics.bloodSugar && <span className="px-2 py-0.5 rounded bg-slate-700 text-[10px] text-blue-300 flex items-center gap-1"><Droplets className="w-3 h-3"/> {msg.metrics.bloodSugar} mg/dL</span>}
                        {msg.metrics.sleepDuration && <span className="px-2 py-0.5 rounded bg-slate-700 text-[10px] text-indigo-300 flex items-center gap-1"><Moon className="w-3 h-3"/> {msg.metrics.sleepDuration} Jam</span>}
                     </div>
                   )}
                  <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                    msg.sender === "user" 
                      ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-sm" 
                      : "bg-slate-800/60 backdrop-blur-sm text-slate-200 rounded-tl-sm border border-white/5"
                  }`}>
                    {msg.text}
                    <div suppressHydrationWarning className={`text-[9px] mt-1 opacity-60 ${msg.sender === "user" ? "text-right text-cyan-50" : "text-left text-slate-500"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              )}

              {/* ERROR BUBBLE */}
              {msg.type === "error" && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm flex items-start gap-3 shadow-sm backdrop-blur-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-1">Terjadi Kesalahan</span>
                    <span>{msg.text}</span>
                  </div>
                </div>
              )}

              {/* DIAGNOSIS CARD */}
              {msg.type === "diagnosis" && msg.diagnosisData && (
                <div className="w-full bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-black/20 animate-fade-in">
                  {/* Header Card - Warna beda jika manual */}
                  <div className={`bg-gradient-to-r ${
                    msg.isManual 
                      ? "from-amber-900/30 to-slate-900/30 border-amber-500/20" 
                      : "from-cyan-900/30 to-slate-900/30"
                  } p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-start justify-between gap-4`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg border ${
                           msg.isManual 
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                            : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                        }`}>
                          {msg.isManual ? <Stethoscope className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-widest ${
                          msg.isManual ? "text-amber-400" : "text-cyan-400"
                        }`}>
                          {msg.isManual ? "Analisa Manual (Fallback)" : "Hasil Analisa AI"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white leading-tight">{msg.diagnosisData.condition}</h3>
                    </div>
                    <div className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border flex items-center gap-2 shadow-sm ${
                      msg.diagnosisData.severity === "Tinggi" ? "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10" :
                      msg.diagnosisData.severity === "Sedang" ? "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10" :
                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10"
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        msg.diagnosisData.severity === "Tinggi" ? "bg-rose-400" :
                        msg.diagnosisData.severity === "Sedang" ? "bg-amber-400" :
                        "bg-emerald-400"
                      }`} />
                      {msg.diagnosisData.severity}
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    <p className="text-sm text-slate-300 leading-relaxed">{msg.diagnosisData.description}</p>
                    {msg.diagnosisData.riskFactors && msg.diagnosisData.riskFactors.length > 0 && (
                      <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
                         <h4 className="text-xs font-bold text-rose-300 uppercase mb-2 flex items-center gap-2">
                           <Activity className="w-3.5 h-3.5" /> Faktor Risiko Terdeteksi
                         </h4>
                         <ul className="list-disc list-inside text-xs text-rose-100/80 space-y-1">
                            {msg.diagnosisData.riskFactors.map((risk, i) => (
                              <li key={i}>{risk}</li>
                            ))}
                         </ul>
                      </div>
                    )}
                    <div className="bg-slate-900/40 rounded-xl p-4 border border-white/5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <Stethoscope className="w-3.5 h-3.5 text-cyan-500" /> Saran Tindakan:
                      </h4>
                      <ul className="space-y-2.5">
                        {msg.diagnosisData.advice.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs mt-0.5 border border-cyan-500/20">
                              {idx + 1}
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {msg.diagnosisData.medications && msg.diagnosisData.medications.length > 0 && (
                      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-blue-300 uppercase mb-3 flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5" /> Obat Pendukung (Umum)
                        </h4>
                        <div className="space-y-2">
                          {msg.diagnosisData.medications.map((med, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0">
                              <span className="font-medium text-blue-100">{med.name}</span>
                              <span className="text-xs text-blue-300/70 bg-blue-900/20 px-2 py-1 rounded">{med.dosage}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl flex gap-3">
                      <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-indigo-200/90 leading-relaxed italic">
                        {msg.diagnosisData.recommendation}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-800/50 border-t border-white/5">
                    <button 
                      onClick={() => handleConsultDoctor(msg.diagnosisData!, msg.symptoms!, msg.metrics)}
                      disabled={isSubmittingToDoctor}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {isSubmittingToDoctor ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Mengirim ke Dokter...
                        </>
                      ) : (
                        <>
                          <Stethoscope className="w-4 h-4" />
                          Konsultasi Lanjut ke Dokter
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isAnalyzing && (
          <div className="flex justify-center my-2">
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-xl">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              <span className="text-sm text-slate-300 font-medium">Menganalisis gejala & data vital...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* INPUT AREA - FOOTER */}
      <footer className="relative z-20 shrink-0 bg-[#0B1121]/95 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-3">
          
          {/* --- COLLAPSIBLE FORMULIR KESEHATAN (REDESIGN) --- */}
          <div className="bg-slate-800/30 rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
            <button 
              onClick={() => setIsVitalsExpanded(!isVitalsExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-cyan-400 transition-colors bg-slate-900/50 hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3" />
                <span>Data Vital (Opsional)</span>
              </div>
              {isVitalsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {/* AREA ISI FORM (DILIPAT) */}
            {isVitalsExpanded && (
              <div className="px-4 pb-4 animate-fade-in-up grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-white/5 pt-3">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Heart className="h-4 w-4 text-rose-400 group-focus-within:text-rose-300" />
                  </div>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="Detak Jantung (bpm)"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Droplets className="h-4 w-4 text-blue-400 group-focus-within:text-blue-300" />
                  </div>
                  <input
                    type="number"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(e.target.value)}
                    placeholder="Kadar Gula (mg/dL)"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Moon className="h-4 w-4 text-indigo-400 group-focus-within:text-indigo-300" />
                  </div>
                  <input
                    type="number"
                    value={sleepDuration}
                    onChange={(e) => setSleepDuration(e.target.value)}
                    placeholder="Durasi Tidur (Jam)"
                    min="0"
                    max="24"
                    step="0.5"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-xs text-slate-500 font-medium">Jam</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* --- QUICK SELECT DISEASE --- */}
          <div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2.5 font-medium uppercase tracking-wide">
              <Tag className="w-3 h-3" />
              <span>Pilih Gejala / Penyakit Umum</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {COMMON_DISEASES.map((disease, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSelect(disease)}
                  className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-800/50 border border-white/10 text-xs text-slate-300 hover:bg-cyan-900/20 hover:border-cyan-500/30 hover:text-cyan-300 transition-all active:scale-95"
                >
                  {disease}
                </button>
              ))}
            </div>
          </div>

          {/* --- INPUT UTAMA --- */}
          <div className="flex items-end gap-2 bg-slate-800/30 border border-white/10 rounded-3xl p-2 pl-4 focus-within:bg-slate-800/50 focus-within:border-cyan-500/40 focus-within:ring-1 focus-within:ring-cyan-500/10 transition-all shadow-inner">
            <button className="p-2.5 text-slate-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-white/5">
              <Mic className="w-5 h-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Jelaskan keluhan kesehatan Anda secara detail..."
              className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 resize-none py-3 text-sm leading-relaxed"
              rows={1}
              disabled={isAnalyzing}
              style={{ minHeight: '48px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isAnalyzing}
              className="p-3 bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        main::-webkit-scrollbar {
            width: 6px;
        }
        main::-webkit-scrollbar-track {
            background: transparent;
        }
        main::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
        }
        main::-webkit-scrollbar-thumb:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}