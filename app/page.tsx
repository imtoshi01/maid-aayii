'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AttendanceDashboard from './components/AttendanceDashboard'
import Navigation from './components/Navigation'
import { Sidebar } from './components/Sidebar'
import { Button } from "@/components/ui/button"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/register')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure; samesite=strict;';
    router.push('/register')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold sm:text-3xl">Attendance Record</h1>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
        <Navigation />
        <AttendanceDashboard />
      </main>
    </div>
  )
}

