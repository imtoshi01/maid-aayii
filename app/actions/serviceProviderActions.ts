'use server'

import { addServiceProvider, addAttendance, ServiceProvider, Attendance } from '../lib/data'

export async function createServiceProvider(formData: FormData) {
  const provider: Omit<ServiceProvider, 'id'> = {
    name: formData.get('name') as string,
    role: formData.get('role') as string,
    dailySalary: Number(formData.get('dailySalary')),
    allowedLeaves: Number(formData.get('allowedLeaves')),
    contactNumber: formData.get('contactNumber') as string,
    upiId: formData.get('upiId') as string,
  }
  return addServiceProvider(provider)
}

export async function markAttendance(formData: FormData) {
  const attendance: Omit<Attendance, 'id'> = {
    serviceProviderId: formData.get('serviceProviderId') as string,
    date: formData.get('date') as string,
    present: formData.get('present') === 'true',
  }
  return addAttendance(attendance)
}

