"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  MessageSquare, Send, Clock, CheckCircle, 
  User, Bot, LogOut, Menu, X, Activity 
} from "lucide-react";

type Consultation = {
  id: number;
  user_name: string;
  symptoms: string;
  ai_diagnosis: string;
  doctor_reply: string | null;
  status: 'pending' | 'replied';
  created_at: string;
};

export default function DoctorDashboard() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("inbox");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // State Data
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Fetch Data
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      // Cek role dokter (opsional, sesuaikan logic login Anda)
      if (!token) router.replace("/login"); 
    };
    checkAuth();
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/doctor/consultations');
      if (res.ok) {
        const data = await res.json();
        setConsultations(data);
        // Auto select first item if available
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedConsultation = consultations.find(c => c.id === selectedId);

  const handleReply = async () => {
    if (!replyText.trim() || !selectedId) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/doctor/consultations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedId, reply: replyText })
      });

      if (res.ok) {
        // Update local state
        setConsultations(prev => prev.map(c => 
          c.id === selectedId 
            ? { ...c, doctor_reply: replyText, status: 'replied' } 
            : c
        ));
        setReplyText("");
        alert("Balasan berhasil dikirim!");
      } else {
        alert("Gagal mengirim balasan.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900/90 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">DR</div>
            <span className="font-bold text-lg text-white">Panel Dokter</span>
          </div>
          <button className="md:hidden text-slate-400" onClick={() => setSidebarOpen(false)}><X size={20}/></button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<MessageSquare size={18}/>} label="Inbox Konsultasi" active={true} />
          <NavItem icon={<Activity size={18}/>} label="Jadwal (Soon)" active={false} />
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={() => router.replace("/login")} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut size={16}/> Keluar
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-64 h-screen flex flex-col bg-[#0B1121]">
        
        {/* Header Mobile */}
        <header className="md:hidden h-16 border-b border-white/5 flex items-center justify-between px-4 bg-slate-900">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-300"><Menu size={24}/></button>
          <span className="font-bold">Konsultasi Masuk</span>
          <div className="w-6"></div>
        </header>

        {/* SPLIT VIEW LAYOUT */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT PANEL: LIST KONSULTASI */}
          <div className="w-full md:w-[400px] border-r border-white/5 bg-slate-900/30 flex flex-col h-full">
            <div className="p-4 border-b border-white/5">
              <h2 className="font-bold text-lg">Pesan Masuk</h2>
              <p className="text-xs text-slate-500 mt-1">{consultations.length} konsultasi aktif</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {isLoading ? (
                <div className="p-4 text-center text-slate-500 text-sm">Memuat data...</div>
              ) : (
                consultations.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-4 rounded-xl cursor-pointer border transition-all ${
                      selectedId === item.id 
                        ? 'bg-cyan-500/10 border-cyan-500/30 shadow-lg' 
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
                            {new Date(item.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                      {item.status === 'replied' ? (
                        <CheckCircle size={16} className="text-emerald-400" />
                      ) : (
                        <Clock size={16} className="text-amber-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {item.symptoms}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT PANEL: CHAT DETAIL & INPUT */}
          <div className="hidden md:flex flex-1 flex-col h-full bg-[#0B1121] relative">
            {selectedConsultation ? (
              <>
                {/* Chat Header */}
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold">
                      {selectedConsultation.user_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{selectedConsultation.user_name}</h3>
                      <p className="text-xs text-cyan-400">Pasien • {selectedConsultation.status === 'pending' ? 'Menunggu Balasan' : 'Selesai'}</p>
                    </div>
                  </div>
                </div>

                {/* Chat Area (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                  
                  {/* User Message */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 mt-1 flex items-center justify-center text-xs">U</div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-slate-800/50 border border-white/5 p-4 rounded-2xl rounded-tl-none text-sm text-slate-200">
                        <p className="font-bold text-xs text-slate-400 mb-1">Keluhan Pasien:</p>
                        {selectedConsultation.symptoms}
                      </div>
                      
                      {/* AI Diagnosis Result */}
                      <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold pl-2">
                        <Bot size={14} />
                        <span>AI Analysis: {selectedConsultation.ai_diagnosis}</span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Reply (Existing or New) */}
                  {selectedConsultation.doctor_reply ? (
                    <div className="flex gap-4 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex-shrink-0 mt-1 flex items-center justify-center text-xs font-bold">DR</div>
                      <div className="bg-emerald-900/20 border border-emerald-500/20 p-4 rounded-2xl rounded-tr-none text-sm text-emerald-100">
                        <p className="font-bold text-xs text-emerald-400 mb-1">Resep/Saran Dokter:</p>
                        {selectedConsultation.doctor_reply}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-slate-600 italic">Belum ada balasan dokter</span>
                    </div>
                  )}
                  
                  <div ref={(el) => { if(el) el.scrollIntoView({behavior: 'smooth'}) }}></div>
                </div>

                {/* Input Area (Fixed Bottom) */}
                <div className="p-6 border-t border-white/5 bg-slate-900/50 backdrop-blur-md">
                  <div className="relative bg-slate-950 border border-white/10 rounded-xl p-1 focus-within:border-cyan-500/50 transition-colors">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Tulis resep atau saran medis di sini..."
                      className="w-full bg-transparent text-sm text-white p-3 h-24 resize-none outline-none placeholder-slate-600"
                      disabled={selectedConsultation.status === 'replied'}
                    ></textarea>
                    
                    <div className="flex justify-between items-center px-2 pb-2">
                      <span className="text-[10px] text-slate-500">Kirim sebagai Dr. Anda</span>
                      <button 
                        onClick={handleReply}
                        disabled={isSending || selectedConsultation.status === 'replied' || !replyText}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          (isSending || !replyText) 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                            : 'bg-cyan-500 text-white hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'
                        }`}
                      >
                        {isSending ? 'Mengirim...' : 'Kirim Balasan'} <Send size={14}/>
                      </button>
                    </div>
                  </div>
                </div>
              </>

            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-600">
                <MessageSquare size={48} className="mb-4 opacity-50" />
                <p>Pilih konsultasi untuk melihat detail</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active }: { icon: any, label: string, active: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-sm font-medium transition-colors ${
      active ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}