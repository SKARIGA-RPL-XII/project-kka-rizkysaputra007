"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import * as THREE from "three";

// Import Icons dari Lucide React
import { 
  Activity, HeartPulse, BrainCircuit, CalendarClock, 
  FileText, Stethoscope, Pill, Clock, MoreVertical, 
  TrendingUp, ShieldCheck, ChevronRight, Bell, Search,
  PhoneCall, Video, MessageSquare, User, LogOut, Settings
} from "lucide-react";

// --- 1. KOMPONEN BACKGROUND 3D ---
function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.035); 

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25; 

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(0.5, 0); 
    const material = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9, 
      wireframe: true,
      transparent: true,
      opacity: 0.05 
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

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
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
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
}

function StatCard({ title, value, trend, trendUp, icon, color }: StatCardProps) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl hover:bg-slate-900/80 transition-all group cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-white`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
    </div>
  );
}

function ActivityItem({ icon, title, time, color, onClick }: { icon: React.ReactNode, title: string, time: string, color: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
      <div className={`mt-1 p-2 rounded-lg bg-slate-800 border border-white/5 ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {time}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-600 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

// --- MAIN PAGE ---

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("User");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || "User");
      } catch (e) { setUserName("User"); }
    }
    setCheckingAuth(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.replace("/dashboard");
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
            
            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 w-64 focus-within:border-cyan-500/50 focus-within:bg-white/10 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Cari riwayat, dokter..." className="bg-transparent border-none outline-none text-sm ml-2 text-white placeholder-slate-500 w-full" />
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Tombol Notifikasi */}
            <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            </button>
            
            <div className="h-6 w-px bg-white/10 mx-1"></div>

            {/* User Menu Trigger */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">{userName}</p>
                <p className="text-[10px] text-cyan-400 font-medium">Pasien Premium</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-bold shadow-md">
                {initials}
              </div>
            </button>

            {/* Dropdown Menu */}
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
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Halo, {userName} 👋</h1>
            <p className="text-slate-400 text-sm">Berikut adalah ringkasan kesehatan Anda hari ini.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push("/appointment")} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-cyan-400" /> Jadwal
            </button>
            <button onClick={() => router.push("/chat-dokter")} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Chat Dokter
            </button>
          </div>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN (Main) - Span 8 */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard 
                title="Detak Jantung" 
                value="72 BPM" 
                trend="Normal" 
                trendUp={true}
                icon={<HeartPulse className="w-5 h-5 text-rose-400" />} 
                color="bg-rose-500" 
              />
              <StatCard 
                title="Kualitas Tidur" 
                value="7 Jam 20m" 
                trend="+5%" 
                trendUp={true}
                icon={<Activity className="w-5 h-5 text-purple-400" />} 
                color="bg-purple-500" 
              />
              <StatCard 
                title="Kadar Gula" 
                value="98 mg/dL" 
                trend="Stabil" 
                trendUp={true}
                icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />} 
                color="bg-emerald-500" 
              />
            </div>

            {/* AI HERO CARD */}
            <div 
              onClick={() => router.push("/user/konsultasi")}
              className="relative p-6 md:p-8 rounded-3xl bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/20 backdrop-blur-xl overflow-hidden group cursor-pointer hover:border-cyan-400/50 transition-all"
            >
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

            {/* QUICK ACTIONS GRID */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Akses Cepat</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ActionCard 
                  icon={<Stethoscope className="w-6 h-6" />} 
                  label="Konsultasi" 
                  color="text-blue-400" 
                  bg="bg-blue-500/10"
                  onClick={() => router.push("/chat-dokter")} 
                />
                <ActionCard 
                  icon={<Pill className="w-6 h-6" />} 
                  label="Obat-obatan" 
                  color="text-emerald-400" 
                  bg="bg-emerald-500/10"
                  onClick={() => router.push("/medications")} 
                />
                <ActionCard 
                  icon={<FileText className="w-6 h-6" />} 
                  label="Hasil Lab" 
                  color="text-orange-400" 
                  bg="bg-orange-500/10"
                  onClick={() => router.push("/lab-results")} 
                />
                <ActionCard 
                  icon={<Video className="w-6 h-6" />} 
                  label="Telemedisin" 
                  color="text-purple-400" 
                  bg="bg-purple-500/10"
                  onClick={() => router.push("/telemedicine")} 
                />
              </div>
            </div>

            {/* UPCOMING APPOINTMENTS TABLE/CARD */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-white">Jadwal Mendatang</h3>
                <button onClick={() => router.push("/appointment")} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">Lihat Semua</button>
              </div>
              
              <div className="space-y-3">
                {/* Appointment Item 1 */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => router.push("/appointment/1")}>
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

                {/* Appointment Item 2 */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => router.push("/appointment/2")}>
                  <div className="flex items-center gap-4">
                    <div className="text-center px-3 py-2 bg-slate-800 rounded-lg border border-white/10 min-w-[60px]">
                      <p className="text-xs text-slate-400 uppercase">Nov</p>
                      <p className="text-xl font-bold text-white">02</p>
                    </div>
                    <div>
                      <p className="font-bold text-white">Konsultasi Kesehatan</p>
                      <p className="text-xs text-slate-400">dr. Budi Santoso • Spesialis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/20">14:30 PM</span>
                    <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (Sidebar) - Span 4 */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Profile / Health Score Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 rounded-2xl p-6 text-center relative overflow-hidden cursor-pointer" onClick={() => router.push("/profile")}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"></div>
              <div className="w-20 h-20 mx-auto rounded-full p-1 bg-gradient-to-tr from-cyan-400 to-purple-500 mb-3">
                <img src={`https://ui-avatars.com/api/?name=${userName}&background=0f172a&color=fff`} alt="Profile" className="w-full h-full rounded-full border-4 border-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-white">{userName}</h3>
              <p className="text-sm text-slate-400 mb-4">Gold Member</p>
              
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs text-slate-400">Skor Kesehatan</span>
                <span className="text-2xl font-bold text-cyan-400">85<span className="text-sm text-slate-500 font-normal">/100</span></span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 w-[85%] rounded-full"></div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-5">
              <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Aktivitas Terkini
              </h3>
              
              <div className="space-y-1">
                <ActivityItem 
                  icon={<HeartPulse className="w-4 h-4 text-rose-400" />} 
                  title="Pencatatan Detak Jantung" 
                  time="2 jam yang lalu" 
                  color="hover:bg-rose-500/10"
                  onClick={() => router.push("/history")}
                />
                <ActivityItem 
                  icon={<Pill className="w-4 h-4 text-emerald-400" />} 
                  title="Pengingat Obat: Vitamin C" 
                  time="5 jam yang lalu" 
                  color="hover:bg-emerald-500/10"
                  onClick={() => router.push("/medications")}
                />
                <ActivityItem 
                  icon={<FileText className="w-4 h-4 text-blue-400" />} 
                  title="Hasil Lab Darah Keluar" 
                  time="1 hari yang lalu" 
                  color="hover:bg-blue-500/10"
                  onClick={() => router.push("/lab-results")}
                />
                <ActivityItem 
                  icon={<Video className="w-4 h-4 text-purple-400" />} 
                  title="Selesai Video Call dr. Sarah" 
                  time="3 hari yang lalu" 
                  color="hover:bg-purple-500/10"
                  onClick={() => router.push("/history")}
                />
              </div>
              
              <button onClick={() => router.push("/history")} className="w-full mt-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-dashed border-white/10">
                Lihat Semua Riwayat
              </button>
            </div>

            {/* Promo / Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white relative overflow-hidden group cursor-pointer">
              <div className="relative z-10">
                <h4 className="font-bold text-lg mb-1">Upgrade ke Pro</h4>
                <p className="text-xs text-indigo-200 mb-3">Dapatkan akses prioritas ke dokter spesialis.</p>
                <div className="text-xs font-bold bg-white text-indigo-600 inline-block px-3 py-1.5 rounded-lg group-hover:scale-105 transition-transform">
                  Lihat Paket
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors"></div>
            </div>

          </div>
        </div>
      </main>

      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          to { opacity: 1; transform: translateY(0); }
          from { opacity: 0; transform: translateY(10px); }
        }
      `}</style>
    </div>
  );
}

// Helper Component for Quick Actions
function ActionCard({ icon, label, color, bg, onClick }: { icon: React.ReactNode, label: string, color: string, bg: string, onClick: () => void }) {
  return (
    <div onClick={onClick} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group flex flex-col items-center justify-center gap-3 text-center">
      <div className={`p-3 rounded-full ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-300 group-hover:text-white">{label}</span>
    </div>
  );
}