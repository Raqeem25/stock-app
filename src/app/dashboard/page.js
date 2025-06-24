"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faBarcode,
  faTag,
  faLayerGroup,
  faTruck,
  faCalendarAlt,
  faSearch,
  faChartLine,
  faChartPie,
  faChartBar,
  faShoppingCart,
  faWarehouse,
  faExchangeAlt,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
ChartJS.register(...registerables);

export default function DashboardPage() {
  const [stokData, setStokData] = useState([]);
  const [barangKeluarData, setBarangKeluarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Halaman saat ini
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stokRes, barangKeluarRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API}/stok`),
          fetch(`${process.env.NEXT_PUBLIC_API}/barangKeluar`),
        ]);

        const stok = await stokRes.json();
        const barangKeluar = await barangKeluarRes.json();

        setStokData(stok);
        setBarangKeluarData(barangKeluar);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hitung statistik
  const totalStok = stokData.reduce((sum, item) => sum + item.body, 0);
  const totalBarangKeluar = barangKeluarData.reduce(
    (sum, item) => sum + item.jumlah,
    0
  );
  const totalJenisBarang = stokData.length;
  const totalTransaksi = barangKeluarData.length;

  const totalPages = Math.ceil(barangKeluarData.length / itemsPerPage);

  // Ambil data untuk halaman saat ini
  const paginatedData = barangKeluarData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  // Data untuk chart (contoh)
  const barChartData = {
    labels: stokData.map((item) => item.title),
    datasets: [
      {
        label: "Stok Tersedia",
        data: stokData.map((item) => item.body),
        backgroundColor: "#3b82f6",
        borderColor: "#2563eb",
        borderWidth: 1,
      },
      {
        label: "Barang Keluar (7 hari)",
        data: stokData.map((item) =>
          barangKeluarData
            .filter(
              (bk) =>
                bk.kodeBarang === item.kode &&
                new Date(bk.tanggal) >
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            )
            .reduce((sum, bk) => sum + bk.jumlah, 0)
        ), // Memindahkan tanda kurung penutup ke sini
        backgroundColor: "#ef4444",
        borderColor: "#dc2626",
        borderWidth: 1,
      },
    ],
  };
  const pieChartData = {
    labels: [...new Set(stokData.map((item) => item.jenis))],
    datasets: [
      {
        data: [...new Set(stokData.map((item) => item.jenis))].map(
          (jenis) => stokData.filter((item) => item.jenis === jenis).length
        ),
        backgroundColor: [
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
        ],
        borderWidth: 1,
      },
    ],
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FontAwesomeIcon
          icon={faChartLine}
          className="mr-3 text-blue-600 w-6 h-6"
        />
        Dashboard Manajemen Stok
      </h1>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FontAwesomeIcon icon={faWarehouse} className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Stok</p>
              <h3 className="text-2xl font-bold">{totalStok}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <FontAwesomeIcon icon={faShoppingCart} className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Barang Keluar</p>
              <h3 className="text-2xl font-bold">{totalBarangKeluar}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FontAwesomeIcon icon={faBoxOpen} className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Jenis Barang</p>
              <h3 className="text-2xl font-bold">{totalJenisBarang}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <FontAwesomeIcon icon={faExchangeAlt} className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Transaksi</p>
              <h3 className="text-2xl font-bold">{totalTransaksi}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FontAwesomeIcon
                icon={faChartBar}
                className="mr-2 text-blue-500 w-5 h-5"
              />
              Distribusi Stok Barang
            </h2>
            <div className="h-64">
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FontAwesomeIcon
              icon={faChartPie}
              className="mr-2 text-blue-500 w-5 h-5"
            />
            Persentase Jenis Barang
          </h2>
          <div className="h-64">
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FontAwesomeIcon
              icon={faHistory}
              className="mr-2 text-blue-500 w-5 h-5"
            />
            Transaksi Terakhir
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nomor Transaksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Barang
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {item.nomorTransaksi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.tanggal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.namaBarang}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.jumlah} {item.satuan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.supplier}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex justify-between items-center p-2">
          <div className="text-sm text-gray-700">
            Menampilkan halaman {currentPage} dari {totalPages} (Total{" "}
            {barangKeluarData.length} transaksi)
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 border rounded-md ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() =>
                setCurrentPage(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Warning */}
      {stokData.some((item) => item.body < 10) && (
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Peringatan Stok Rendah
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Beberapa barang memiliki stok di bawah 10. Segera lakukan
                  restok:
                </p>
                <ul className="list-disc pl-5 mt-1">
                  {stokData
                    .filter((item) => item.body < 10)
                    .map((item) => (
                      <li key={item.id}>
                        {item.title} (Stok: {item.body})
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
