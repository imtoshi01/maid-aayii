'use client'

import { useState } from 'react'
import { ServiceProvider } from '../lib/data'
import { markAttendance } from '../actions/serviceProviderActions'

export default function AttendanceTracker({ serviceProvider }: { serviceProvider: ServiceProvider }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [present, setPresent] = useState(true)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('serviceProviderId', serviceProvider.id)
    formData.append('date', date)
    formData.append('present', present.toString())

    try {
      await markAttendance(formData)
      setMessage('Attendance marked successfully!')
    } catch (error) {
      setMessage('Error marking attendance.')
    }
  }

  return (
    <div className="mt-4">
      <h4 className="text-xl font-semibold mb-2">Mark Attendance</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block">Date:</label>
          <input 
            type="date" 
            id="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block">Status:</label>
          <div>
            <input 
              type="radio" 
              id="present" 
              name="status" 
              checked={present} 
              onChange={() => setPresent(true)}
            />
            <label htmlFor="present" className="ml-2">Present</label>
          </div>
          <div>
            <input 
              type="radio" 
              id="absent" 
              name="status" 
              checked={!present} 
              onChange={() => setPresent(false)}
            />
            <label htmlFor="absent" className="ml-2">Absent</label>
          </div>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Mark Attendance</button>
      </form>
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  )
}

