// src/app/dashboard/barang-keluar/page.js
"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faBarcode,
  faTag,
  faLayerGroup,
  faTruck,
  faCalendarAlt,
  faSearch,
  faTimes,
  faSignOutAlt,
  faEdit,
  faHistory,
  faExchangeAlt,
  faClipboard,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

export default function BarangKeluarPage() {
  const [stokList, setStokList] = useState([]);
  const [notif, setNotif] = useState("");
  const [riwayat, setRiwayat] = useState([]);
  const [filterNomorTransaksi, setFilterNomorTransaksi] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [jumlahKeluar, setJumlahKeluar] = useState("");
  const [tanggalKeluar, setTanggalKeluar] = useState("");
  const [supplier, setSupplier] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [showModalLihat, setShowModalLihat] = useState(false); // Modal Lihat
  const [showModalEdit, setShowModalEdit] = useState(false); // Modal Ed
  const [satuan, setSatuan] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [stokPage, setStokPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API}/stok`)
      .then((res) => res.json())
      .then((data) => setStokList(data));

    fetch(`${process.env.NEXT_PUBLIC_API}/barangKeluar`)
      .then((res) => res.json())
      .then((data) => setRiwayat(data));
  }, []);

  const handleKeluarkan = (item) => {
    setCurrentItem({
      ...item,
      namaBarang: item.title, // Menambahkan namaBarang untuk konsistensi
    });
    setJumlahKeluar("");
    setTanggalKeluar(new Date().toISOString().slice(0, 10));
    setSupplier(item.supplier || "");
    setKeterangan("");
    setShowModal(true);
  };

  const handleLihat = (item) => {
    // Cari data stok yang sesuai berdasarkan nama barang
    const stokItem = stokList.find((stok) => stok.title === item.namaBarang);
    setCurrentItem({
      ...item,
      kode: stokItem?.kode || "-",
      title: item.namaBarang,
      body: stokItem?.body || 0,
    });
    setShowModalLihat(true);
  };

  const handleEdit = (item) => {
    // Cari data stok yang sesuai berdasarkan nama barang
    const stokItem = stokList.find((stok) => stok.title === item.namaBarang);
    setCurrentItem({
      ...item,
      kode: stokItem?.kode || "-",
      title: item.namaBarang,
      body: stokItem?.body || 0,
      satuan: stokItem?.satuan || "",
    });
    setJumlahKeluar(item.jumlah);
    setTanggalKeluar(item.tanggal);
    setSupplier(item.supplier);
    setKeterangan(item.keterangan);
    setShowModalEdit(true);
  };

  const submitEditTransaksi = async () => {
    const jumlahInt = parseInt(jumlahKeluar);
    if (!jumlahInt || jumlahInt <= 0) {
      setNotif("Jumlah tidak valid.");
      return;
    }

    try {
      // 1. Cari data stok yang sesuai
      const stokResponse = await fetch(`${process.env.NEXT_PUBLIC_API}/stok`);
      const stokList = await stokResponse.json();
      const stokItem = stokList.find(
        (stok) => stok.title === currentItem.namaBarang
      );

      if (!stokItem) {
        setNotif("Data stok barang tidak ditemukan");
        return;
      }

      // 2. Hitung selisih jumlah yang diubah
      const selisih = jumlahInt - currentItem.jumlah;
      const stokBaru = stokItem.body - selisih;

      if (stokBaru < 0) {
        setNotif("Jumlah melebihi stok yang tersedia");
        return;
      }

      // 3. Update stok barang
      await fetch(`${process.env.NEXT_PUBLIC_API}/stok/${stokItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...stokItem,
          body: stokBaru,
        }),
      });

      // 4. Update transaksi barang keluar
      await fetch(`${process.env.NEXT_PUBLIC_API}/barangKeluar/${currentItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentItem,
          jumlah: jumlahInt,
          tanggal: tanggalKeluar,
          supplier,
          keterangan,
          nomorTransaksi: currentItem.nomorTransaksi,
          satuan: currentItem.satuan,
        }),
      });

      setNotif("Transaksi berhasil diupdate dan stok telah disesuaikan");
      setShowModalEdit(false);

      // 5. Refresh data
      const [stokRes, keluarRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API}/stok`),
        fetch(`${process.env.NEXT_PUBLIC_API}/barangKeluar`),
      ]);
      setStokList(await stokRes.json());
      setRiwayat(await keluarRes.json());
    } catch (error) {
      setNotif("Terjadi kesalahan saat mengedit transaksi: " + error.message);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Yakin menghapus transaksi ini?")) return;

    try {
      // 1. Dapatkan data stok terkait
      const stokItem = stokList.find((stok) => stok.title === item.namaBarang);
      if (!stokItem) throw new Error("Data stok tidak ditemukan");

      // 2. Kembalikan stok
      const stokResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API}/stok/${stokItem.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...stokItem,
            body: stokItem.body + item.jumlah,
          }),
        }
      );

      if (!stokResponse.ok) throw new Error("Gagal mengupdate stok");

      // 3. Hapus transaksi
      const deleteResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API}/barangKeluar/${item.id}`,
        {
          method: "DELETE",
        }
      );

      if (!deleteResponse.ok) throw new Error("Gagal menghapus transaksi");

      // 4. Update state
      setRiwayat(riwayat.filter((trans) => trans.id !== item.id));
      setStokList(
        stokList.map((stok) =>
          stok.id === stokItem.id
            ? { ...stok, body: stok.body + item.jumlah }
            : stok
        )
      );

      setNotif("Transaksi berhasil dihapus");
    } catch (error) {
      setNotif(`Error: ${error.message}`);
    }
  };

  const submitKeluarkan = async () => {
    const jumlahInt = parseInt(jumlahKeluar);

    if (!jumlahInt || jumlahInt <= 0 || jumlahInt > currentItem.body) {
      setNotif("Jumlah tidak valid atau melebihi stok");
      return;
    }

    try {
      // 1. Generate nomor transaksi
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const transaksiCount =
        riwayat.filter((t) => t.tanggal === tanggalKeluar).length + 1;
      const nomorTransaksi = `BK-${today}-${transaksiCount
        .toString()
        .padStart(3, "0")}`;

      // 2. Update stok
      const updatedStok = {
        ...currentItem,
        body: currentItem.body - jumlahInt,
      };

      const stokResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API}/stok/${currentItem.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedStok),
        }
      );

      if (!stokResponse.ok) throw new Error("Gagal update stok");

      // 3. Buat transaksi baru dengan nomor transaksi
      const newTransaksi = {
        nomorTransaksi,
        namaBarang: currentItem.title,
        jumlah: jumlahInt,
        tanggal: tanggalKeluar,
        supplier: currentItem.supplier,
        keterangan: keterangan,
        kodeBarang: currentItem.kode,
        satuan: currentItem.satuan, // Tambahkan kode barang jika diperlukan
      };

      const transaksiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API}/barangKeluar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTransaksi),
        }
      );

      const createdTransaksi = await transaksiResponse.json();

      if (!transaksiResponse.ok) throw new Error("Gagal membuat transaksi");

      // 4. Update state
      setStokList(
        stokList.map((item) =>
          item.id === currentItem.id ? updatedStok : item
        )
      );

      setRiwayat([createdTransaksi, ...riwayat]);
      setShowModal(false);
      setNotif(
        `Barang berhasil dikeluarkan. Nomor Transaksi: ${nomorTransaksi}`
      );
    } catch (error) {
      setNotif(`Error: ${error.message}`);
    }
  };

  const filteredRiwayat = riwayat.filter((item) => {
    const nomorMatch = item.nomorTransaksi
      .toLowerCase()
      .includes(filterNomorTransaksi.toLowerCase());
    const tanggalMatch = item.tanggal.includes(filterTanggal);
    return nomorMatch && tanggalMatch;
  });

  const totalPages = Math.ceil(filteredRiwayat.length / itemsPerPage);
  const paginatedRiwayat = filteredRiwayat.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalStokPages = Math.ceil(stokList.length / itemsPerPage);
  const paginatedStok = stokList.slice(
    (stokPage - 1) * itemsPerPage,
    stokPage * itemsPerPage
  );

  return (
    <ProtectedRoute>
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <FontAwesomeIcon
              icon={faBoxOpen}
              className="mr-3 text-blue-600 w-6 h-6"
            />
            Manajemen Barang Keluar
          </h1>
        </div>

        {/* Notification */}
        {notif && (
          <div
            className={`mb-6 p-3 rounded-md ${
              notif.includes("berhasil")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {notif}
          </div>
        )}

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    <FontAwesomeIcon
                      icon={faSignOutAlt}
                      className="mr-2 w-6 h-6"
                    />
                    Form Pengeluaran Barang
                  </h2>
                  <p className="text-xs text-blue-100 mt-1">
                    Lakukan Transaksi Barang Keluar
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {/* Informasi Barang */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                    <FontAwesomeIcon
                      icon={faBoxOpen}
                      className="mr-2 text-blue-500 w-6 h-6"
                    />
                    Informasi Barang
                  </h3>
                  <div className="space-y-3 pl-8">
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm text-gray-600">
                        Kode Barang:
                      </label>
                      <div className="col-span-2 font-medium">
                        {currentItem.kode}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm text-gray-600">
                        Nama Barang:
                      </label>
                      <div className="col-span-2 font-medium">
                        {currentItem.title}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm text-gray-600">
                        Stok Tersedia:
                      </label>
                      <div className="col-span-2 font-medium text-blue-600">
                        {currentItem.body} {currentItem.satuan}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail Transaksi */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                    <FontAwesomeIcon
                      icon={faExchangeAlt}
                      className="mr-2 text-blue-500 w-6 h-6"
                    />
                    Detail Transaksi
                  </h3>
                  <div className="space-y-4 pl-8">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        <FontAwesomeIcon
                          icon={faSignOutAlt}
                          className="mr-2 text-blue-500 w-6 h-6"
                        />
                        Jumlah Keluar
                      </label>
                      <div className="flex gap-4">
                        <input
                          type="number"
                          value={jumlahKeluar}
                          onChange={(e) => setJumlahKeluar(e.target.value)}
                          className="w-2/3 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Masukkan jumlah"
                        />
                        <span className="w-1/3 p-2 border border-gray-300 rounded-md text-gray-500">
                          {currentItem ? currentItem.satuan : "Pilih Satuan"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="mr-2 text-blue-500 w-6 h-6"
                        />
                        Tanggal Keluar
                      </label>
                      <input
                        type="date"
                        value={tanggalKeluar}
                        onChange={(e) => setTanggalKeluar(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        <FontAwesomeIcon
                          icon={faTruck}
                          className="mr-2 text-blue-500 w-6 h-6"
                        />
                        Supplier
                      </label>
                      <input
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        disabled
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                        placeholder="Nama supplier"
                      />
                    </div>
                  </div>
                </div>

                {/* Keterangan */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                    <FontAwesomeIcon
                      icon={faClipboard}
                      className="mr-2 text-blue-500 w-6 h-6"
                    />
                    Keterangan
                  </h3>
                  <div className="pl-8">
                    <textarea
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tambahkan catatan atau keterangan..."
                    />
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={submitKeluarkan}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2 w-6 h-6" />
                  Simpan Transaksi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stok Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <FontAwesomeIcon
                icon={faLayerGroup}
                className="mr-2 text-blue-500 w-6 h-6"
              />
              Daftar Stok Barang
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    <FontAwesomeIcon
                      icon={faBarcode}
                      className="mr-1 w-6 h-6"
                    />{" "}
                    Kode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    <FontAwesomeIcon icon={faTag} className="mr-1 w-6 h-6" />{" "}
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Jenis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    <FontAwesomeIcon
                      icon={faLayerGroup}
                      className="mr-1 w-6 h-6"
                    />{" "}
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    <FontAwesomeIcon icon={faTruck} className="mr-1 w-6 h-6" />{" "}
                    Supplier
                  </th>
                  <th className="px-6 py-3  text-xs font-medium text-white uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stokList.map((item) => (
                  <tr
                    key={`${item.id}-${item.title}-${item.kode}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.kode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.jenis}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.body} {item.satuan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.supplier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleKeluarkan(item)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm flex items-center"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" />
                        Keluarkan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalStokPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setStokPage((prev) => Math.max(prev - 1, 1))}
                    disabled={stokPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setStokPage((prev) => Math.min(prev + 1, totalStokPages))
                    }
                    disabled={stokPage === totalStokPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(stokPage - 1) * itemsPerPage + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(stokPage * itemsPerPage, stokList.length)}
                      </span>{" "}
                      of <span className="font-medium">{stokList.length}</span>{" "}
                      items
                    </p>
                  </div>

                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        setStokPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={stokPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Page numbers */}
                    {Array.from(
                      { length: totalStokPages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setStokPage(page)}
                        aria-current={stokPage === page ? "page" : undefined}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          stokPage === page
                            ? "bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setStokPage((prev) =>
                          Math.min(prev + 1, totalStokPages)
                        )
                      }
                      disabled={stokPage === totalStokPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Riwayat Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <FontAwesomeIcon
                icon={faHistory}
                className="mr-2 text-blue-500 w-6 h-6"
              />
              Riwayat Transaksi Barang Keluar
            </h2>
          </div>

          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-gray-400 w-6 h-6"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Cari Nomor Transaksi (BK-...)"
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterNomorTransaksi}
                  onChange={(e) => setFilterNomorTransaksi(e.target.value)}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="text-gray-400 w-6 h-6"
                  />
                </div>
                <input
                  type="date"
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterTanggal}
                  onChange={(e) => setFilterTanggal(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="mr-1 w-6 h-6"
                    />{" "}
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <FontAwesomeIcon icon={faTag} className="mr-1 w-6 h-6" />{" "}
                    Nama Barang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <FontAwesomeIcon
                      icon={faLayerGroup}
                      className="mr-1 w-6 h-6"
                    />{" "}
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <FontAwesomeIcon icon={faTruck} className="mr-1 w-6 h-6" />{" "}
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keterangan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nomor Transaksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRiwayat.length > 0 ? (
                  filteredRiwayat.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
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
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.keterangan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {item.nomorTransaksi || "BK-000000-000"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          {/* Lihat Button */}
                          <button
                            onClick={() => handleLihat(item)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm flex items-center"
                          >
                            <FontAwesomeIcon
                              icon={faSignOutAlt}
                              className="mr-1"
                            />
                            Lihat
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100 px-3 py-1 rounded-md text-sm flex items-center"
                          >
                            <FontAwesomeIcon icon={faEdit} className="mr-1" />
                            Edit
                          </button>

                          {/* Hapus Button */}
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-sm flex items-center"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-6 py-4 text-center text-sm text-gray-500"
                      colSpan="5"
                    >
                      Tidak ada transaksi barang keluar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {showModalLihat && currentItem && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                  {/* Header */}
                  <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        <FontAwesomeIcon
                          icon={faSignOutAlt}
                          className="mr-2 w-6 h-6"
                        />
                        Lihat Detail Transaksi Barang Keluar
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowModalLihat(false)}
                      className="text-white hover:text-gray-200"
                    >
                      <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Form Content */}
                  <div className="p-6">
                    {/* Informasi Barang */}
                    <div className="mb-6">
                      <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                        <FontAwesomeIcon
                          icon={faBoxOpen}
                          className="mr-2 text-blue-500 w-6 h-6"
                        />
                        Informasi Barang
                      </h3>
                      <div className="space-y-3 pl-8">
                        {/* Kode Barang */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <label className="text-sm text-gray-600">
                            Kode Barang:
                          </label>
                          <div className="col-span-2 font-medium">
                            {currentItem.kode}
                          </div>
                        </div>
                        {/* Nama Barang */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <label className="text-sm text-gray-600">
                            Nama Barang:
                          </label>
                          <div className="col-span-2 font-medium">
                            {currentItem.title}
                          </div>
                        </div>
                        {/* Stok Tersedia */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <label className="text-sm text-gray-600">
                            Stok Tersedia:
                          </label>
                          <div className="col-span-2 font-medium text-blue-600">
                            {currentItem.body} {currentItem.satuan}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detail Transaksi */}
                    <div className="mb-6">
                      <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                        <FontAwesomeIcon
                          icon={faExchangeAlt}
                          className="mr-2 text-blue-500 w-6 h-6"
                        />
                        Detail Transaksi
                      </h3>
                      <div className="space-y-4 pl-8">
                        {/* Jumlah Keluar */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <label className="text-sm text-gray-600">
                            Jumlah Keluar:
                          </label>
                          <div className="col-span-2 font-medium">
                            {currentItem.jumlah} {currentItem.satuan}
                          </div>
                        </div>

                        {/* Tanggal Keluar */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <label className="text-sm text-gray-600">
                            Tanggal Keluar:
                          </label>
                          <div className="col-span-2 font-medium">
                            {currentItem.tanggal}
                          </div>
                        </div>

                        {/* Supplier */}
                        <div className="grid grid-cols-3 gap-2 items-cent">
                          <label className="text-sm text-gray-60">
                            Supplier:
                          </label>
                          <div className="col-span-2 font-medium">
                            {currentItem.supplier}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Keterangan */}
                    <div>
                      <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                        <FontAwesomeIcon
                          icon={faClipboard}
                          className="mr-2 text-blue-500 w-6 h-6"
                        />
                        Keterangan
                      </h3>
                      <div className="pl-8">
                        <div className="font-medium">
                          {currentItem.keterangan}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                    <button
                      onClick={() => setShowModalLihat(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showModalEdit && currentItem && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                  {/* Header */}
                  <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        <FontAwesomeIcon
                          icon={faEdit}
                          className="mr-2 w-6 h-6"
                        />
                        Edit Transaksi Barang Keluar
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowModalEdit(false)}
                      className="text-white hover:text-gray-200"
                    >
                      <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Form Content */}
                  <div className="p-6">
                    {/* Informasi Barang */}
                    <div className="mb-6">
                      <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                        <FontAwesomeIcon
                          icon={faBoxOpen}
                          className="mr-2 text-blue-500 w-6 h-6"
                        />
                        Informasi Barang
                      </h3>
                      <div className="space-y-3 pl-8">
                        {/* Kode Barang */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <label className="text-sm text-gray-600">
                            Kode Barang:
                          </label>
                          <div className="col-span-2 font-medium">
                            {currentItem.kode}
                          </div>
                        </div>
                        {/* Nama Barang */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <label className="text-sm text-gray-600">
                            Nama Barang:
                          </label>
                          <div className="col-span-2 font-medium">
                            {currentItem.title}
                          </div>
                        </div>
                        {/* Stok Tersedia */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <label className="text-sm text-gray-600">
                            Stok Tersedia:
                          </label>
                          <div className="col-span-2 font-medium text-blue-600">
                            {currentItem.body} {currentItem.satuan}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detail Transaksi */}
                    <div className="mb-6">
                      <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                        <FontAwesomeIcon
                          icon={faExchangeAlt}
                          className="mr-2 text-blue-500 w-6 h-6"
                        />
                        Edit Detail Transaksi
                      </h3>
                      <div className="space-y-4 pl-8">
                        {/* Jumlah Keluar */}
                        <div className="flex gap-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Jumlah Keluar
                          </label>
                          <input
                            type="number"
                            value={jumlahKeluar}
                            onChange={(e) => setJumlahKeluar(e.target.value)}
                            className="w-2/3 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Masukkan jumlah"
                          />
                          <span className="w-1/3 p-2 border border-gray-300 rounded-md text-gray-500 bg-gray-100">
                            {currentItem ? currentItem.satuan : "Pilih Satuan"}
                          </span>
                        </div>
                        

                        {/* Tanggal Keluar */}
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Tanggal Keluar
                          </label>
                          <input
                            type="date"
                            value={tanggalKeluar}
                            onChange={(e) => setTanggalKeluar(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        {/* Supplier */}
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Supplier
                          </label>
                          <input
                            value={supplier}
                            onChange={(e) => setSupplier(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 bg-gray-100 cursor-not-allowed"
                            disabled
                            placeholder="Nama supplier"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Keterangan */}
                    <div>
                      <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                        <FontAwesomeIcon
                          icon={faClipboard}
                          className="mr-2 text-blue-500 w-6 h-6"
                        />
                        Keterangan
                      </h3>
                      <div className="pl-8">
                        <textarea
                          value={keterangan}
                          onChange={(e) => setKeterangan(e.target.value)}
                          rows="3"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Tambahkan catatan atau keterangan..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                    <button
                      onClick={() => setShowModalEdit(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={submitEditTransaksi}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-2 w-6 h-6" />
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
