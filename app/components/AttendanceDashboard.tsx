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
  note: string;
}

export default function AttendanceDashboard() {
  const [date, setDate] = useState<Date>(new Date());
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 📅 Fetch Service Providers and Attendance
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const providers = await getServiceProviders();
        setServiceProviders(providers);
        
        const dateString = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split('T')[0];
        const attendanceData = await getAttendance(dateString);
        
        const attendanceMap: Record<number, boolean> = {};
        const notesMap: Record<number, string> = {};
        
        attendanceData.forEach((record: AttendanceRecord) => {
          attendanceMap[record.service_provider_id] = record.present;
          notesMap[record.service_provider_id] = record.note || '';
        });
        
        setAttendance(attendanceMap);
        setNotes(notesMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [date]);

  // ✅ Handle Attendance Change
  const handleAttendanceChange = (id: number, checked: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [id]: checked
    }));
    setIsSubmitted(false);
    setNotification(null);
  };

  // 📝 Handle Notes Change
  const handleNoteChange = (id: number, value: string) => {
    setNotes(prev => ({
      ...prev,
      [id]: value
    }));
    setIsSubmitted(false);
    setNotification(null);
  };

  // 🚀 Submit Attendance and Notes
  const handleSubmit = async () => {
    try {
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dateString = utcDate.toISOString().split('T')[0];
      
      const submissionData = serviceProviders.map(provider => ({
        service_provider_id: provider.id,
        present: attendance[provider.id] || false,
        note: notes[provider.id] || ''
      }));
      
      await submitAttendance(dateString, submissionData);
      setIsSubmitted(true);
      setNotification({ type: 'success', message: 'Attendance submitted successfully!' });
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setNotification({ type: 'error', message: 'Failed to submit attendance. Please try again.' });
    }
  };

  // 🕑 Loading State
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 🖥️ UI Rendering
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Today's Date: {date.toDateString()}</CardTitle>
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
                  <TableHead className="text-center">Name</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                  <TableHead className="text-center">Took leave</TableHead>
                  <TableHead className="text-center">Notes & Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium text-center">{provider.name}</TableCell>
                    <TableCell className="text-center">{provider.role}</TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={attendance[provider.id] || false}
                        onCheckedChange={(checked) => handleAttendanceChange(provider.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <textarea
                        className="w-full p-2 border rounded-md"
                        maxLength={200}
                        placeholder="Add a note (max 200 characters)"
                        value={notes[provider.id] || ''}
                        onChange={(e) => handleNoteChange(provider.id, e.target.value)}
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
  );
}
