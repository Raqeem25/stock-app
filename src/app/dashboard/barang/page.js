// src/app/dashboard/barang/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faPlus,
  faTimes,
  faCheck,
  faUndo,
  faSearch,
  faPen,
  faTrash,
  faBoxes,
  faBarcode,
  faHashtag,
  faInfoCircle,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

export default function MasterBarangPage() {
  const [barangList, setBarangList] = useState([]);
  const [kode, setKode] = useState("");
  const [jenis, setJenis] = useState("");
  const [editId, setEditId] = useState(null);
  const [notif, setNotif] = useState({ message: "", type: "" });
  const [showForm, setShowForm] = useState(false);
  const [role, setRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setRole(user.role);
    fetchBarang();
  }, []);

  const fetchBarang = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/barang`);
      const data = await res.json();
      setBarangList(data);
    } catch (error) {
      showNotification("Gagal memuat data barang", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotif({ message, type });
    setTimeout(() => setNotif({ message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!kode || !jenis) {
      showNotification("Kode dan Jenis Barang harus diisi", "error");
      return;
    }

    const kodeFormat = /^[A-Za-z0-9\-]+$/;
    if (!kodeFormat.test(kode) || kode.length < 2 || kode.length > 10) {
      showNotification(
        "Kode harus berupa huruf/angka (2-10 karakter)",
        "error"
      );
      return;
    }

    const isDuplicate = barangList.find(
      (item) => item.kode === kode && item.id !== editId
    );
    if (isDuplicate) {
      showNotification("Kode Barang sudah ada!", "error");
      return;
    }

    const newBarang = { kode, jenis };

    try {
      if (editId) {
        await fetch(`${process.env.NEXT_PUBLIC_API}/barang/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBarang),
        });
        showNotification("Data berhasil diubah", "success");
      } else {
        const nextId =
          Math.max(0, ...barangList.map((item) => item.id || 0)) + 1;
        await fetch(`${process.env.NEXT_PUBLIC_API}/barang`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newBarang, id: nextId }),
        });
        showNotification("Data berhasil ditambahkan", "success");
      }

      resetForm();
      fetchBarang();
    } catch (error) {
      showNotification("Terjadi kesalahan: " + error.message, "error");
    }
  };

  const handleEdit = (item) => {
    setKode(item.kode);
    setJenis(item.jenis);
    setEditId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Yakin ingin menghapus data ini?");
    if (!confirmDelete) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API}/barang/${id}`, {
        method: "DELETE",
      });
      showNotification("Data berhasil dihapus", "success");
      fetchBarang();
    } catch (error) {
      showNotification("Gagal menghapus data: " + error.message, "error");
    }
  };

  const resetForm = () => {
    setKode("");
    setJenis("");
    setEditId(null);
    setShowForm(false);
  };

  const filteredBarang = barangList.filter(
    (item) =>
      item.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jenis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (role === null) return null;
  if (role !== "admin") {
    router.push("/dashboard");
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            <span className="inline-flex items-center">
              <FontAwesomeIcon
                icon={faBoxes}
                className="h-6 w-6 mr-2 text-blue-600"
              />
              Master Barang
            </span>
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                showForm
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {showForm ? (
                <>
                  <FontAwesomeIcon
                    icon={showForm ? faTimes : faPlus}
                    className="h-5 w-5 mr-2"
                  />
                  Tutup Form
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={showForm ? faTimes : faPlus}
                    className="h-5 w-5 mr-2"
                  />
                  Tambah Barang
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notification */}
        {notif.message && (
          <div
            className={`mb-6 p-3 rounded-md ${
              notif.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {notif.message}
          </div>
        )}

        {/* Form Section */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <FontAwesomeIcon
                  icon={editId ? faEdit : faPlus}
                  className="mr-3 text-blue-200"
                />
                {editId ? "Edit Barang" : "Tambah Barang Baru"}
              </h2>
              <p className="text-blue-100 mt-1 ml-9">
                {editId
                  ? "Perbarui detail barang"
                  : "Isi form untuk menambahkan barang baru"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kode Barang */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <FontAwesomeIcon
                      icon={faBarcode}
                      className="mr-2 text-gray-500"
                    />
                    Kode Barang <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon
                        icon={faHashtag}
                        className="text-gray-400"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Contoh: BRG001"
                      className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={kode}
                      onChange={(e) => setKode(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="mr-1 text-xs"
                    />
                    2-10 karakter (huruf/angka)
                  </p>
                </div>

                {/* Jenis Barang */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <FontAwesomeIcon
                      icon={faBoxes}
                      className="mr-2 text-gray-500"
                    />
                    Jenis Barang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Elektronik"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all flex items-center"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  {editId ? "Update Barang" : "Simpan Barang"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-4">
          <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
            <h2 className="text-lg font-semibold text-gray-700">
              Daftar Barang
            </h2>
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="h-5 w-5 text-gray-400"
                />
              </div>
              <input
                type="text"
                placeholder="Cari barang..."
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Kode Barang
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Jenis Barang
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBarang.length > 0 ? (
                    filteredBarang.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.kode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.jenis}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faPen} className="mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            title="Hapus"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-2" />
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        {searchTerm
                          ? "Tidak ada barang yang cocok dengan pencarian"
                          : "Belum ada data barang"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
