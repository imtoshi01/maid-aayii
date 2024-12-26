'use client'

import { useState } from 'react'
import { ServiceProvider, calculateSalary } from '../lib/data'

export default function SalaryCalculator({ serviceProvider }: { serviceProvider: ServiceProvider }) {
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [salary, setSalary] = useState<ReturnType<typeof calculateSalary>>(null)

  const handleCalculate = () => {
    const result = calculateSalary(serviceProvider.id, month, year)
    setSalary(result)
  }

  const handlePay = () => {
    if (salary) {
      // In a real app, this would integrate with a UPI payment gateway
      alert(`Payment of ₹${salary.totalSalary} initiated to ${serviceProvider.upiId}`)
    }
  }

  return (
    <div className="mt-6">
      <h4 className="text-xl font-semibold mb-2">Salary Calculator</h4>
      <div className="space-y-4">
        <div>
          <label htmlFor="month" className="block">Month:</label>
          <select 
            id="month" 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full border rounded px-2 py-1"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="year" className="block">Year:</label>
          <input 
            type="number" 
            id="year" 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <button onClick={handleCalculate} className="bg-purple-500 text-white px-4 py-2 rounded">Calculate Salary</button>
      </div>
      {salary && (
        <div className="mt-4 space-y-2">
          <p>Days Present: {salary.daysPresent}</p>
          <p>Days Absent: {salary.daysAbsent}</p>
          <p>Unpaid Leaves: {salary.unpaidLeaves}</p>
          <p>Salary Deduction: ₹{salary.salaryDeduction}</p>
          <p className="font-semibold">Total Salary: ₹{salary.totalSalary}</p>
          <button onClick={handlePay} className="bg-green-500 text-white px-4 py-2 rounded">Pay via UPI</button>
        </div>
      )}
    </div>
  )
}

