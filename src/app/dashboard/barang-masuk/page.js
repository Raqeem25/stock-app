import ProtectedRoute from '@/components/ProtectedRoute'

export default function BarangMasukPage() {
  return (
    <ProtectedRoute>
      <h1 className="text-xl font-bold">Barang Masuk</h1>
    </ProtectedRoute>
  )
}