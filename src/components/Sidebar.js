"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBox,
  faDatabase,
  faSignOutAlt,
  faBars,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

export default function Sidebar() {
  const [role, setRole] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
    const pathname = usePathname(); 

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setRole(user.role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };
    const isActive = (href) => {
    return pathname === href;
  };

  return (
    <div
      className={`min-h-screen bg-gray-800 text-white flex flex-col transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        {isOpen && <div className="font-bold text-lg">Dashboard</div>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white focus:outline-none"
        >
          <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex flex-col p-4 gap-2">
        {/* Menampilkan Home hanya jika role bukan karyawan */}
        {role !== "karyawan" && (
          <Link
            href="/dashboard"
            className={`p-2 rounded flex items-center gap-2 transition-colors ${
              isActive("/dashboard")
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-700"
            }`}
          >
            <FontAwesomeIcon icon={faHome} className="w-6 h-6" />
            {isOpen && <span>Home</span>}
          </Link>
        )}

        {/* Menampilkan menu untuk karyawan */}
        {role === "karyawan" && (
          <>
            <Link
             href="/dashboard/stock"
             className={`p-2 rounded flex items-center gap-2 transition-colors ${
                isActive("/dashboard/stock")
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-700"
              }`}
            >
              <FontAwesomeIcon icon={faDatabase} className="w-6 h-6" />{" "}
              {isOpen && <span>Stok Barang</span>}
            </Link>
            <Link
              href="/dashboard/barang-keluar"
               className={`p-2 rounded flex items-center gap-2 transition-colors ${
                isActive("/dashboard/barang-keluar")
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-700"
              }`}
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} />{" "}
              {isOpen && <span>Barang Keluar</span>}
            </Link>
          </>
        )}

        {/* Menampilkan menu untuk admin */}
        {role === "admin" && (
          <>
            <Link
              href="/dashboard/barang"
             className={`p-2 rounded flex items-center gap-2 transition-colors ${
                isActive("/dashboard/barang")
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-700"
              }`}
            >
              <FontAwesomeIcon icon={faBox} className="w-6 h-6" />{" "}
              {isOpen && <span>Master Barang</span>}
            </Link>
            <Link
              href="/dashboard/barang-masuk-admin"
              className={`p-2 rounded flex items-center gap-2 transition-colors ${
                isActive("/dashboard/barang-masuk-admin")
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-700"
              }`}
            >
              <FontAwesomeIcon icon={faDatabase} className="w-6 h-6" />{" "}
              {isOpen && <span>Stok Barang</span>}
            </Link>
            <Link
              href="/dashboard/barang-keluar-admin"
             className={`p-2 rounded flex items-center gap-2 transition-colors ${
                isActive("/dashboard/barang-keluar-admin")
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-700"
              }`}
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} />{" "}
              {isOpen && <span>Barang Keluar</span>}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="w-6 h-6" />{" "}
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
