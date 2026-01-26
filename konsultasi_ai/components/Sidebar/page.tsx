"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* Props */
interface SidebarProps {
  sidebarOpen: boolean;
  activeMenu: string;
  handleMenuClick: (menu: string) => void;
  handleLogout: () => void;
}

/* Icons */
const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function Sidebar({
  sidebarOpen,
  activeMenu,
  handleMenuClick,
  handleLogout,
}: SidebarProps) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const navigate = (menu: string, path: string) => {
    handleMenuClick(menu);
    setLeaving(true);

    setTimeout(() => {
      router.push(path);
    }, 250); // durasi animasi
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 w-72 bg-white/80 backdrop-blur-xl shadow-2xl z-40
      transition-all duration-300
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      ${leaving ? "opacity-0 -translate-x-4" : "opacity-100"}
      flex flex-col`}
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl">
            AI
          </div>
          <div>
            <span className="font-bold text-gray-800 block text-lg">
              Konsultasi AI
            </span>
            <span className="text-xs text-gray-500">
              Health Assistant
            </span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        <MenuButton active={activeMenu === "dashboard"} onClick={() => navigate("dashboard", "/dashboard")}>
          <ActivityIcon /> Dashboard
        </MenuButton>

        <MenuButton active={activeMenu === "konsultasi"} onClick={() => navigate("konsultasi", "/konsultasi")}>
          <MessageIcon /> Konsultasi
        </MenuButton>

        <MenuButton active={activeMenu === "riwayat"} onClick={() => navigate("riwayat", "/history")}>
          <ClockIcon /> Riwayat
        </MenuButton>

        <MenuButton active={activeMenu === "profil"} onClick={() => navigate("profil", "/profil")}>
          <UserIcon /> Profil
        </MenuButton>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full px-5 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex gap-3"
        >
          <LogOutIcon /> Logout
        </button>
      </div>
    </aside>
  );
}

/* Menu Button */
function MenuButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-3.5 rounded-xl flex items-center gap-3 transition-all ${
        active
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
          : "hover:bg-gray-50 text-gray-700 hover:text-blue-600"
      }`}
    >
      {children}
    </button>
  );
}
