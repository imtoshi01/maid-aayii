'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getServiceProviders, getAttendance, submitAttendance } from '../lib/api'

interface ServiceProvider {
  id: number;
  name: string;
  role: string;
  color: string;
}

interface AttendanceRecord {
  id: number;
  service_provider_id: number;
  date: string;
  present: boolean;
  name: string;
  role: string;
}

const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];

export default function PreviousAttendance() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editAttendance, setEditAttendance] = useState<Record<number, boolean>>({});
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const providers = await getServiceProviders();
        setServiceProviders(providers.map((provider: ServiceProvider, index: number) => ({
          ...provider,
          color: colors[index % colors.length]
        })));
        await fetchMonthlyAttendance();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [currentDate]);

  const fetchMonthlyAttendance = async () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const monthlyAttendance: Record<number, number> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const attendanceData = await getAttendance(dateString);

      attendanceData.forEach((record: AttendanceRecord) => {
        if (record.present) {
          monthlyAttendance[record.service_provider_id] = (monthlyAttendance[record.service_provider_id] || 0) + 1;
        }
      });
    }

    setMonthlyAttendance(monthlyAttendance);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  }

  const handleDateClick = async (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    const dateString = clickedDate.toISOString().split('T')[0];
    const attendanceData = await getAttendance(dateString);
    const attendanceMap: Record<number, boolean> = {};
    attendanceData.forEach((record: AttendanceRecord) => {
      attendanceMap[record.service_provider_id] = record.present;
    });
    setEditAttendance(attendanceMap);
  }

  const handleAttendanceChange = (id: number, checked: boolean) => {
    setEditAttendance(prev => ({
      ...prev,
      [id]: checked
    }));
  }

  const handleSaveAttendance = async () => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      await submitAttendance(dateString, editAttendance);
      setSelectedDate(null);
      await fetchMonthlyAttendance();
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <div className="space-x-2">
            <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="font-bold">{day}</div>
            ))}
            {generateCalendarDays().map((day, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <div className="aspect-square border p-1 text-sm cursor-pointer">
                    {day}
                    {day && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {serviceProviders.map(provider => (
                          monthlyAttendance[provider.id] && monthlyAttendance[provider.id] >= day ? (
                            <div key={provider.id} className={`w-2 h-2 rounded-full ${provider.color}`} />
                          ) : null
                        ))}
                      </div>
                    )}
                  </div>
                </DialogTrigger>
                {day && (
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Attendance for {new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()}</DialogTitle>
                    </DialogHeader>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">Present</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {serviceProviders.map((provider) => (
                          <TableRow key={provider.id}>
                            <TableCell>{provider.name}</TableCell>
                            <TableCell>{provider.role}</TableCell>
                            <TableCell className="text-right">
                              <Checkbox
                                checked={editAttendance[provider.id] || false}
                                onCheckedChange={(checked) => handleAttendanceChange(provider.id, checked as boolean)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button onClick={handleSaveAttendance}>Save Attendance</Button>
                  </DialogContent>
                )}
              </Dialog>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Attendance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Days Present</TableHead>
                <TableHead className="text-right">Attendance Color</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceProviders.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell className="font-medium">{provider.name}</TableCell>
                  <TableCell>{provider.role}</TableCell>
                  <TableCell className="text-right">{monthlyAttendance[provider.id] || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className={`w-6 h-6 rounded-full ${provider.color} inline-block`}></div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

