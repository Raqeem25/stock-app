'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Topbar() {
  const [role, setRole] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      setRole(user.role)
    } else {
      router.push('/login')
    }
  }, [])

  if (role === null) {
    return (
      <div className="p-4 bg-white shadow text-gray-500">Memuat...</div>
    )
  }

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow">
      <h1 className="text-lg font-semibold text-black">Manajemen Stok</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700 capitalize">{role}</span>
        <button
          onClick={() => {
            localStorage.removeItem('user')
            router.push('/login')
          }}
          className="bg-red-600 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
