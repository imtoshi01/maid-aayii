'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthlyAttendance, submitAttendance } from '../lib/api';

interface ServiceProvider {
  id: number;
  name: string;
  role: string;
  color: string;
}

interface AttendanceRecord {
  service_provider_id: number;
  date: string;
  present: boolean;
  note: string;
}

const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];

export default function PreviousAttendance() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editAttendance, setEditAttendance] = useState<Record<number, { present: boolean; note: string }>>({});
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 📅 Fetch Monthly Attendance
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const attendanceData = await getMonthlyAttendance(currentDate.getFullYear(), currentDate.getMonth() + 1);
        console.log(attendanceData);
        setMonthlyAttendance(attendanceData);

        const uniqueProviders: ServiceProvider[] = Array.from(new Set(attendanceData.map((record: AttendanceRecord) => record.service_provider_id)))
          .map((id, ind) => {
            id = id as number;
            const providerData = attendanceData.find((record: AttendanceRecord) => record.service_provider_id === id);
            return {
              id,
              name: providerData?.name || '',
              role: providerData?.role || '',
              color: colors[ind % colors.length],
            } as ServiceProvider;
          });

        console.log('uniqueProviders');
        console.log(uniqueProviders);
        setServiceProviders(uniqueProviders);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [currentDate]);

  const isPresentMap = useMemo(() => {
    const map = new Map<string, boolean>();
    monthlyAttendance.forEach(record => {
      map.set(record.date, (record.present || map.get(record.date) || false));
    });
    return map;
  }, [monthlyAttendance]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

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
  };

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), day));
    setSelectedDate(clickedDate);
    const dateString = clickedDate.toISOString().split('T')[0];
    const attendanceMap: Record<number, { present: boolean; note: string }> = {};

    monthlyAttendance.forEach((record) => {
      if (record.date === dateString) {
        attendanceMap[record.service_provider_id] = {
          present: record.present,
          note: record.note || '',
        };
      }
    });
    setEditAttendance(attendanceMap);
  };

  const handleDialogClose = () => {
    setEditAttendance({}); // Reset editAttendance on dialog close
    setSelectedDate(null);
  };

  const handleAttendanceChange = (id: number, checked: boolean) => {
    setEditAttendance((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        present: checked,
      },
    }));
  };

  const handleNoteChange = (id: number, value: string) => {
    setEditAttendance((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        note: value,
      },
    }));
  };

  // 🚀 Save Attendance and Notes
  const handleSaveAttendance = async (day: number) => {
    const saveDate = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), day));
    const dateString = saveDate.toISOString().split('T')[0];

    const submissionData = serviceProviders.map((provider) => ({
      service_provider_id: provider.id,
      present: editAttendance[provider.id]?.present || false,
      note: editAttendance[provider.id]?.note || '',
    }));

    await submitAttendance(dateString, submissionData);

    setSelectedDate(null);
    const attendanceData = await getMonthlyAttendance(currentDate.getFullYear(), currentDate.getMonth() + 1);
    setMonthlyAttendance(attendanceData);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
      <CardHeader className="pb-4">
          <div className="flex justify-center items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-2xl font-semibold">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="font-bold">{day}</div>
            ))}
            {generateCalendarDays().map((day, index) => {
              const dateString = day
                ? new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), day)).toISOString().split('T')[0]
                : null;
              const isPresent = dateString ? isPresentMap.get(dateString) || false : false;

              return (
                <Dialog key={index}       onOpenChange={(isOpen) => {
                  if (!isOpen) handleDialogClose(); // Reset editAttendance when the dialog closes
                }}>
                  <DialogTrigger asChild>
                    <div
                      onClick={() => day && handleDateClick(day)} 
                      className={`aspect-square border p-1 text-sm cursor-pointer ${day ? 'hover:bg-gray-100' : ''} ${
                        isPresent ? 'bg-red-100' : ''
                      }`}
                    >
                      {day}
                      {day && (
                        <div className="flex flex-wrap gap-1 mt-1">
                        {serviceProviders.map(provider => {
                          const isPresent = monthlyAttendance.some(record => {
                            const normalizedDate = record.date;
                            return record.service_provider_id === provider.id && 
                            normalizedDate === dateString && 
                            record.present
                          }

                          );
                          return isPresent ? (
                            <div key={provider.id} className={`w-2 h-2 rounded-full ${provider.color}`} />
                          ) : null;
                        })}
                        </div>
                      )}
                    </div>
                  </DialogTrigger>
                  {day && (
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Edit Attendance for {new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()}
                        </DialogTitle>
                      </DialogHeader>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Took leave</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceProviders.map((provider) => (
                            <TableRow key={provider.id}>
                              <TableCell>{provider.name}</TableCell>
                              <TableCell>{provider.role}</TableCell>
                              <TableCell>
                                <Checkbox
                                  checked={editAttendance[provider.id]?.present || false}
                                  onCheckedChange={(checked) => handleAttendanceChange(provider.id, checked as boolean)}
                                />
                                <textarea
                                  className="w-full mt-2 p-1 border"
                                  maxLength={200}
                                  placeholder="Add note"
                                  value={editAttendance[provider.id]?.note || ''}
                                  onChange={(e) => handleNoteChange(provider.id, e.target.value)}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <DialogClose asChild>
                        <Button onClick={() => handleSaveAttendance(day)}>Save Attendance</Button>
                      </DialogClose>
                    </DialogContent>
                  )}
                </Dialog>
              );
            })}
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
                <TableHead className="text-right">Days Absent</TableHead>
                <TableHead className="text-right">Attendance Color</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceProviders.map((provider) => {
                const daysPresent = monthlyAttendance.filter(record => 
                  record.service_provider_id === provider.id && record.present
                ).length;
                return (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>{provider.role}</TableCell>
                    <TableCell className="text-right">{daysPresent}</TableCell>
                    <TableCell className="text-right">
                      <div className={`w-6 h-6 rounded-full ${provider.color} inline-block`}></div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
