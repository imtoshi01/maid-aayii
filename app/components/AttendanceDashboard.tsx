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
import { getServiceProviders, getAttendance, submitAttendance } from '../lib/api'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { set } from 'date-fns'

interface ServiceProvider {
  id: number;
  name: string;
  role: string;
}

interface AttendanceRecord {
  id: number;
  service_provider_id: number;
  date: string;
  present: boolean;
  name: string;
  role: string;
}

export default function AttendanceDashboard() {
  const [date, setDate] = useState<Date>(new Date());
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const providers = await getServiceProviders();
        setServiceProviders(providers);
        const dateString = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split('T')[0];
        const attendanceData = await getAttendance(dateString);
        const attendanceMap: Record<number, boolean> = {};
        attendanceData.forEach((record: AttendanceRecord) => {
          attendanceMap[record.service_provider_id] = record.present;
        });
        setAttendance(attendanceMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [date]);

  const handleAttendanceChange = (id: number, checked: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [id]: checked
    }));
    setIsSubmitted(false); // Reset submission state when attendance changes
    setNotification(null); // Clear any previous notifications
  };

  const handleSubmit = async () => {
    try {
      const day = date.getDate();
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), day));
      const dateString = utcDate.toISOString().split('T')[0];
      await submitAttendance(dateString, attendance);
      setIsSubmitted(true);
      setNotification({ type: 'success', message: 'Attendance submitted successfully!' });
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setNotification({ type: 'error', message: 'Failed to submit attendance. Please try again.' });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Today's Date: {date.toDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          {notification && (
            <Alert variant={notification.type === 'success' ? 'default' : 'destructive'} className="mb-4">
              <AlertTitle>{notification.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Took leave</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>{provider.role}</TableCell>
                    <TableCell className="text-right">
                      <Checkbox
                        checked={attendance[provider.id] || false}
                        onCheckedChange={(checked) => handleAttendanceChange(provider.id, checked as boolean)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button 
            onClick={handleSubmit} 
            className={`w-full mt-4 ${isSubmitted ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
          >
            {isSubmitted ? '✔ Attendance Submitted' : 'Submit Attendance'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}