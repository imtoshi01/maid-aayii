import PreviousAttendance from '../components/PreviousAttendance'
import Navigation from '../components/Navigation'
import { Sidebar } from '../components/Sidebar'

export default function PreviousAttendancePage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4">
        <h1 className="text-2xl font-bold mb-4 sm:text-3xl">Attendance History</h1>
        <Navigation />
        <PreviousAttendance />
      </main>
    </div>
  )
}

