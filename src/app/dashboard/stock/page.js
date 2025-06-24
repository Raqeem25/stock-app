// src/app/dashboard/stock/page.js
"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faPlus,
  faTimes,
  faEdit,
  faTrash,
  faSave,
  faBox,
  faBoxes,
  faTag,
  faHashtag,
  faCalendar,
  faTruck,
  faFileInvoiceDollar,
  faMoneyBillWave,
  faEye,
  faAlignLeft,
} from "@fortawesome/free-solid-svg-icons";

export default function StockPage() {
  const [stokList, setStokList] = useState([]);
  const [namaBarang, setNamaBarang] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [tanggalMasuk, setTanggalMasuk] = useState("");
  const [kodeBarang, setKodeBarang] = useState("");
  const [hargaBeli, setHargaBeli] = useState("");
  const [supplier, setSupplier] = useState("");
  const [noPO, setNoPO] = useState("");
  const [notif, setNotif] = useState("");
  const [editId, setEditId] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [data, setData] = useState([]);
  const [kode, setKode] = useState("");
  const [jenis, setJenis] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [harga, setHarga] = useState("");
  const [barangList, setBarangList] = useState([]);
  const [deskripsi, setDeskripsi] = useState("");
  const [satuan, setSatuan] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [role, setRole] = useState("");

  const isEditing = editId !== null;

  const itemsPerPage = 10;

  const fetchData = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/stok`);
    const data = await res.json();
    setStokList(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi input
    if (
      !kode ||
      !title ||
      !body ||
      !harga ||
      !supplier ||
      !noPO ||
      !tanggal ||
      !deskripsi ||
      !satuan
    ) {
      setNotif("Semua field harus diisi!");
      setTimeout(() => setNotif(""), 3000);
      return;
    }

    // Validasi jumlah harus angka
    if (isNaN(body) || isNaN(harga)) {
      setNotif("Jumlah dan Harga harus berupa angka!");
      setTimeout(() => setNotif(""), 3000);
      return;
    }

    const newItem = {
      kode,
      jenis,
      title,
      body: Number(body),
      harga: Number(harga),
      supplier,
      noPO,
      tanggal,
      deskripsi,
       satuan,
    };

    try {
      if (editId) {
        // Update existing item
        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/stok/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        });

        if (!response.ok) throw new Error("Gagal mengupdate data");
      } else {
        // Create new item
        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/stok`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        });

        if (!response.ok) throw new Error("Gagal menambahkan data");
      }

      // Reset form
      setKode("");
      setJenis("");
      setTitle("");
      setBody("");
      setHarga("");
      setSupplier("");
      setNoPO("");
      setTanggal("");
      setDeskripsi("");
      setEditId(null);

      setNotif(
        editId ? "Data berhasil diubah!" : "Barang berhasil ditambahkan!"
      );
      fetchData();
    } catch (error) {
      setNotif(error.message || "Terjadi kesalahan!");
    } finally {
      setTimeout(() => setNotif(""), 3000);
      setShowForm(false);
    }
  };

  const fetchBarang = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/barang`);
    const json = await res.json();
    setBarangList(json);
  };

  useEffect(() => {
    fetchData();
    fetchBarang();
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setRole(user.role);
  }, []);

  const handleKodeChange = (e) => {
    const val = e.target.value;
    setKode(val);
    const found = barangList.find((b) => b.kode === val);
    setJenis(found ? found.jenis : "");
  };

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Yakin ingin menghapus data ini?");
    if (!confirmDelete) return;

    await fetch(`${process.env.NEXT_PUBLIC_API}/stok/${id}`, {
      method: "DELETE",
    });
    fetchData();
  };

  const handleEdit = (item) => {
    setKode(item.kode);
    setJenis(item.jenis);
    setTitle(item.title);
    setBody(item.body);
    setTanggal(item.tanggal || "");
    setHarga(item.harga || "");
    setSupplier(item.supplier || "");
    setNoPO(item.noPO || "");
    setDeskripsi(item.deskripsi || "");
    setSatuan(item.satuan || "");
    setEditId(item.id);
    setShowForm(true);
  };

  const filteredData = stokList.filter(
    (item) =>
      item.title.toLowerCase().includes(filterText.toLowerCase()) ||
      item.kode.toLowerCase().includes(filterText.toLowerCase()) || 
      item.noPO.toLowerCase().includes(filterText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatTanggal = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const totalJumlah = paginatedData.reduce(
    (sum, item) => sum + Number(item.body || 0),
    0
  );

  const totalPembelian = paginatedData.reduce(
    (sum, item) => sum + Number(item.body || 0) * Number(item.harga || 0),
    0
  );

  return (
    <ProtectedRoute>
      <div className="mx-auto px-4 py-6 text-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            <FontAwesomeIcon icon={faBoxes} className="mr-2 w-6 h-6" />
            Manajemen Stok Barang
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center px-4 py-2 rounded-md ${
              showForm
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white transition-colors`}
          >
            <FontAwesomeIcon
              icon={showForm ? faTimes : faPlus}
              className="mr-2 w-6 h-6"
            />
            {showForm ? "Tutup Form" : "Tambah Barang"}
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 relative">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-3 text-gray-400 w-6 h-6"
            />
            <input
              type="text"
              placeholder="Cari barang (nama, kode atau No PO)..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
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

        {/* Form Input */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100"
          >
            <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
              <div
                className={`p-3 rounded-lg ${
                  editId
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                <FontAwesomeIcon
                  icon={editId ? faEdit : faPlus}
                  className="text-lg w-6 h-6"
                />
              </div>
              <h2 className="text-2xl font-semibold ml-3 text-gray-800">
                {editId ? "Edit Barang" : "Tambah Barang Baru"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kode Barang */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FontAwesomeIcon
                    icon={faTag}
                    className="mr-2 text-blue-500"
                  />
                  Kode Barang
                </label>
                <select
                  value={kode}
                  onChange={handleKodeChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 bg-white"
                  required
                >
                  <option value="" className="text-gray-400">
                    Pilih Kode Barang
                  </option>
                  {barangList.map((b) => (
                    <option key={b.id} value={b.kode} className="text-gray-800">
                      {b.kode}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jenis Barang */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FontAwesomeIcon
                    icon={faBox}
                    className="mr-2 text-blue-500"
                  />
                  Jenis Barang
                </label>
                <input
                  value={jenis}
                  disabled
                  placeholder="Otomatis terisi"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              {/* Nama Barang */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FontAwesomeIcon
                    icon={faTag}
                    className="mr-2 text-blue-500"
                  />
                  Nama Barang
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan nama barang"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                  required
                />
              </div>

              {/* Jumlah */}
               <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FontAwesomeIcon
                    icon={faHashtag}
                    className="mr-2 text-blue-500"
                  />
                  Jumlah
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Masukkan jumlah"
                    className="w-2/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                    required
                  />
                  <select
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                    className="w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                    required
                  >
                    <option value="">Pilih Satuan</option>
                    <option value="unit">Unit</option>
                    <option value="pcs">Pcs</option>
                    <option value="pack">Pack</option>
                    <option value="lusin">Lusin</option>
                    <option value="liter">Liter</option>
                    <option value="gram">Gram</option>
                    <option value="kilo">Kilo</option>
                    <option value="lembar">Lembar</option>
                    <option value="roll">Roll</option>
                    <option value="box">Box/Dus</option>
                  </select>
                </div>
              </div>


              {/* Harga Beli */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FontAwesomeIcon
                    icon={faMoneyBillWave}
                    className="mr-2 text-blue-500"
                  />
                  Harga Beli (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={harga}
                    onChange={(e) => setHarga(e.target.value)}
                    placeholder="Masukkan harga beli"
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                    required
                  />
                </div>
              </div>

              {/* Supplier */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FontAwesomeIcon
                    icon={faTruck}
                    className="mr-2 text-blue-500"
                  />
                  Supplier
                </label>
                <input
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Masukkan nama supplier"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                  required
                />
              </div>

              {/* Nomor PO */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FontAwesomeIcon
                    icon={faFileInvoiceDollar}
                    className="mr-2 text-blue-500"
                  />
                  Nomor PO
                </label>
                <input
                  value={noPO}
                  onChange={(e) => setNoPO(e.target.value)}
                  placeholder="Masukkan nomor PO"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                  required
                />
              </div>

              {/* Tanggal Masuk */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FontAwesomeIcon
                    icon={faCalendar}
                    className="mr-2 text-blue-500"
                  />
                  Tanggal Masuk
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                  required
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                {" "}
                {/* Menggunakan col-span-2 untuk lebar penuh */}
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FontAwesomeIcon
                    icon={faAlignLeft}
                    className="mr-2 text-blue-500"
                  />
                  Deskripsi Detail Barang
                </label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Masukkan deskripsi detail barang..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium flex items-center"
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Simpan
              </button>
            </div>
          </form>
        )}

        {/* Stock Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Jenis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Harga Satuan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    No PO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Tanggal
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Total Harga
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {item.kode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.jenis}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.body} {item.satuan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        Rp {parseInt(item.harga).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.supplier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.noPO}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.tanggal ? formatTanggal(item.tanggal) : "-"}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap font-medium">
                        Rp{" "}
                        {(
                          parseInt(item.body) * parseInt(item.harga)
                        ).toLocaleString()}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedItem(item)}
                            disabled={isEditing}
                            className={`bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm flex items-center justify-center transition-colors duration-200 w-24
              ${isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <FontAwesomeIcon icon={faEye} className="mr-1.5" />
                            Lihat
                          </button>

                          {role !== "karyawan" && (
                            <button
                              onClick={() => handleEdit(item)}
                              disabled={isEditing}
                              className={`bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-md text-sm flex items-center justify-center transition-colors duration-200 w-24 ${
                                isEditing ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            >
                              <FontAwesomeIcon
                                icon={faEdit}
                                className="mr-1.5"
                              />
                              Edit
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={isEditing}
                            className={`bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm flex items-center justify-center transition-colors duration-200 w-24
              ${isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                            title="Hapus"
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="mr-1.5"
                            />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Tidak ada data yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h2 className="text-xl font-semibold text-gray-800">
                  Detail Stok
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2 text-sm text-gray-700 mb-2">
                <div className="col-span-2 text-right font-medium text-gray-500 pr-2">
                  Kode Barang:
                </div>
                <div className="col-span-3">{selectedItem.kode}</div>

                <div className="col-span-2 text-right font-medium text-gray-500 pr-2">
                  Jenis Barang:
                </div>
                <div className="col-span-3">{selectedItem.jenis}</div>

                <div className="col-span-2 text-right font-medium text-gray-500 pr-2">
                  Nama Barang:
                </div>
                <div className="col-span-3">{selectedItem.title}</div>

                <div className="col-span-2 text-right font-medium text-gray-500 pr-2">
                  Jumlah Barang:
                </div>
                <div className="col-span-3">{selectedItem.body} {selectedItem.satuan}</div>

                <div className="col-span-2 text-right font-medium text-gray-500 pr-2">
                  Tanggal:
                </div>
                <div className="col-span-3">{selectedItem.tanggal}</div>

                <div className="col-span-2 text-right font-medium text-gray-500 pr-2">
                  Harga Satuan:
                </div>
                <div className="col-span-3">
                  Rp {parseInt(selectedItem.harga).toLocaleString("id-ID")}
                </div>

                <div className="col-span-2 text-right font-medium text-gray-500 pr-2">
                  Nama Supplier:
                </div>
                <div className="col-span-3">{selectedItem.supplier}</div>

                <div className="col-span-2 text-right font-medium text-gray-500 pr-2">
                  PO:
                </div>
                <div className="col-span-3">{selectedItem.noPO}</div>
                <div className="col-span-2 text-right font-medium text-gray-500 pr-2">
                  Detail Barang:
                </div>
                <div className="col-span-3 text-justify">
                  {selectedItem.deskripsi}
                </div>
              </div>

              {/* Garis pemisah dan total harga */}
              <div className="border-t border-gray-200 pt-3 mt-2">
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-2 text-right font-medium text-gray-500 pr-2">
                    Total:
                  </div>
                  <div className="col-span-3 font-semibold text-blue-600">
                    Rp{" "}
                    {(
                      parseInt(selectedItem.body || 0) *
                      parseInt(selectedItem.harga || 0)
                    ).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 flex justify-end">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-700 mb-2">
              <FontAwesomeIcon icon={faHashtag} className="mr-2 w-6 h-6" />
              Total Jumlah Stok
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {totalJumlah} unit
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-700 mb-2">
              <FontAwesomeIcon
                icon={faMoneyBillWave}
                className="mr-2 w-6 h-6"
              />
              Total Nilai Pembelian
            </h3>
            <p className="text-2xl font-bold text-green-600">
              Rp {totalPembelian.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700">
              Menampilkan halaman {currentPage} dari {totalPages} (Total{" "}
              {filteredData.length} item)
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

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
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
