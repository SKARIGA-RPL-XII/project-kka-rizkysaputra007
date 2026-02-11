"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import * as THREE from "three";

// Import Icons
import { 
  Activity, HeartPulse, BrainCircuit, CalendarClock, 
  FileText, Stethoscope, Pill, Clock, MoreVertical, 
  TrendingUp, ShieldCheck, ChevronRight, Bell, Search,
  MessageSquare, User, LogOut, Settings, 
  BookOpen, Droplets, Footprints, Calendar, Loader2, 
  Bot // Tambah Bot icon untuk diagnosa
} from "lucide-react";

// --- TYPES & INTERFACES ---

interface Vitals {
  id?: number;
  user_id?: number;
  heart_rate: number | null;
  blood_sugar: number | null;
  sleep_duration: number | null;
  created_at: string;
}

interface Consultation {
  id: number;
  user_id: number;
  symptoms: string;
  status: string;
  created_at: string;
  ai_diagnosis?: string;
  doctor_reply?: string;
  // Kolom baru yang ditambahkan sebelumnya
  heart_rate?: string | null;
  blood_sugar?: string | null;
  sleep_duration?: string | null;
}

interface Notification {
  id: number;
  symptoms?: string;
  message?: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
}

// Tipe Aktivitas Terpadu untuk Timeline
interface ActivityItem {
  id: string;
  type: 'consultation' | 'vital' | 'reply';
  title: string;
  description: string;
  time: Date;
  data?: any; // Menyimpan detail raw jika perlu
}

// --- 1. KOMPONEN BACKGROUND 3D ---
function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    // Fog halus untuk kedalaman
    scene.fog = new THREE.FogExp2(0x020617, 0.035); 

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25; 

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const geometry = new THREE.IcosahedronGeometry(0.5, 0); 
    const material = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9, 
      wireframe: true,
      transparent: true,
      opacity: 0.08
    });

    const particles: THREE.Mesh[] = [];
    const particleCount = 80; 

    for (let i = 0; i < particleCount; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = (Math.random() - 0.5) * 60;
      mesh.position.y = (Math.random() - 0.5) * 60;
      mesh.position.z = (Math.random() - 0.5) * 40;
      
      const scale = Math.random() * 1.5 + 0.2;
      mesh.scale.set(scale, scale, scale);
      
      mesh.userData = {
        rotX: (Math.random() - 0.5) * 0.005,
        rotY: (Math.random() - 0.5) * 0.005,
        velY: (Math.random() * 0.005) + 0.001
      };
      scene.add(mesh);
      particles.push(mesh);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      
      const time = Date.now() * 0.0005;
      camera.position.x = Math.sin(time) * 2;
      camera.position.y = Math.cos(time) * 2;
      camera.lookAt(scene.position);

      particles.forEach((p) => {
        p.rotation.x += p.userData.rotX;
        p.rotation.y += p.userData.rotY;
        p.position.y += p.userData.velY;
        if (p.position.y > 30) p.position.y = -30;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none" />;
}

const DynamicThreeBackground = dynamic(() => Promise.resolve(ThreeBackground), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-slate-950 z-0" />
});

// --- SUB COMPONENTS ---

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  color: string;
  isAvailable: boolean; 
}

function StatCard({ title, value, trend, trendUp, icon, color, isAvailable }: StatCardProps) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl hover:bg-slate-900/80 transition-all group cursor-default relative overflow-hidden">
      {isAvailable && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-3xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
      )}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-white`}>
          {icon}
        </div>
        {trend && isAvailable && (
          <div className={`flex items-center text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">{title}</p>
      <h3 className={`text-2xl font-bold ${!isAvailable ? 'text-slate-700' : 'text-white'} relative z-10`}>{value}</h3>
    </div>
  );
}

// --- MAIN PAGE ---

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("User");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State Data Dinamis
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [isLoadingVitals, setIsLoadingVitals] = useState(false);
  
  // State Aktivitas Terkini (Terpadu)
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // State Notifikasi
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // 1. Cek Auth
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user: User = JSON.parse(userData);
        setUserName(user.name || "User");
      } catch (e) { 
        console.error("Error parsing user data", e);
        setUserName("User"); 
      }
    }
    setCheckingAuth(false);
  }, [router]);

  // Helper: Format Waktu Relatif
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  // 2. Fetch Data & Generate Aktivitas
  const fetchData = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    
    let user: User;
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      return;
    }

    if (!user.id) return;

    try {
      // A. Fetch Vitals Terbaru
      setIsLoadingVitals(true);
      const resVitals = await fetch(`/api/user/vitals?userId=${user.id}`);
      let vitalsData: Vitals | null = null;
      
      if (resVitals.ok) {
        vitalsData = await resVitals.json();
        setVitals(vitalsData);
      }
    } catch (error) {
      console.error("Gagal mengambil vitals:", error);
    } finally {
      setIsLoadingVitals(false);
    }

    try {
      // B. Fetch Riwayat Konsultasi
      const resConsultations = await fetch(`/api/user/consultations?userId=${user.id}`, { cache: 'no-store' });
      if (resConsultations.ok) {
        const dataConsults: Consultation[] = await resConsultations.json();
        setConsultations(dataConsults);
      }
    } catch (error) {
      console.error("Gagal mengambil konsultasi:", error);
    }
  };

  // 3. Generate Logika Aktivitas Terkini
  useEffect(() => {
    const activityList: ActivityItem[] = [];

    // A. Masukkan Data Vitals jika ada (Aktivitas input manual jika ada fitur profile)
    if (vitals) {
      activityList.push({
        id: `vital-${vitals.id}`,
        type: 'vital',
        title: 'Update Data Vitals',
        description: 'Data kesehatan vital terbaru diperbarui.',
        time: new Date(vitals.created_at),
        data: vitals
      });
    }

    // B. Masukkan Riwayat Konsultasi
    consultations.forEach((c) => {
      let title = "Konsultasi Baru";
      let description = c.symptoms.substring(0, 50) + (c.symptoms.length > 50 ? "..." : "");
      let type: 'consultation' | 'reply' = 'consultation';

      // Deteksi: Apakah ada balasan dokter?
      if (c.doctor_reply && c.doctor_reply.trim() !== "") {
        title = "Dokter Membalas";
        description = `Respon dokter untuk keluhan: "${c.symptoms.substring(0, 20)}..."`;
        type = 'reply';
      } 
      // Deteksi: Apakah user menginput data vitals bersamaan gejala?
      else if (c.heart_rate || c.blood_sugar || c.sleep_duration) {
        const parts = [];
        if (c.heart_rate) parts.push(`Nadi: ${c.heart_rate}`);
        if (c.blood_sugar) parts.push(`Gula: ${c.blood_sugar}`);
        if (c.sleep_duration) parts.push(`Tidur: ${c.sleep_duration}j`);
        
        title = "Input Gejala & Vitals";
        description = `${parts.join(', ')} • ${c.symptoms.substring(0, 30)}...`;
      }

      activityList.push({
        id: `consult-${c.id}`,
        type: type,
        title: title,
        description: description,
        time: new Date(c.created_at),
        data: c
      });
    });

    // C. Urutkan berdasarkan waktu terbaru
    activityList.sort((a, b) => b.time.getTime() - a.time.getTime());

    setActivities(activityList);
  }, [consultations, vitals]);

  useEffect(() => {
    fetchData();
  }, []);

  // 4. Fetch Notifikasi
  const fetchNotifications = async () => {
    const userStr = localStorage.getItem("user");
    if(userStr) {
      let user: User;
      try {
        user = JSON.parse(userStr);
        if (!user.id) return;

        const res = await fetch(`/api/user/notifications?userId=${user.id}`);
        if(res.ok) {
          const data: Notification[] = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Gagal ambil notif", error);
      }
    }
  };
  
  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.replace("/login");
  };

  if (checkingAuth) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={null}><DynamicThreeBackground /></Suspense>
      </div>
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950/80 to-slate-950 pointer-events-none" />

      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-wide text-white">Health<span className="text-cyan-400">Space</span></span>
            </div>
            
            <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 w-64 focus-within:border-cyan-500/50 focus-within:bg-white/10 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Cari riwayat, dokter..." className="bg-transparent border-none outline-none text-sm ml-2 text-white placeholder-slate-500 w-full" />
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* --- NOTIFIKASI --- */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)} 
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">{notifications.length}</span>
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                  <div className="p-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <span className="text-xs font-bold text-white">Notifikasi</span>
                    <span className="text-[10px] text-cyan-400 cursor-pointer hover:underline">Tandai semua dibaca</span>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs">Tidak ada notifikasi baru.</div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          onClick={() => {
                            setIsNotifOpen(false);
                            router.push(`/user/chat-dokter?id=${notif.id}`);
                          }}
                          className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                        >
                          <div className="flex gap-3">
                            <div className="mt-1 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white mb-0.5">Balasan Dokter Masuk</p>
                              <p className="text-[10px] text-slate-400 line-clamp-2">
                                Dokter telah membalas keluhan Anda: "{notif.message || notif.symptoms || 'Konsultasi'}"
                              </p>
                              <p className="text-[9px] text-slate-500 mt-1">
                                {new Date(notif.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-white/5 text-center">
                    <button onClick={() => {setIsNotifOpen(false); router.push("/user/chat-dokter")}} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium w-full py-1">Lihat Semua Chat</button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-6 w-px bg-white/10 mx-1"></div>

            {/* --- USER MENU --- */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">{userName}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-bold shadow-md">
                {initials}
              </div>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                <div onClick={() => { setIsMenuOpen(false); router.push("/profile"); }} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-white">Profil Saya</span>
                </div>
                <div onClick={() => { setIsMenuOpen(false); router.push("/settings"); }} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-white">Pengaturan</span>
                </div>
                <div className="h-px bg-white/10 my-1"></div>
                <div onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 cursor-pointer transition-colors text-rose-400">
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Keluar</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT GRID --- */}
      <main className="relative z-10 pt-24 pb-12 px-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Halo, {userName} 👋</h1>
            <p className="text-slate-400 text-sm">Berikut adalah ringkasan kesehatan Anda hari ini.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push("/appointment")} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-cyan-400" /> Jadwal
            </button>
            <button onClick={() => router.push("/user/chat-dokter")} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Chat Dokter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ringkasan Kesehatan</h3>
              <div className="flex items-center gap-2">
                {isLoadingVitals && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                <span className="text-xs text-slate-500 italic">
                  {vitals ? "Data Terakhir: " + new Date(vitals.created_at).toLocaleDateString() : "Belum ada data vitals"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Detak Jantung */}
              <StatCard 
                title="Detak Jantung" 
                value={vitals?.heart_rate ? `${vitals.heart_rate} BPM` : "-"} 
                trend={vitals?.heart_rate ? "Normal" : undefined} 
                trendUp={true} 
                icon={<HeartPulse className="w-5 h-5 text-rose-400" />} 
                color="bg-rose-500"
                isAvailable={!!(vitals?.heart_rate)} 
              />
              
              {/* Kualitas Tidur */}
              <StatCard 
                title="Kualitas Tidur" 
                value={vitals?.sleep_duration ? `${vitals.sleep_duration} Jam` : "-"} 
                trend={vitals?.sleep_duration ? "Tercatat" : undefined}
                trendUp={true} 
                icon={<Activity className="w-5 h-5 text-purple-400" />} 
                color="bg-purple-500" 
                isAvailable={!!(vitals?.sleep_duration)} 
              />
              
              {/* Kadar Gula */}
              <StatCard 
                title="Kadar Gula" 
                value={vitals?.blood_sugar ? `${vitals.blood_sugar} mg/dL` : "-"} 
                trend={vitals?.blood_sugar ? "Tercatat" : undefined}
                trendUp={true} 
                icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />} 
                color="bg-emerald-500" 
                isAvailable={!!(vitals?.blood_sugar)} 
              />
            </div>

            <div onClick={() => router.push("/user/konsultasi")} className="relative p-6 md:p-8 rounded-3xl bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/20 backdrop-blur-xl overflow-hidden group cursor-pointer hover:border-cyan-400/50 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-4">
                    <BrainCircuit className="w-3 h-3" /> AI POWERED
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Cek Kesehatan Cerdas</h2>
                  <p className="text-slate-300 text-sm md:text-base max-w-lg">
                    Gunakan asisten AI kami untuk menganalisis gejala yang Anda rasakan sekarang. Dapatkan diagnosa awal dalam hitungan detik.
                  </p>
                </div>
                <button className="shrink-0 px-6 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-cyan-50 hover:scale-105 transition-all shadow-xl shadow-white/10 flex items-center gap-2">
                  Mulai Analisa <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Akses Cepat</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> 
                <ActionCard icon={<Stethoscope className="w-6 h-6" />} label="Konsultasi" color="text-blue-400" bg="bg-blue-500/10" onClick={() => router.push("/user/chat-dokter")} />
                <ActionCard icon={<Pill className="w-6 h-6" />} label="Obat-obatan" color="text-emerald-400" bg="bg-emerald-500/10" onClick={() => router.push("/medications")} />
                <ActionCard icon={<FileText className="w-6 h-6" />} label="Hasil Lab" color="text-orange-400" bg="bg-orange-500/10" onClick={() => router.push("/lab-results")} />
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-white">Jadwal Mendatang</h3>
                <button onClick={() => router.push("/appointment")} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">Lihat Semua</button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="text-center px-3 py-2 bg-slate-800 rounded-lg border border-white/10 min-w-[60px]">
                      <p className="text-xs text-slate-400 uppercase">Okt</p>
                      <p className="text-xl font-bold text-white">24</p>
                    </div>
                    <div>
                      <p className="font-bold text-white">Check-up Rutin</p>
                      <p className="text-xs text-slate-400">dr. Sarah Wijaya • Umum</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 text-xs font-medium border border-cyan-500/20">09:00 AM</span>
                    <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* --- KARTU PROFIL --- */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 rounded-2xl p-6 text-center relative overflow-hidden cursor-pointer" onClick={() => router.push("/profile")}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"></div>
              <div className="w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-tr from-cyan-400 to-purple-500 mb-4 shadow-lg shadow-cyan-500/10">
                <img src={`https://ui-avatars.com/api/?name=${userName}&background=0f172a&color=fff&size=128`} alt="Profile" className="w-full h-full rounded-full border-4 border-slate-900" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{userName}</h3>
              <p className="text-xs text-slate-500">Selamat Datang Kembali</p>
            </div>

            {/* --- AKTIVITAS TERKINI (FUNGSIONAL) --- */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex flex-col">
              <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Aktivitas Terkini
              </h3>
              <div className="space-y-1 flex-1 overflow-y-auto max-h-[400px]">
                {activities.length > 0 ? (
                  activities.slice(0, 10).map((act) => {
                    // Tentukan Icon berdasarkan Tipe Aktivitas
                    let icon = <MessageSquare className="w-4 h-4 text-slate-400" />;
                    let colorClass = "text-slate-400";
                    
                    if (act.type === 'vital') {
                      icon = <HeartPulse className="w-4 h-4 text-rose-400" />;
                      colorClass = "text-rose-400";
                    } else if (act.type === 'reply') {
                      icon = <Stethoscope className="w-4 h-4 text-emerald-400" />;
                      colorClass = "text-emerald-400";
                    } else if (act.title.includes("Input Gejala & Vitals")) {
                      icon = <Bot className="w-4 h-4 text-cyan-400" />;
                      colorClass = "text-cyan-400";
                    }

                    return (
                      <div 
                        key={act.id}
                        onClick={() => {
                           if(act.type !== 'vital') router.push("/user/chat-dokter");
                        }}
                        className={`flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group ${act.type === 'vital' ? 'cursor-default' : ''}`}
                      >
                        <div className="mt-1 p-2 rounded-lg bg-slate-800 border border-white/5 group-hover:scale-110 transition-transform duration-200">
                          <div className={colorClass}>{icon}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{act.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {act.description}
                          </p>
                          <p className="text-[9px] text-slate-600 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {getTimeAgo(act.time.toISOString())}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-slate-600 text-xs italic">
                    Belum ada aktivitas.
                  </div>
                )}
              </div>

              <button onClick={() => router.push("/user/chat-dokter")} className="w-full mt-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-dashed border-white/10">
                Lihat Semua Riwayat
              </button>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; opacity: 0; }
        @keyframes fadeIn { to { opacity: 1; transform: translateY(0); } from { opacity: 0; transform: translateY(10px); } }
      `}</style>
    </div>
  );
}

function ActionCard({ icon, label, color, bg, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  color: string, 
  bg: string, 
  onClick: () => void 
}) {
  return (
    <div onClick={onClick} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group flex flex-col items-center justify-center gap-3 text-center">
      <div className={`p-3 rounded-full ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
      <span className="text-sm font-medium text-slate-300 group-hover:text-white">{label}</span>
    </div>
  );
}