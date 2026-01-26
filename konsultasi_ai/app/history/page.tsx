"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/page";

interface HistoryItem {
  id: number;
  keluhan: string;
  hasil: string;
  tanggal: string;
  status: "Selesai" | "Diproses";
}

/* Icons */
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("riwayat");

  const handleLogout = () => {
    alert("Logout berhasil (dummy)");
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    setSidebarOpen(false); // sidebar nutup tanpa overlay
  };

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        setHistory(data?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        activeMenu={activeMenu}
        handleMenuClick={handleMenuClick}
        handleLogout={handleLogout}
      />

      {/* Main */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "md:ml-72" : "md:ml-0"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="h-20 flex items-center justify-between bg-white/70 backdrop-blur-xl rounded-2xl px-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 transition"
              >
                {sidebarOpen ? <XIcon /> : <MenuIcon />}
              </button>

              <div>
                <h2 className="font-bold text-gray-800">Riwayat Konsultasi</h2>
                <p className="text-xs text-gray-500">
                  Data konsultasi kesehatan Anda
                </p>
              </div>
            </div>
          </div>

          {/* Banner */}
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
            <h1 className="text-3xl font-bold mb-2">Riwayat Konsultasi 🩺</h1>
            <p className="text-blue-100">
              Semua hasil konsultasi kesehatan Anda tersimpan rapi
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center shadow-lg">
              <p className="text-gray-500 text-lg">
                Belum ada riwayat konsultasi 
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">{item.tanggal}</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === "Selesai"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-800 mb-1">Keluhan</h3>
                  <p className="text-gray-600 mb-4">{item.keluhan}</p>

                  <h3 className="font-semibold text-gray-800 mb-1">Hasil AI</h3>
                  <p className="text-gray-600 line-clamp-3">{item.hasil}</p>

                  <div className="mt-6 text-right">
                    <button className="text-blue-600 font-medium hover:text-blue-700">
                      Lihat Detail →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
