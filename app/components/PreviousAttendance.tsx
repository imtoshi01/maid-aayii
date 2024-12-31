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
}

const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];

export default function PreviousAttendance() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editAttendance, setEditAttendance] = useState<Record<number, boolean>>({});
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const attendanceMap: Record<number, boolean> = {};
    monthlyAttendance.forEach(record => {
      if (record.date === dateString) {
        attendanceMap[record.service_provider_id] = record.present;
      }
    });
    setEditAttendance(attendanceMap);
  };

  const handleDialogClose = () => {
    setEditAttendance({}); // Reset editAttendance on dialog close
    setSelectedDate(null);
  };

  const handleAttendanceChange = (id: number, checked: boolean) => {
    setEditAttendance(prev => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleSaveAttendance = async (day: number) => {
    const saveDate = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), day));
    const dateString = saveDate.toISOString().split('T')[0];
    const res = await submitAttendance(dateString, editAttendance);
    console.log(res);
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
                          {serviceProviders.map(provider => (
                            <TableRow key={provider.id}>
                              <TableCell>{provider.name}</TableCell>
                              <TableCell>{provider.role}</TableCell>
                              <TableCell className="text-right">
                                <Checkbox
                                  checked={editAttendance[provider.id] || false}
                                  onCheckedChange={checked => handleAttendanceChange(provider.id, checked as boolean)}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <DialogClose asChild>
                      <Button onClick={() => { console.log('Save clicked'); handleSaveAttendance(day); }}>
                        Save Attendance
                        </Button>
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
  )
}

