'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getServiceProviderDetails, updateServiceProvider, getMonthlyAttendance } from '../lib/api'

interface ServiceProvider {
  user_id: string;
  name: string;
  role: string;
  daily_salary: number;
  allowed_leaves: number;
  contact_number: string;
  upi_id: string;
}

interface AttendanceRecord {
  date: string;
  present: boolean;
  note: string;
  service_provider_id: string;
}

export default function ServiceProviderDetails({ id }: { id: string }) {
  const [serviceProvider, setServiceProvider] = useState<ServiceProvider | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [monthlyAttendance, setMonthlyAttendance] = useState<AttendanceRecord[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const details = await getServiceProviderDetails(id)
        setServiceProvider(details)
        const attendance = await getMonthlyAttendance(selectedYear, selectedMonth + 1)
        setMonthlyAttendance(attendance.filter((record: AttendanceRecord) => record.service_provider_id.toString() === id))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [id, selectedMonth, selectedYear])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (serviceProvider) {
      setServiceProvider({
        ...serviceProvider,
        [e.target.name]: e.target.value
      })
    }
  }

  const handleSave = async () => {
    if (serviceProvider) {
      try {
        await updateServiceProvider(serviceProvider)
        setIsEditing(false)
      } catch (error) {
        console.error('Error updating service provider:', error)
      }
    }
  }

  const calculateMonthlySummary = () => {
    const leavesTaken = monthlyAttendance.filter(record => record.present).length
    const leaveDates = monthlyAttendance
      .filter(record => record.present)
      .map(record => new Date(record.date).toLocaleDateString())
    return { leavesTaken, leaveDates }
  }

  if (!serviceProvider) {
    return <div>Loading...</div>
  }

  const { leavesTaken, leaveDates } = calculateMonthlySummary()

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-3xl">
      <Button 
        onClick={() => router.back()} 
        variant="outline" 
        className="mb-6"
      >
        Back
      </Button>

      {/* Monthly Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select 
              value={selectedMonth.toString()} 
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={selectedYear.toString()} 
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="font-medium">Leaves Taken: {leavesTaken}</p>
            <p className="font-medium">Leave Dates: {leaveDates.join(', ')}</p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyAttendance.map((record) => (
                  <TableRow key={record.date}>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.present ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{record.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Service Provider Details Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{serviceProvider.name} Details</CardTitle>
          {isEditing ? (
            <Button onClick={handleSave} size="sm">Save</Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">Edit</Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={serviceProvider.name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                name="role"
                value={serviceProvider.role}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailySalary">Daily Salary</Label>
              <Input
                id="dailySalary"
                name="dailySalary"
                type="number"
                value={serviceProvider.daily_salary}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowedLeaves">Allowed Leaves</Label>
              <Input
                id="allowedLeaves"
                name="allowedLeaves"
                type="number"
                value={serviceProvider.allowed_leaves}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                value={serviceProvider.contact_number}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                name="upiId"
                value={serviceProvider.upi_id}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

