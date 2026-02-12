"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  MessageSquare, Clock, CheckCircle, 
  AlertCircle, User, Stethoscope, Bot, Loader2, 
  Activity, Heart, Moon, Droplets, Pill, Calendar, Bell, Search, 
  RefreshCw, X, CalendarClock, Menu, Send, LogOut, Check, Info,
  ArrowLeft, Paperclip, MoreVertical 
} from "lucide-react";

// --- TYPES ---

type Consultation = {
  id: number;
  user_id: number | null;
  user_name: string;
  symptoms: string;
  heart_rate: number | null;
  blood_sugar: number | null;
  sleep_duration: number | null;
  ai_diagnosis: string; 
  doctor_reply: string | null;
  status: 'pending' | 'replied';
  created_at: string;
};

type MetricDisplay = Consultation & {
  displayValue: string;
  displayUnit: string;
  computedStatus: 'normal' | 'warning' | 'critical';
};

type AppointmentDisplay = {
  id: number;
  user_id: number | null;
  user_name: string;
  doctor: string;
  type: string;
  scheduledDate: string; 
  scheduledTime: string; 
  isFuture: boolean;
};

type ToastType = {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
};

// Data Simulasi Jadwal (Karena tabel jadwal belum ada di DB)
const APPOINTMENTS_MOCK: AppointmentDisplay[] = [
  { id: 101, user_id: null, user_name: "Rizky", doctor: "dr. Sarah", type: "Check-up", scheduledDate: "2023-10-27", scheduledTime: "09:00", isFuture: false },
  { id: 102, user_id: null, user_name: "Azam", doctor: "dr. Budi", type: "Follow-up", scheduledDate: "2023-10-28", scheduledTime: "14:00", isFuture: false },
  { id: 103, user_id: null, user_name: "Dina", doctor: "dr. Sarah", type: "Check-up", scheduledDate: "2023-10-29", scheduledTime: "08:00", isFuture: true },
  { id: 104, user_id: null, user_name: "Rizky", doctor: "dr. Budi", type: "Follow-up", scheduledDate: "2023-10-30", scheduledTime: "10:00", isFuture: true }
];

export default function DoctorDashboard() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // States Data
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  
  // States UI & Modal
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  
  // State Modal Jadwal
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleNote, setScheduleNote] = useState("");
  
  // State Notification
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- FETCH DATA DARI DATABASE ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login");
    
    const fetchData = async () => {
      try {
        // 1. Fetch Konsultasi dari Database Real
        const res = await fetch('/api/doctor/consultations');
        if (res.ok) {
          const data = await res.json();
          setConsultations(data);
        } else {
          console.error("Gagal fetch data API");
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Auto refresh setiap 5 detik
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [router]); 

  // --- SCROLL OTOMATIS ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedUserId]);

  // --- HELPER: TOAST ---
  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // --- HANDLERS ---
    // Di dalam DoctorDashboard.tsx
  const handleReply = async () => {
    const userChats = getChatsForUser(selectedUserId);
    if (!userChats || userChats.length === 0) return;
    
    const pendingChat = [...userChats].reverse().find(c => c.status === 'pending');
    const targetChat = pendingChat || userChats[userChats.length - 1];

    if (!replyText.trim()) {
      addToast("Tulis balasan terlebih dahulu.", "info");
      return;
    }

    setIsSending(true);
    
    try {
      // PASTIKAN URL INI SAMA DENGAN FILE API DI ATAS
      const res = await fetch('/api/doctor/consultations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: targetChat.id,
          // ⚠️ Key ini harus sama dengan yang diterima API: doctor_reply
          doctor_reply: replyText 
        })
      });

      if (res.ok) {
        // Update state lokal agar UI langsung berubah
        setConsultations(prev => prev.map(c => 
          c.id === targetChat.id 
            ? { ...c, doctor_reply: replyText, status: 'replied' as 'replied' } 
            : c
        ));
        setReplyText("");
        addToast("✨ Balasan terkirim ke pasien!", "success");
      } else {
        const err = await res.json();
        console.error("Error API:", err);
        addToast("❌ Gagal mengirim: " + (err.error || "Unknown error"), "error");
      }
    } catch (error) {
      console.error(error);
      addToast("❌ Koneksi internet bermasalah.", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenSchedule = (consultationId: number) => {
    const consultation = consultations.find(c => c.id === consultationId);
    if (consultation) {
      setSelectedUserId(String(consultation.user_id || `guest_${consultation.user_name}`));
      setActiveMenu("schedule"); 
      setScheduleModalOpen(true);
    }
  };

  const handleSaveSchedule = () => {
    if(!scheduleDate) {
      addToast("Pilih tanggal dan waktu dulu.", "error");
      return;
    }
    setScheduleModalOpen(false);
    addToast(`📅 Jadwal berhasil disimpan.`, "success");
    setScheduleDate("");
    setScheduleNote("");
  };

  // --- LOGIKA GROUPING ---
  const groupedChats: Record<string, Consultation[]> = consultations.reduce((acc, chat) => {
    const uniqueKey = chat.user_id ? String(chat.user_id) : `guest_${chat.user_name}`.toLowerCase();
    if (!acc[uniqueKey]) acc[uniqueKey] = [];
    acc[uniqueKey].push(chat);
    return acc;
  }, {} as Record<string, Consultation[]>);

  Object.keys(groupedChats).forEach(uid => {
    groupedChats[uid].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  });

  const sortedUserKeys = Object.keys(groupedChats).sort((keyA, keyB) => {
    const lastA = groupedChats[keyA][groupedChats[keyA].length - 1];
    const lastB = groupedChats[keyB][groupedChats[keyB].length - 1];
    return new Date(lastB.created_at).getTime() - new Date(lastA.created_at).getTime();
  });

  const getChatsForUser = (uid: string | null) => {
    if (!uid) return [];
    return groupedChats[uid] || [];
  };

  // --- DATA PROCESSING JADWAL ---
  const getAppointments = (): AppointmentDisplay[] => {
    return APPOINTMENTS_MOCK.map(appt => {
       const realChat = consultations.find(c => c.user_name === appt.user_name);
       return {
         ...appt,
         user_id: realChat?.user_id || null,
         scheduledDate: realChat ? new Date(new Date(realChat.created_at).getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : appt.scheduledDate
       };
    });
  };
  
  const appointments = getAppointments();

  // --- DATA PROCESSING METRIK ---
  const currentMetricData: MetricDisplay[] = consultations
    .filter((item) => {
      if (activeMenu === 'heart') return item.heart_rate !== null && item.heart_rate !== 0;
      if (activeMenu === 'sugar') return item.blood_sugar !== null && item.blood_sugar !== 0;
      if (activeMenu === 'sleep') return item.sleep_duration !== null && item.sleep_duration !== 0;
      return false;
    })
    .map((item) => {
      let displayValue = "";
      let displayUnit = "";
      let computedStatus: 'normal' | 'warning' | 'critical' = 'normal';

      if (activeMenu === 'heart' && item.heart_rate) {
        displayValue = String(item.heart_rate);
        displayUnit = "bpm";
        if (item.heart_rate > 120) computedStatus = 'critical';
        else if (item.heart_rate > 100) computedStatus = 'warning';
      } else if (activeMenu === 'sugar' && item.blood_sugar) {
        displayValue = String(item.blood_sugar);
        displayUnit = "mg/dL";
        if (item.blood_sugar > 200) computedStatus = 'critical';
        else if (item.blood_sugar > 140) computedStatus = 'warning';
      } else if (activeMenu === 'sleep' && item.sleep_duration) {
        displayValue = String(item.sleep_duration);
        displayUnit = "Jam";
        if (item.sleep_duration < 4) computedStatus = 'critical';
        else if (item.sleep_duration < 6) computedStatus = 'warning';
      }

      return { ...item, displayValue: `${displayValue} ${displayUnit}`, displayUnit, computedStatus };
    });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const getMetricIcon = (type: string) => {
    switch(type) {
      case 'heart': return <Heart className="text-rose-400 w-4 h-4"/>;
      case 'sleep': return <Moon className="text-indigo-400 w-4 h-4"/>;
      case 'sugar': return <Droplets className="text-sky-400 w-4 h-4"/>;
      default: return <Activity className="text-slate-400 w-4 h-4"/>;
    }
  };

  const renderAiDiagnosis = (diagnosisStr: string | null) => {
    if (!diagnosisStr) return <p className="text-slate-500 italic">Tidak ada analisa AI.</p>;
    try {
      const data = JSON.parse(diagnosisStr);
      return (
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-cyan-400 font-bold uppercase mb-1">Kondisi:</p>
            <p className="font-bold text-white">{data.condition}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              data.severity === 'Tinggi' ? 'bg-rose-500/20 text-rose-400' :
              data.severity === 'Sedang' ? 'bg-amber-500/20 text-amber-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>{data.severity}</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Deskripsi:</p>
            <p className="text-xs text-slate-300 leading-relaxed">{data.description}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Saran AI:</p>
            <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
              {Array.isArray(data.advice) ? data.advice.map((adv: string, i: number) => <li key={i}>{adv}</li>) : <li>{String(data.advice)}</li>}
            </ul>
          </div>
        </div>
      );
    } catch (e) {
      return <p className="text-xs text-slate-300 whitespace-pre-wrap">{diagnosisStr}</p>;
    }
  };

  // --- RENDER MAIN PAGE ---
  return (
    <div className="min-h-screen bg-[#0B1121] text-slate-100 font-sans flex overflow-hidden">
      
      {/* --- MODERN TOAST NOTIFICATIONS --- */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md border animate-slide-up ${
            toast.type === 'success' ? 'bg-slate-900/90 border-emerald-500/30 text-white' :
            toast.type === 'error' ? 'bg-slate-900/90 border-rose-500/30 text-white' :
            'bg-slate-900/90 border-cyan-500/30 text-white'
          }`}>
            <div className={`p-1.5 rounded-full ${
              toast.type === 'success' ? 'bg-emerald-500' : 
              toast.type === 'error' ? 'bg-rose-500' : 
              'bg-cyan-500'
            }`}>
              {toast.type === 'success' ? <Check size={14} className="text-white"/> : 
               toast.type === 'error' ? <AlertCircle size={14} className="text-white"/> : 
               <Info size={14} className="text-white"/>}
            </div>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-slate-900/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">DR</div>
            <div>
              <span className="font-bold text-lg text-white block">MediCare</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Doctor Panel</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
             <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-2">Menu Utama</p>
            <NavItem id="dashboard" label="Ringkasan" active={activeMenu === 'dashboard'} icon={<Activity size={18}/>} onClick={() => {setActiveMenu('dashboard'); if(window.innerWidth < 768) setSidebarOpen(false);}} />
            
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4">Konsultasi</p>
            <NavItem id="inbox" label="Inbox Chat" active={activeMenu === 'inbox'} icon={<MessageSquare size={18}/>} onClick={() => {setActiveMenu('inbox'); if(window.innerWidth < 768) setSidebarOpen(false);}} badge={Object.keys(groupedChats).length} />
            
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4">Monitoring Pasien</p>
            <NavItem id="heart" label="Detak Jantung" active={activeMenu === 'heart'} icon={<Heart size={18} className="text-rose-400"/>} onClick={() => {setActiveMenu('heart'); if(window.innerWidth < 768) setSidebarOpen(false);}} />
            <NavItem id="sleep" label="Kualitas Tidur" active={activeMenu === 'sleep'} icon={<Moon size={18} className="text-indigo-400"/>} onClick={() => {setActiveMenu('sleep'); if(window.innerWidth < 768) setSidebarOpen(false);}} />
            <NavItem id="sugar" label="Kadar Gula" active={activeMenu === 'sugar'} icon={<Droplets size={18} className="text-sky-400"/>} onClick={() => {setActiveMenu('sugar'); if(window.innerWidth < 768) setSidebarOpen(false);}} />
            <NavItem id="meds" label="Kepatuhan Obat" active={activeMenu === 'meds'} icon={<Pill size={18} className="text-emerald-400"/>} onClick={() => {setActiveMenu('meds'); if(window.innerWidth < 768) setSidebarOpen(false);}} />
            
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4">Jadwal</p>
            <NavItem id="schedule" label="Jadwal Cek Up" active={activeMenu === 'schedule'} icon={<Calendar size={18} className="text-amber-400"/>} onClick={() => {setActiveMenu('schedule'); if(window.innerWidth < 768) setSidebarOpen(false);}} />
          </nav>

          <div className="p-4 border-t border-white/5 bg-slate-900/50">
            <button onClick={() => router.replace("/login")} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors group">
              <LogOut size={16} className="group-hover:translate-x-1 transition-transform"/> Keluar
            </button>
          </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-72 h-screen flex flex-col bg-[#0B1121] relative">
        
        {/* HEADER */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400"><Menu size={24}/></button>
            <h2 className="font-bold text-lg capitalize">
              {activeMenu === 'dashboard' ? 'Ringkasan' : 
               activeMenu === 'inbox' ? 'Pesan Masuk' :
               activeMenu === 'heart' ? 'Monitor Detak Jantung' :
               activeMenu === 'sleep' ? 'Analisis Tidur' :
               activeMenu === 'sugar' ? 'Monitoring Gula Darah' : 'Monitoring Status Obat'}
            </h2>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-white/5">
              <Search className="w-4 h-4 text-slate-500"/>
              <input type="text" placeholder="Cari pasien..." className="bg-transparent text-xs outline-none text-white w-32 placeholder-slate-600"/>
            </div>
            <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
              <Bell size={18} className="text-slate-400"/>
              {consultations.filter(c => c.status === 'pending').length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">{consultations.filter(c => c.status === 'pending').length}</span>
                </span>
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold border border-white/10">DR</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          
          {/* VIEW: DASHBOARD RINGKASAN */}
          {activeMenu === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { title: 'Total Pasien', val: Object.keys(groupedChats).length, icon: <Activity className="text-red-500"/>, color: 'from-red-500/20 to-transparent' },
                { title: 'Menunggu Balasan', val: consultations.filter(c => c.status === 'pending').length, icon: <MessageSquare className="text-amber-500"/>, color: 'from-amber-500/20 to-transparent' },
                { title: 'Selesai Dibalas', val: consultations.filter(c => c.status === 'replied').length, icon: <CheckCircle className="text-cyan-500"/>, color: 'from-cyan-500/20 to-transparent' },
                { title: 'Jadwal Hari Ini', val: appointments.filter(a => a.isFuture).length, icon: <CalendarClock className="text-emerald-500"/>, color: 'from-emerald-500/20 to-transparent' },
              ].map((stat, i) => (
                <div key={i} className={`p-5 rounded-2xl bg-gradient-to-br ${stat.color} border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-slate-900/50 rounded-lg shadow-lg shadow-cyan-500/20">{stat.icon}</div>
                    <span className="text-xs font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded">Live</span>
                  </div>
                  <h3 className="text-slate-400 text-sm font-medium">{stat.title}</h3>
                  <p className="text-2xl font-bold text-white mt-1">{stat.val}</p>
                </div>
              ))}
            </div>
          )}

          {/* VIEW: INBOX (WA-LIKE GROUPING) - REDESIGNED */}
          {activeMenu === 'inbox' && (
            <div className="flex h-[calc(100vh-140px)] gap-0 md:gap-6 rounded-2xl overflow-hidden border border-white/5 bg-[#0B1121] shadow-2xl relative">
              
              {/* --- SIDEBAR KIRI: DAFTAR KONTAK (30%) --- */}
              <div className={`w-full md:w-[320px] lg:w-[350px] flex flex-col bg-slate-900/80 border-r border-white/5 absolute inset-y-0 left-0 z-20 transition-transform duration-300 md:relative md:translate-x-0 ${selectedUserId ? '-translate-x-full' : 'translate-x-0'}`}>
                
                {/* Header Sidebar */}
                <div className="p-5 border-b border-white/5 bg-slate-900/95 backdrop-blur">
                  <h3 className="font-bold text-lg text-white tracking-tight">Pesan Masuk</h3>
                  <div className="mt-4 relative">
                    <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4"/>
                    <input 
                      type="text" 
                      placeholder="Cari pasien..." 
                      className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* List Kontak */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-cyan-500"/>
                      <span className="text-xs">Memuat percakapan...</span>
                    </div>
                  ) : sortedUserKeys.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-600 text-sm p-4 text-center">
                      <MessageSquare size={32} className="mb-2 opacity-20"/>
                      <p>Belum ada konsultasi masuk.</p>
                    </div>
                  ) : (
                    sortedUserKeys.map((uid) => {
                      const userChats = groupedChats[uid];
                      if (!userChats) return null;
                      const user = userChats[0];
                      const lastChat = userChats[userChats.length - 1];
                      const isSelected = selectedUserId === uid;
                      const isPending = lastChat.status === 'pending' && !lastChat.doctor_reply;

                      return (
                        <div 
                          key={uid}
                          onClick={() => setSelectedUserId(uid)} 
                          className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                              : 'hover:bg-white/5 border border-transparent hover:border-white/5'
                          }`}
                        >
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white transition-colors ${
                              isPending ? 'bg-gradient-to-tr from-rose-500 to-orange-500 ring-2 ring-rose-500/20' : 'bg-slate-700'
                            }`}>
                              {user.user_name.charAt(0)}
                            </div>
                            {isPending && (
                              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-slate-900"></span>
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <h4 className={`text-sm font-semibold truncate ${isPending ? 'text-white' : 'text-slate-200'}`}>
                                {user.user_name}
                              </h4>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(lastChat.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <p className={`text-xs truncate ${
                              lastChat.doctor_reply 
                                ? 'text-emerald-400/80' 
                                : 'text-slate-400 group-hover:text-slate-300'
                            }`}>
                              {lastChat.doctor_reply ? `Anda: ${lastChat.doctor_reply}` : lastChat.symptoms}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* --- AREA KANAN: CHAT ROOM --- */}
              <div className={`flex-1 flex flex-col bg-[#0B1121] relative w-full transition-all duration-300 md:opacity-100 ${selectedUserId ? 'opacity-100 z-10 md:z-auto' : 'hidden md:flex opacity-50 md:opacity-100'}`}>
                
                {selectedUserId ? (
                  <>
                    {/* Chat Header */}
                    <div className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setSelectedUserId(null)}
                          className="md:hidden p-1 -ml-2 text-slate-400 hover:text-white"
                        >
                          <ArrowLeft size={20}/>
                        </button>
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white/5">
                            {groupedChats[selectedUserId][0].user_name.charAt(0)}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0B1121] rounded-full"></span>
                        </div>
                        <div>
                          <h2 className="font-bold text-sm text-white">{groupedChats[selectedUserId][0].user_name}</h2>
                          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                            <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></span>
                            Online • Sedang berkonsultasi
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
                          <MoreVertical size={18}/>
                        </button>
                      </div>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/20 via-transparent to-transparent">
                      {getChatsForUser(selectedUserId).map((chat, index) => (
                        <div key={chat.id} className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
                          
                          {/* --- PASIENT MESSAGE --- */}
                          <div className="flex flex-col gap-2 max-w-[85%]">
                            <div className="flex items-end gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-300 mb-1">
                                P
                              </div>
                              <div className="space-y-1 w-full">
                                <div className="bg-slate-800 border border-slate-700/50 text-slate-200 px-5 py-3 rounded-2xl rounded-bl-none shadow-sm">
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{chat.symptoms}</p>
                                  
                                  {/* Vitals Tags */}
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {chat.heart_rate && (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-medium">
                                        <Heart size={10} className="text-rose-500"/> {chat.heart_rate} bpm
                                      </span>
                                    )}
                                    {chat.blood_sugar && (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[10px] font-medium">
                                        <Droplets size={10} className="text-sky-500"/> {chat.blood_sugar} mg/dL
                                      </span>
                                    )}
                                    {chat.sleep_duration && (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-medium">
                                        <Moon size={10} className="text-indigo-500"/> {chat.sleep_duration} jam
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[10px] text-slate-600 pl-2">
                                  {new Date(chat.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* --- AI ANALYSIS BOX --- */}
                          <div className="relative pl-12 md:pl-16">
                             {/* Connecting Line */}
                             <div className="absolute left-[19px] top-0 bottom-[-2rem] w-px bg-gradient-to-b from-indigo-500/50 to-transparent"></div>
                             
                             <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-0 overflow-hidden shadow-[0_0_20px_rgba(79,70,229,0.05)]">
                               <div className="bg-indigo-900/30 px-4 py-2 border-b border-indigo-500/10 flex items-center gap-2">
                                 <Bot size={14} className="text-indigo-400"/>
                                 <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Analisa AI Assistant</span>
                               </div>
                               <div className="p-4">
                                 {renderAiDiagnosis(chat.ai_diagnosis)}
                               </div>
                             </div>
                          </div>

                          {/* --- DOCTOR REPLY --- */}
                          {chat.doctor_reply && (
                            <div className="flex flex-col gap-2 max-w-[85%] self-end items-end">
                              <div className="space-y-1 w-full text-right">
                                 <div className="bg-sky-600 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-md shadow-sky-900/20">
                                  <div className="flex items-center gap-2 mb-1 opacity-80 border-b border-white/10 pb-2 mb-2">
                                    <Stethoscope size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-wide">Resep Dokter</span>
                                  </div>
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-left">{chat.doctor_reply}</p>
                                </div>
                                <span className="text-[10px] text-slate-500 pr-2 flex items-center justify-end gap-1">
                                  Terkirim <CheckCircle size={10} className="text-sky-400"/>
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Separator jika ada multiple chats */}
                          {index < getChatsForUser(selectedUserId).length - 1 && (
                            <div className="flex items-center gap-4 py-2 opacity-30">
                              <div className="h-px bg-white/20 flex-1"></div>
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Sesi Baru</span>
                              <div className="h-px bg-white/20 flex-1"></div>
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input Area */}
                    {/* Chat Input Area */}
<div className="p-4 bg-slate-900/80 border-t border-white/5 backdrop-blur-lg">
  <div className="max-w-4xl mx-auto bg-slate-950/50 border border-white/10 rounded-2xl p-2 flex items-end gap-2 focus-within:border-cyan-500/30 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
    <button className="p-2.5 text-slate-400 hover:text-cyan-400 transition-colors rounded-xl hover:bg-white/5">
      <Paperclip size={18} />
    </button>
    <textarea
      rows={1}
      value={replyText}
      onChange={(e) => setReplyText(e.target.value)}
      className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-500 focus:ring-0 resize-none py-3 max-h-32 scrollbar-hide"
      placeholder="Tulis resep atau saran medis..."
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleReply();
        }
      }}
    />
    <button 
      onClick={handleReply} 
      disabled={isSending || !replyText.trim()}
      className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${
        isSending || !replyText.trim() 
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
          : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 hover:scale-105 active:scale-95'
      }`}
    >
      {isSending ? <Loader2 size={18} className="animate-spin"/> : <Send size={18} className="rotate-[45deg]"/>}
    </button>
  </div>
</div>
                  </>
                ) : (
                  /* Empty State when no chat selected */
                  <div className="hidden md:flex flex-col items-center justify-center h-full text-slate-600 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/30 via-transparent to-transparent">
                    <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center border border-white/5 mb-4">
                      <MessageSquare size={32} className="opacity-30"/>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-300">Pilih Pasien</h3>
                    <p className="text-sm mt-1 max-w-xs text-center">Klik salah satu nama di daftar sebelah kiri untuk memulai atau melanjutkan konsultasi.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: TABEL MONITORING */}
          {['heart', 'sleep', 'sugar', 'meds'].includes(activeMenu) && (
            <div className="bg-slate-900/30 border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-slate-900/50 text-xs uppercase text-slate-400">
                      <th className="p-4 font-medium">Pasien</th>
                      <th className="p-4 font-medium flex items-center gap-2">
                        {getMetricIcon(activeMenu)}
                        {activeMenu === 'heart' ? 'Detak Jantung' :
                         activeMenu === 'sleep' ? 'Durasi Tidur' :
                         activeMenu === 'sugar' ? 'Kadar Gula' : 'Status Obat'}
                      </th>
                      <th className="p-4 font-medium">Waktu Konsultasi</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {currentMetricData.length > 0 ? currentMetricData.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                              {item.user_name.charAt(0)}
                            </div>
                            <span className="font-medium text-sm text-slate-200">{item.user_name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-bold text-white">{item.displayValue}</span>
                        </td>
                        <td className="p-4 text-xs text-slate-400">
                           {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month:'short', hour: '2-digit', minute:'2-digit' })}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(item.computedStatus)}`}>
                            {item.computedStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleOpenSchedule(item.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-400 text-xs font-medium transition-all flex items-center gap-2 ml-auto"
                          >
                            <Calendar className="w-3 h-3 text-cyan-400" /> Atur Jadwal
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                          Belum ada data {activeMenu === 'heart' ? 'detak jantung' : activeMenu === 'sugar' ? 'gula darah' : 'tidur'} dari pasien.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: JADWAL */}
          {activeMenu === 'schedule' && (
            <div className="bg-slate-900/30 border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-slate-900/50 text-xs uppercase text-slate-400">
                      <th className="p-4 font-medium">Pasien</th>
                      <th className="p-4 font-medium">Tanggal</th>
                      <th className="p-4 font-medium">Waktu</th>
                      <th className="p-4 font-medium">Tipe</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {appointments.length > 0 ? appointments.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                              {item.user_name.charAt(0)}
                            </div>
                            <span className="font-medium text-sm text-slate-200">{item.user_name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <CalendarClock className="w-4 h-4 text-cyan-400"/>
                            <span className="text-xs text-slate-300">
                              {new Date(item.scheduledDate).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-400"/>
                            <span className="text-xs text-slate-300">{item.scheduledTime}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            item.isFuture ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          }`}>{item.type}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold uppercase ${item.isFuture ? 'text-amber-400' : 'text-slate-500'}`}>
                            {item.isFuture ? 'Akan Datang' : 'Selesai'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => {
                              const key = item.user_id ? String(item.user_id) : `guest_${item.user_name}`.toLowerCase();
                              setSelectedUserId(key); setActiveMenu('inbox');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-400 text-xs font-medium transition-all flex items-center gap-2 ml-auto"
                          >
                            <MessageSquare className="w-3 h-3" /> Lihat Chat
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">Belum ada jadwal.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL SCHEDULE */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Calendar className="text-blue-400" size={20} /> Atur Jadwal Konsultasi
              </h3>
              <button onClick={() => setScheduleModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-800/50 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                   {selectedUserId ? (groupedChats[selectedUserId]?.[0]?.user_name?.charAt(0) || 'P') : '?'}
                </div>
                <div className="text-xs text-slate-400">
                  Pasien
                  <p className="text-xs font-bold text-white mt-1">
                    {selectedUserId ? (groupedChats[selectedUserId]?.[0]?.user_name || "Unknown") : "Unknown"}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Tanggal & Waktu</label>
                <input 
                  type="datetime-local" 
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Catatan Tambahan</label>
                <textarea 
                  value={scheduleNote}
                  onChange={(e) => setScheduleNote(e.target.value)}
                  placeholder="Catatan..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none h-24 resize-none"
                ></textarea>
              </div>
            </div>
            <div className="p-4 border-t border-white/5 bg-slate-900/50 flex gap-3">
              <button onClick={() => setScheduleModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors">Batal</button>
              <button onClick={handleSaveSchedule} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all">Simpan Jadwal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ id, label, active, icon, onClick, badge }: { 
  id: string; label: string; active: boolean; icon: React.ReactNode; onClick: () => void; badge?: number 
}) {
  return (
    <div 
      onClick={onClick}
      className={`group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer text-sm font-medium transition-all ${
        active 
          ? 'bg-gradient-to-r from-cyan-500/10 to-transparent text-cyan-400 border border-cyan-500/20' 
          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-[6px] text-[10px] font-bold ${active ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-300'}`}>
          {badge}
        </span>
      )}
    </div>
  );
}