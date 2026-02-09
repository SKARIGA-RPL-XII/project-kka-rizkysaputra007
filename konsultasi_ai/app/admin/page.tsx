"use client";

import React, { useEffect, useState } from "react"; // <--- PENTING: Tambahkan React
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Stethoscope, History, 
  LogOut, Menu, X, Activity, UserCheck 
} from "lucide-react";

// Definisi Tipe Data
type DashboardStats = {
  users: number;
  doctors: number;
  consultations: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string; // Pastikan SQL mengembalikan nama kolom yang SAMA dengan ini
};

type Doctor = {
  id: number;
  name: string;
  specialist: string;
  patients: number;
};

export default function AdminPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Data dari Database
  const [stats, setStats] = useState<DashboardStats>({ users: 0, doctors: 0, consultations: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  /* ================= AUTH PROTECTION & DATA FETCHING ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role?.toLowerCase() !== "admin") {
          router.replace("/unauthorized");
          return;
        }
      } catch (e) {
        console.error("Gagal parse user", e);
      }
    }

    // Fetch Data
    fetchDashboardData(token);
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store' // Agar data selalu fresh
      });

      if (!res.ok) {
        // Coba baca pesan error dari API
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal mengambil data dari server");
      }

      const data = await res.json();

      // --- PENCEGAHAN ERROR ---
      // Pastikan struktur data sesuai sebelum di-set ke state
      if (data.stats) setStats(data.stats);
      if (Array.isArray(data.users)) setUsers(data.users);
      if (Array.isArray(data.doctors)) setDoctors(data.doctors);

    } catch (error: any) {
      console.error("Error Frontend:", error);
      alert(`Error: ${error.message}`); // Tampilkan error ke user agar tahu masalahnya
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/login");
  };

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-cyan-500/30">
      
      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 
        transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">Health<span className="text-cyan-400">Admin</span></h1>
              <p className="text-xs text-slate-400">Database Connected</p>
            </div>
          </div>
          <button className="md:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeMenu === "dashboard"} 
            onClick={() => { setActiveMenu("dashboard"); setSidebarOpen(false); }} 
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Data User" 
            active={activeMenu === "users"} 
            onClick={() => { setActiveMenu("users"); setSidebarOpen(false); }} 
          />
          <NavItem 
            icon={<Stethoscope size={20} />} 
            label="Data Dokter" 
            active={activeMenu === "doctors"} 
            onClick={() => { setActiveMenu("doctors"); setSidebarOpen(false); }} 
          />
          <NavItem 
            icon={<History size={20} />} 
            label="Riwayat Login" 
            active={activeMenu === "history"} 
            onClick={() => { setActiveMenu("history"); setSidebarOpen(false); }} 
          />
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all group">
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Keluar</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-72 h-screen flex flex-col">
        {/* HEADER */}
        <header className="h-20 border-b border-white/5 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-400" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold capitalize text-white">
              {activeMenu}
            </h2>
          </div>
          
          {/* User Profile Mini */}
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-semibold text-white">Administrator</p>
               <p className="text-xs text-cyan-400">Super Admin</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold">
               AD
             </div>
          </div>
        </header>

        {/* CONTENT SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* DASHBOARD VIEW */}
              {activeMenu === "dashboard" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                      title="Total User" 
                      value={stats.users.toString()} 
                      icon={<UserCheck className="text-cyan-400" />} 
                      color="cyan"
                    />
                    <StatCard 
                      title="Total Dokter" 
                      value={stats.doctors.toString()} 
                      icon={<Stethoscope className="text-purple-400" />} 
                      color="purple"
                    />
                    <StatCard 
                      title="Total Konsultasi" 
                      value={stats.consultations.toString()} 
                      icon={<Activity className="text-emerald-400" />} 
                      color="emerald"
                    />
                  </div>

                  {/* Preview Table Recent Users */}
                  <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                      <h3 className="font-semibold text-lg">User Terbaru</h3>
                      <button onClick={() => setActiveMenu('users')} className="text-xs text-cyan-400 hover:underline">Lihat Semua</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-white/5 bg-slate-950/30">
                            <th className="p-4 font-medium">Nama</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Role</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-white/5">
                          {users.length > 0 ? (
                            users.slice(0, 5).map((user) => (
                              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-white">{user.name}</td>
                                <td className="p-4 text-slate-400">{user.email}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                                  }`}>
                                    {user.role}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan={3} className="p-4 text-center text-slate-500">Data User Kosong</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* USERS VIEW */}
              {activeMenu === "users" && (
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 animate-fade-in">
                  <h3 className="text-xl font-bold mb-6">Semua Data User</h3>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase">
                          <tr>
                            <th className="p-4 rounded-l-lg">ID</th>
                            <th className="p-4">Nama</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4 rounded-r-lg">Terdaftar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {users.map((u) => (
                            <tr key={u.id} className="hover:bg-white/5">
                              <td className="p-4 text-slate-500">#{u.id}</td>
                              <td className="p-4 font-medium text-white">{u.name}</td>
                              <td className="p-4">{u.email}</td>
                              <td className="p-4">{u.role}</td>
                              {/* Pengecekan aman untuk tanggal */}
                              <td className="p-4 text-slate-400">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
              )}

              {/* DOCTORS VIEW */}
              {activeMenu === "doctors" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                  {doctors.map((doc) => (
                    <div key={doc.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 transition-all group">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 text-xl font-bold group-hover:scale-110 transition-transform">
                          DR
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-white">{doc.name}</h4>
                          <p className="text-sm text-cyan-400">{doc.specialist}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <span className="text-xs text-slate-400">Pasien Aktif</span>
                        <span className="font-bold text-white">{doc.patients}</span>
                      </div>
                    </div>
                  ))}
                  {/* Tambah tombol tambah dokter placeholder */}
                  <div className="border border-dashed border-white/10 rounded-2xl flex items-center justify-center min-h-[160px] hover:bg-white/5 cursor-pointer transition-colors">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Users size={16} /> Tambah Dokter Baru
                    </span>
                  </div>
                </div>
              )}
              
              {/* HISTORY VIEW (Placeholder) */}
              {activeMenu === "history" && (
                 <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-white/10 rounded-2xl">
                  <History size={48} className="mb-4 opacity-50" />
                  <p>Fitur Riwayat Login akan dikembangkan.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left
        ${active 
          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
          : "text-slate-400 hover:bg-white/5 hover:text-white"
        }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: any, color: string }) {
  const colorClasses = {
    cyan: "bg-cyan-500/10 text-cyan-400",
    purple: "bg-purple-500/10 text-purple-400",
    emerald: "bg-emerald-500/10 text-emerald-400"
  };

  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:bg-slate-800/50 transition-colors">
      <div className={`absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClasses[color]}`}>
        {React.cloneElement(icon, { size: 80 })}
      </div>
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color]}`}>
          {React.cloneElement(icon, { size: 20 })}
        </div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-1 text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );
}