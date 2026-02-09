"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, MessageSquare, Clock, CheckCircle, 
  AlertCircle, User, Stethoscope, Bot, Loader2 
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
};

export default function ChatDokterPage() {
  const router = useRouter();
  
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data User saat ini
  const getUserData = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  };

  // Fetch Data Konsultasi
  useEffect(() => {
    const user = getUserData();
    if (!user) {
      // Jika belum login, bisa redirect atau tampilkan data dummy untuk demo
      console.log("User not logged in");
    }

    const fetchConsultations = async () => {
      try {
        // Kirim userId ke API
        const userIdParam = user ? `?userId=${user.id}` : '';
        const res = await fetch(`/api/user/consultations${userIdParam}`);
        if (res.ok) {
          const data = await res.json();
          setConsultations(data);
          // Pilih chat pertama secara otomatis
          if (data.length > 0 && !selectedId) {
            setSelectedId(data[0].id);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  const selectedConsultation = consultations.find(c => c.id === selectedId);

  return (
    <div className="min-h-screen bg-[#0B1121] text-slate-100 font-sans flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <header className="h-16 border-b border-white/5 bg-slate-900/90 backdrop-blur-xl flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg">Konsultasi Saya</h1>
          </div>
        </div>
        {/* Bisa tambahkan tombol "Konsultasi Baru" di sini jika mau */}
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: LIST CHAT */}
        <div className="w-full md:w-[380px] bg-slate-900/30 border-r border-white/5 flex flex-col h-full">
          <div className="p-4 border-b border-white/5">
            <p className="text-xs text-slate-500 font-semibold uppercase">Riwayat Percakapan</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Memuat...
              </div>
            ) : consultations.length === 0 ? (
              <div className="text-center p-6">
                <p className="text-slate-500 text-sm">Belum ada riwayat konsultasi.</p>
                <button 
                  onClick={() => router.push("/user/konsultasi")} 
                  className="mt-4 text-cyan-400 text-sm font-bold hover:underline"
                >
                  Mulai Konsultasi Baru
                </button>
              </div>
            ) : (
              consultations.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all group ${
                    selectedId === item.id 
                      ? 'bg-cyan-500/10 border-cyan-500/30 shadow-md' 
                      : 'bg-transparent border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                        {item.user_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{item.user_name}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(item.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}
                        </p>
                      </div>
                    </div>
                    
                    {/* NOTIFIKASI STATUS */}
                    {item.status === 'replied' ? (
                      <div className="flex flex-col items-end gap-1">
                        <CheckCircle size={16} className="text-emerald-400" title="Sudah Dibalas" />
                        <span className="text-[9px] text-emerald-400 font-bold">SELESAI</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end gap-1">
                        <Clock size={16} className="text-amber-400 animate-pulse" title="Menunggu" />
                        <span className="text-[9px] text-amber-400 font-bold">PROSES</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-300 line-clamp-2 pl-10">
                    {item.symptoms}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL: CHAT DETAIL */}
        <div className="hidden md:flex flex-1 flex-col h-full bg-[#0B1121] relative">
          {selectedConsultation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/20">
                    DR
                  </div>
                  <div>
                    <h3 className="font-bold text-white">dr. Resepsionis</h3>
                    <div className="flex items-center gap-1.5">
                      {selectedConsultation.status === 'replied' ? (
                        <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle size={10} /> Balasan Diterima
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                          <Clock size={10} /> Menunggu Balasan Dokter
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
                
                {/* 1. Pesan User */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex-shrink-0 mt-1 flex items-center justify-center text-xs font-bold text-white border border-white/10">U</div>
                  <div className="space-y-2 max-w-[80%]">
                    <div className="bg-purple-600/20 border border-purple-500/30 p-4 rounded-2xl rounded-tl-none text-sm text-purple-100">
                      <p className="font-bold text-xs text-purple-400 mb-1">Keluhan Saya:</p>
                      {selectedConsultation.symptoms}
                    </div>
                  </div>
                </div>

                {/* 2. Hasil AI (Context) */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 flex-shrink-0 mt-1 flex items-center justify-center text-xs font-bold text-white border border-white/10">AI</div>
                  <div className="space-y-2 max-w-[80%]">
                    <div className="bg-cyan-900/20 border border-cyan-500/20 p-3 rounded-2xl rounded-tl-none text-xs text-cyan-100 italic">
                      <p className="font-bold text-cyan-400 mb-1 flex items-center gap-1"><Bot size={12} /> Analisa AI:</p>
                      {selectedConsultation.ai_diagnosis}
                    </div>
                  </div>
                </div>

                {/* 3. Balasan Dokter (Conditional) */}
                {selectedConsultation.doctor_reply ? (
                  <div className="flex gap-4 flex-row-reverse animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex-shrink-0 mt-1 flex items-center justify-center text-xs font-bold text-white border border-white/10">DR</div>
                    <div className="space-y-2 max-w-[80%] text-right">
                      <div className="bg-emerald-600/10 border border-emerald-500/30 p-4 rounded-2xl rounded-tr-none text-sm text-emerald-100 text-left">
                        <p className="font-bold text-xs text-emerald-400 mb-2">Resep / Saran Dokter:</p>
                        <p className="whitespace-pre-wrap leading-relaxed">{selectedConsultation.doctor_reply}</p>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(selectedConsultation.created_at).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Placeholder jika belum dibalas */
                  <div className="flex flex-col items-center justify-center py-10 opacity-50">
                    <Clock className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                    <p className="text-sm text-slate-500 font-medium">Sedang menunggu balasan dari dokter...</p>
                    <p className="text-xs text-slate-600 mt-1">Mohon tunggu beberapa saat.</p>
                  </div>
                )}

              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-600">
              <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
              <p>Pilih percakapan untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}