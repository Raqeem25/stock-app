'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default function ProtectedRoute({ role, children }) {
  const router = useRouter()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || (role && user.role !== role)) {
      router.push('/login')
    }
  }, [role, router])

  return children
}