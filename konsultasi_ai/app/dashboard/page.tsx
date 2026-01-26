"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar/page";

/* ICONS */
const MenuIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const MessageIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const HeartIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l7.78-7.78a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
  </svg>
);

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const navigate = (menu: string, path: string) => {
    setActiveMenu(menu);
    setSidebarOpen(false);
    router.push(path);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        activeMenu={activeMenu}
        handleMenuClick={setActiveMenu}
        handleLogout={() => alert("Logout dummy")}
      />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "md:ml-72" : "md:ml-0"}`}>

        {/* HEADER */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b shadow-sm flex items-center px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-gray-100 transition"
          >
            <MenuIcon />
          </button>

          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Kelola kesehatan Anda
            </p>
          </div>
        </header>

        {/* MAIN */}
        <main className="p-6 space-y-8">

          {/* STAT BOX */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatBox title="Total Konsultasi" value="12" icon={<MessageIcon />} />
            <StatBox title="Riwayat" value="8" icon={<ClockIcon />} />
            <StatBox title="Kesehatan" value="Baik" icon={<HeartIcon />} />
            <StatBox title="Aktivitas" value="Aktif" icon={<TrendingUpIcon />} />
          </div>

          {/* ACTION BOX (SEPERTI AWAL) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <ActionBox
              title="Konsultasi Kesehatan"
              desc="Diskusikan keluhan Anda dengan AI kesehatan"
              icon={<MessageIcon />}
              onClick={() => navigate("konsultasi", "/konsultasi")}
              gradient="from-blue-500 to-purple-600"
            />

            <ActionBox
              title="Riwayat Konsultasi"
              desc="Lihat dan pantau hasil konsultasi sebelumnya"
              icon={<ClockIcon />}
              onClick={() => navigate("riwayat", "/history")}
              gradient="from-slate-700 to-slate-900"
            />
          </div>

        </main>
      </div>
    </div>
  );
}

/* COMPONENTS */

function StatBox({ title, value, icon }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
      <div className="flex justify-between mb-4">
        <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
          {icon}
        </div>
        <TrendingUpIcon />
      </div>
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
    </div>
  );
}

function ActionBox({ title, desc, icon, onClick, gradient }: any) {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl p-8 text-white bg-gradient-to-br ${gradient}
        hover:scale-[1.01] transition-all duration-300 shadow-xl`}
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
      <div className="relative z-10">
        <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-white/90">{desc}</p>
      </div>
    </button>
  );
}
