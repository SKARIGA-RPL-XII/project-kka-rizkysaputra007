"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Stethoscope, History, 
  LogOut, Menu, X, Activity, UserCheck, Pencil, Check, XCircle, Loader2, Trash2 
} from "lucide-react";

// --- TIPES DATA ---
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string; 
};

type DashboardStats = {
  users: number;
  doctors: number;
  consultations: number;
};

type LoginHistory = {
  id: number;
  user_id: number;
  email: string;
  login_time: string;
  status: 'success' | 'failed';
};

export default function AdminPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Data
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ users: 0, doctors: 0, consultations: 0 });
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  
  // State Edit Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  /* ================= AUTH & DATA FETCHING ================= */
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
      } catch (e) { console.error("Gagal parse user", e); }
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // 1. Fetch Dashboard & Users
      const res = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (Array.isArray(data.users)) setUsers(data.users);
      }

      // 2. Fetch Login History
      // Pastikan API /api/admin/login-history sudah ada
      try {
        const histRes = await fetch('/api/admin/login-history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (histRes.ok) {
          const histData = await histRes.json();
          setLoginHistory(Array.isArray(histData) ? histData : []);
        }
      } catch (e) {
        console.warn("Gagal fetch history (API mungkin belum ada)");
      }

    } catch (error: any) {
      console.error("Error Frontend:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/login");
  };

  /* ================= FUNGSI DELETE USER ================= */
  const handleDeleteUser = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini? Data tidak bisa dikembalikan.")) return;

    try {
      const token = localStorage.getItem("token");
      // Asumsikan API mendukung DELETE
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        // Hapus dari state lokal
        setUsers(users.filter(u => u.id !== id));
        alert("User berhasil dihapus.");
      } else {
        alert("Gagal menghapus user.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  /* ================= FUNGSI EDIT USER ================= */
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setEditingUser(null);
    setIsUserModalOpen(false);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role
        }),
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
        closeUserModal();
        alert("Data user berhasil diperbarui!");
      } else {
        const err = await res.json();
        alert("Gagal mengupdate: " + err.error);
      }
    } catch (error: any) {
      console.error(error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-cyan-500/30">
      
      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
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
          <button className="md:hidden text-slate-400" onClick={() => setSidebarOpen(false)}><X className="w-6 h-6" /></button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeMenu === "dashboard"} onClick={() => setActiveMenu("dashboard")} />
          <NavItem icon={<Users size={20} />} label="Data User" active={activeMenu === "users"} onClick={() => setActiveMenu("users")} />
          <NavItem icon={<Stethoscope size={20} />} label="Data Dokter" active={activeMenu === "doctors"} onClick={() => setActiveMenu("doctors")} />
          <NavItem icon={<History size={20} />} label="Riwayat Login" active={activeMenu === "history"} onClick={() => setActiveMenu("history")} />
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
            <button className="md:hidden text-slate-400" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
            <h2 className="text-xl font-bold capitalize text-white">{activeMenu}</h2>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-semibold text-white">Administrator</p>
               <p className="text-xs text-cyan-400">Super Admin</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold">AD</div>
          </div>
        </header>

        {/* CONTENT SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* DASHBOARD VIEW */}
              {activeMenu === "dashboard" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total User" value={stats.users.toString()} icon={<UserCheck className="text-cyan-400" />} color="cyan" />
                    <StatCard title="Total Dokter" value={stats.doctors.toString()} icon={<Stethoscope className="text-purple-400" />} color="purple" />
                    <StatCard title="Total Konsultasi" value={stats.consultations.toString()} icon={<Activity className="text-emerald-400" />} color="emerald" />
                  </div>

                  {/* Preview Table Recent Users (Mixed) */}
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
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>{user.role}</span>
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

              {/* USERS VIEW (Filtered Role: 'user') */}
              {activeMenu === "users" && (
                <div className="animate-fade-in">
                  <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">Data Pasien (User)</h3>
                      <button className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20">
                        <UserCheck size={16} /> Total: {users.filter(u => u.role === 'user').length} Pasien
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase">
                            <tr>
                              <th className="p-4 rounded-l-lg">ID</th>
                              <th className="p-4">Nama</th>
                              <th className="p-4">Email</th>
                              <th className="p-4">Role</th>
                              <th className="p-4 rounded-r-lg">Terdaftar</th>
                              <th className="p-4">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-sm">
                            {users.filter(u => u.role === 'user').map((u) => (
                              <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 text-slate-500">#{u.id}</td>
                                <td className="p-4 font-medium text-white">{u.name}</td>
                                <td className="p-4">{u.email}</td>
                                <td className="p-4">
                                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">{u.role}</span>
                                </td>
                                <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                                <td className="p-4 flex gap-2">
                                  <button onClick={() => openEditModal(u)} className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white transition-colors"><Pencil size={16} /></button>
                                  <button onClick={() => handleDeleteUser(u.id)} className="p-2 rounded-lg bg-slate-800 hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={16} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                  </div>
                </div>
              )}

              {/* DOCTORS VIEW (Filtered Role: 'dokter') */}
              {activeMenu === "doctors" && (
                <div className="animate-fade-in">
                  <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">Data Dokter</h3>
                      <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20">
                        <Stethoscope size={16} /> Total: {users.filter(u => u.role === 'dokter').length} Dokter
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase">
                            <tr>
                              <th className="p-4 rounded-l-lg">ID</th>
                              <th className="p-4">Nama</th>
                              <th className="p-4">Email</th>
                              <th className="p-4">Role</th>
                              <th className="p-4 rounded-r-lg">Terdaftar</th>
                              <th className="p-4">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-sm">
                            {users.filter(u => u.role === 'dokter').map((u) => (
                              <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 text-slate-500">#{u.id}</td>
                                <td className="p-4 font-medium text-white">{u.name}</td>
                                <td className="p-4">{u.email}</td>
                                <td className="p-4">
                                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">{u.role}</span>
                                </td>
                                <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                                <td className="p-4 flex gap-2">
                                  <button onClick={() => openEditModal(u)} className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white transition-colors"><Pencil size={16} /></button>
                                  <button onClick={() => handleDeleteUser(u.id)} className="p-2 rounded-lg bg-slate-800 hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={16} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                  </div>
                </div>
              )}
              
              {/* HISTORY LOGIN VIEW */}
              {activeMenu === "history" && (
                 <div className="animate-fade-in">
                  <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">Riwayat Login User</h3>
                      <button className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold">
                        Total: {loginHistory.length}
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase">
                            <tr>
                              <th className="p-4 rounded-l-lg">ID User</th>
                              <th className="p-4">Email</th>
                              <th className="p-4">Waktu Login</th>
                              <th className="p-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-sm">
                            {loginHistory.length > 0 ? (
                              loginHistory.map((log) => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                  <td className="p-4 text-slate-500">#{log.user_id}</td>
                                  <td className="p-4 font-medium text-white">{log.email}</td>
                                  <td className="p-4 text-slate-300">{new Date(log.login_time).toLocaleString('id-ID')}</td>
                                  <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                      {log.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500 text-sm">Belum ada data riwayat login.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      {/* --- EDIT USER MODAL --- */}
      {isUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-600"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Edit Data User</h3>
              <button onClick={closeUserModal} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={editingUser.name} 
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase font-bold mb-1">Email</label>
                <input 
                  type="email" 
                  value={editingUser.email} 
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase font-bold mb-1">Role</label>
                <select 
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                >
                  <option value="user">User</option>
                  <option value="dokter">Dokter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="bg-slate-950/50 p-3 rounded-lg border border-white/5 text-xs text-slate-400">
                ID: {editingUser.id}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeUserModal} className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors">
                Batal
              </button>
              <button 
                onClick={handleSaveUser} 
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <>Simpan <Check size={16} /></>}
              </button>
            </div>
          </div>
        </div>
      )}

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
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left ${active ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: any, color: string }) {
  const colorClasses = { cyan: "bg-cyan-500/10 text-cyan-400", purple: "bg-purple-500/10 text-purple-400", emerald: "bg-emerald-500/10 text-emerald-400" };
  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:bg-slate-800/50 transition-colors">
      <div className={`absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClasses[color]}`}>{React.cloneElement(icon, { size: 80 })}</div>
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color]}`}>{React.cloneElement(icon, { size: 20 })}</div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-1 text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );
}