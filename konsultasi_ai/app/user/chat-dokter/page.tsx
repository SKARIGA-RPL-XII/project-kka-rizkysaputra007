"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, MessageSquare, Clock, CheckCircle, 
  AlertCircle, Stethoscope, Bot, Loader2, 
  RefreshCw, Calendar, Pill, FlaskConical, Check,
  Heart, Moon, Droplets 
} from "lucide-react";

// --- TYPES ---
type Consultation = {
  id: number;
  user_name: string;
  symptoms: string;
  ai_diagnosis: string; 
  doctor_reply: string | null;
  status: 'pending' | 'replied';
  created_at: string;
  heart_rate?: string | null;
  blood_sugar?: string | null;
  sleep_duration?: string | null;
};

export default function ChatDokterPage() {
  const router = useRouter();
  
  // State Data
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State UI
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileDetail, setIsMobileDetail] = useState(false);

  const getUserData = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  };

  // --- FETCH DATA (PERBAIKAN DISINI) ---
  const fetchData = async () => {
    const user = getUserData();
    try {
      const userIdParam = user ? `?userId=${user.id}` : '';
      
      // TAMBAHKAN 'cache: no-store' agar browser tidak cache data lama
      const res = await fetch(`/api/user/consultations${userIdParam}`, {
        cache: 'no-store'
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("📨 Data Terbaru dari API:", data); // Cek Console Browser untuk debug
        
        setConsultations(data);
        
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
        }
      } else {
        console.error("API Error:", res.status);
      }
    } catch (error) {
      console.error("Gagal mengambil chat:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Polling setiap 3 detik agar lebih responsif
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [selectedId]);

  // --- HANDLERS ---
  
  const handleSelectChat = (id: number) => {
    setSelectedId(id);
    setIsMobileDetail(true);
  };

  const handleBackToList = () => {
    setIsMobileDetail(false);
  };

  const handleQuickRequest = (type: string) => {
    const selectedChat = consultations.find(c => c.id === selectedId);
    if (!selectedChat) return;

    let requestText = "";
    if (type === 'jadwal') requestText = "Saya ingin membuat jadwal cek up lanjutan.";
    if (type === 'obat') requestText = "Mohon berikan resep obat yang perlu dikonsumsi.";
    if (type === 'lab') requestText = "Saya ingin melakukan uji lab untuk pemeriksaan lebih lanjut.";

    alert(`📨 Permintaan Terkirim ke Dokter:\n"${requestText}"`);
  };

  const selectedConsultation = consultations.find(c => c.id === selectedId);

  // --- HELPER RENDER ---
  
  const renderMetricsTags = (item: Consultation) => {
    const hasMetrics = item.heart_rate || item.blood_sugar || item.sleep_duration;
    if (!hasMetrics) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {item.heart_rate && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 text-[10px] text-rose-300">
            <Heart className="w-3 h-3"/> {item.heart_rate} bpm
          </div>
        )}
        {item.blood_sugar && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-[10px] text-blue-300">
            <Droplets className="w-3 h-3"/> {item.blood_sugar} mg/dL
          </div>
        )}
        {item.sleep_duration && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-[10px] text-indigo-300">
            <Moon className="w-3 h-3"/> {item.sleep_duration} Jam
          </div>
        )}
      </div>
    );
  };

  const renderAiDiagnosis = (diagnosisStr: string) => {
    try {
      if (!diagnosisStr) return null;
      const data = JSON.parse(diagnosisStr);
      
      return (
        <div className="bg-slate-800/60 border border-cyan-500/20 rounded-2xl p-4 shadow-lg max-w-[90%] backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
            <Bot className="w-4 h-4 text-cyan-400"/>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Analisa AI Awal</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-start">
               <span className="font-bold text-white text-sm">{data.condition}</span>
               <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  data.severity === 'Tinggi' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                  data.severity === 'Sedang' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>{data.severity}</span>
            </div>
            <p className="text-xs text-slate-400">{data.description}</p>
          </div>
        </div>
      );
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="h-screen bg-[#0B1121] text-slate-100 font-sans flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <header className="h-16 border-b border-white/5 bg-slate-900/95 backdrop-blur-xl flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm md:text-lg leading-none">Chat Dokter</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span className="text-[10px] text-emerald-400">Terhubung</span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => {setIsRefreshing(true); fetchData();}}
          className={`p-2 rounded-lg border border-white/5 hover:bg-white/10 transition-colors text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR KIRI: LIST CHAT */}
        <div className={`w-full md:w-[350px] bg-slate-900/30 border-r border-white/5 flex flex-col h-full transition-all absolute md:relative z-10 ${isMobileDetail ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
          <div className="p-4 border-b border-white/5 bg-slate-900/50">
            <h2 className="font-bold text-sm text-white">Riwayat Konsultasi</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-slate-500 text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin"/> Memuat...
              </div>
            ) : consultations.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-slate-500 text-sm">Belum ada percakapan.</p>
              </div>
            ) : (
              consultations.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleSelectChat(item.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    selectedId === item.id
                      ? 'bg-cyan-500/10 border-cyan-500/30' 
                      : 'bg-transparent border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                        {item.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">Anda</p>
                        <p className="text-[9px] text-slate-400">
                          {new Date(item.created_at).toLocaleDateString('id-ID', {day: 'numeric', month:'short'})}
                        </p>
                      </div>
                    </div>
                    {item.status === 'replied' ? (
                      <CheckCircle size={12} className="text-emerald-400" />
                    ) : (
                      <Clock size={12} className="text-slate-500" />
                    )}
                  </div>
                  
                  <p className="text-[11px] text-slate-300 line-clamp-2 pl-10 leading-relaxed">
                    {item.symptoms}
                  </p>
                  {/* Tampilkan preview balasan di list jika ada */}
                  {item.doctor_reply && item.doctor_reply.trim() !== "" && (
                    <p className="text-[10px] text-emerald-400 pl-10 mt-1 truncate">
                      Dr: {item.doctor_reply}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* AREA KANAN: DETAIL CHAT */}
        <div className={`flex-1 h-full bg-[#0B1121] relative flex flex-col transition-all absolute md:relative w-full md:w-auto z-20 ${isMobileDetail ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          
          {selectedConsultation ? (
            <>
              {/* Header Chat Detail */}
              <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={handleBackToList} className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-full text-slate-400">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
                    DR
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">dr. Resepsionis</h3>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Dokter Umum
                    </p>
                  </div>
                </div>
              </div>

              {/* Area Pesan Chat */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth bg-slate-900/20">
                
                {/* 1. Pesan Pengguna (User) - Kanan */}
                <div className="flex flex-row-reverse gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white border border-white/10">
                    {selectedConsultation.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="max-w-[85%] flex flex-col items-end">
                    <div className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md text-sm leading-relaxed">
                      {selectedConsultation.symptoms}
                      {renderMetricsTags(selectedConsultation)}
                    </div>
                    <div suppressHydrationWarning className="text-[9px] text-slate-500 mt-1 mr-1">
                      {new Date(selectedConsultation.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>

                {/* 2. Pesan AI (Sistem) - Tengah */}
                <div className="flex justify-center my-2">
                  {renderAiDiagnosis(selectedConsultation.ai_diagnosis)}
                </div>

                {/* 3. Pesan Dokter (Doctor) - Kiri */}
                {/* PERBAIKAN LOGIKA PENGECEKAN BALASAN */}
                {selectedConsultation.doctor_reply && selectedConsultation.doctor_reply.trim() !== "" ? (
                  <div className="flex gap-3 animate-in fade-in slide-in-from-bottom duration-500">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white border border-white/10 shadow-md">
                      DR
                    </div>
                    <div className="max-w-[85%]">
                      <div className="bg-slate-800 border border-white/10 text-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm leading-relaxed">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                          <Stethoscope size={14} className="text-emerald-400"/>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Resep & Saran</span>
                        </div>
                        <p className="whitespace-pre-wrap">{selectedConsultation.doctor_reply}</p>
                      </div>

                      {/* Tombol Quick Action setelah balasan dokter */}
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        <button onClick={() => handleQuickRequest('jadwal')} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/50 text-slate-400 hover:text-blue-300 rounded-lg text-[10px] transition-all">
                          <Calendar size={12} /> Jadwal
                        </button>
                        <button onClick={() => handleQuickRequest('obat')} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-emerald-600/20 border border-white/5 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-300 rounded-lg text-[10px] transition-all">
                          <Pill size={12} /> Resep
                        </button>
                        <button onClick={() => handleQuickRequest('lab')} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-amber-600/20 border border-white/5 hover:border-amber-500/50 text-slate-400 hover:text-amber-300 rounded-lg text-[10px] transition-all">
                          <FlaskConical size={12} /> Lab
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* State Menunggu Balasan Dokter */
                  <div className="flex flex-col items-center justify-center py-8 px-4 w-full">
                    <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
                    <p className="text-xs font-medium text-slate-400">Menunggu balasan dokter...</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 p-8">
              <MessageSquare className="w-20 h-20 mb-4 text-slate-700" />
              <h3 className="text-lg font-bold text-slate-500">Pilih Riwayat Chat</h3>
              <p className="text-sm text-slate-600">Pilih konsultasi di daftar sebelah kiri untuk melihat detail percakapan.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}