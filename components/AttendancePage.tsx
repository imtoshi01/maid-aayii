'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock data for service providers
const serviceProviders = [
  { id: 1, name: 'Aarti', role: 'Maid' },
  { id: 2, name: 'Rajesh', role: 'Driver' },
  { id: 3, name: 'Sunita', role: 'Cook' },
  { id: 4, name: 'Amit', role: 'Gardener' },
]

export default function AttendancePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [attendance, setAttendance] = useState<Record<number, boolean>>({})

  const handleAttendanceChange = (id: number, checked: boolean) => {
    setAttendance(prev => ({ ...prev, [id]: checked }))
  }

  const handleSaveAttendance = () => {
    // In a real app, this would save the attendance to a database
    console.log('Saving attendance for', date, attendance)
    alert('Attendance saved successfully!')
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Attendance Tracker</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Present</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>{provider.name}</TableCell>
                    <TableCell>{provider.role}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={attendance[provider.id] || false}
                        onCheckedChange={(checked) => handleAttendanceChange(provider.id, checked as boolean)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button onClick={handleSaveAttendance} className="mt-4">Save Attendance</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

