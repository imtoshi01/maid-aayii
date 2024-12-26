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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const providers = await getServiceProviders();
        setServiceProviders(providers);
        const dateString = date.toISOString().split('T')[0];
        const attendanceData = await getAttendance(dateString);
        const attendanceMap: Record<number, boolean> = {};
        attendanceData.forEach((record: AttendanceRecord) => {
          attendanceMap[record.service_provider_id] = record.present;
        });
        setAttendance(attendanceMap);
        setIsSubmitted(Object.keys(attendanceMap).length > 0);
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
  };

  const handleSubmit = async () => {
    try {
      const dateString = date.toISOString().split('T')[0];
      await submitAttendance(dateString, attendance);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting attendance:', error);
    }
  };

  const handleEdit = () => {
    setIsSubmitted(false);
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Present</TableHead>
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
                        disabled={isSubmitted}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {isSubmitted ? (
            <Button onClick={handleEdit} className="w-full mt-4">Edit Attendance</Button>
          ) : (
            <Button onClick={handleSubmit} className="w-full mt-4">Submit Attendance</Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

