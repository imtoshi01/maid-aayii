'use client'

import { useState, useEffect } from 'react'
import { getServiceProviders, ServiceProvider } from '../lib/data'
import AttendanceTracker from './AttendanceTracker'
import SalaryCalculator from './SalaryCalculator'

export default function ServiceProviderList() {
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null)

  useEffect(() => {
    setProviders(getServiceProviders())
  }, [])

  return (
    <div>
      <ul className="space-y-4">
        {providers.map(provider => (
          <li key={provider.id} className="border p-4 rounded-lg">
            <h3 className="text-xl font-semibold">{provider.name} - {provider.role}</h3>
            <p>Daily Salary: ₹{provider.dailySalary}</p>
            <p>Allowed Leaves: {provider.allowedLeaves}</p>
            <p>Contact: {provider.contactNumber}</p>
            <p>UPI ID: {provider.upiId}</p>
            <button 
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => setSelectedProvider(provider)}
            >
              Manage Attendance
            </button>
          </li>
        ))}
      </ul>
      {selectedProvider && (
        <div className="mt-6">
          <h3 className="text-2xl font-semibold mb-4">Manage {selectedProvider.name}</h3>
          <AttendanceTracker serviceProvider={selectedProvider} />
          <SalaryCalculator serviceProvider={selectedProvider} />
        </div>
      )}
    </div>
  )
}

