'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addServiceProvider } from '../lib/api'

interface AddServiceProviderFormProps {
  onSuccess?: () => void;
}

export default function AddServiceProviderForm({ onSuccess }: AddServiceProviderFormProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      await addServiceProvider(data)
      setMessage('Service provider added successfully!')
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      setMessage('Error adding service provider.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name:</Label>
        <Input type="text" id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="role">Role:</Label>
        <Input type="text" id="role" name="role" required />
      </div>
      <div>
        <Label htmlFor="dailySalary">Daily Salary (₹):</Label>
        <Input type="number" id="dailySalary" name="dailySalary" required />
      </div>
      <div>
        <Label htmlFor="allowedLeaves">Allowed Leaves:</Label>
        <Input type="number" id="allowedLeaves" name="allowedLeaves" required />
      </div>
      <div>
        <Label htmlFor="contactNumber">Contact Number:</Label>
        <Input type="tel" id="contactNumber" name="contactNumber" required />
      </div>
      <div>
        <Label htmlFor="upiId">UPI ID:</Label>
        <Input type="text" id="upiId" name="upiId" required />
      </div>
      <Button type="submit">Add Service Provider</Button>
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </form>
  )
}

