export interface ServiceProvider {
  id: string
  name: string
  role: string
  dailySalary: number
  allowedLeaves: number
  contactNumber: string
  upiId: string
}

export interface Attendance {
  id: string
  serviceProviderId: string
  date: string
  present: boolean
}

// In-memory store for demo purposes
let serviceProviders: ServiceProvider[] = []
let attendance: Attendance[] = []

export function getServiceProviders() {
  return serviceProviders
}

export function getAttendance(serviceProviderId: string) {
  return attendance.filter(a => a.serviceProviderId === serviceProviderId)
}

export function addServiceProvider(provider: Omit<ServiceProvider, 'id'>) {
  const newProvider = { ...provider, id: Date.now().toString() }
  serviceProviders.push(newProvider)
  return newProvider
}

export function addAttendance(newAttendance: Omit<Attendance, 'id'>) {
  const attendanceEntry = { ...newAttendance, id: Date.now().toString() }
  attendance.push(attendanceEntry)
  return attendanceEntry
}

export function calculateSalary(serviceProviderId: string, month: number, year: number) {
  const provider = serviceProviders.find(sp => sp.id === serviceProviderId)
  if (!provider) return null

  const monthAttendance = attendance.filter(a => {
    const date = new Date(a.date)
    return a.serviceProviderId === serviceProviderId && 
           date.getMonth() === month && 
           date.getFullYear() === year
  })

  const daysPresent = monthAttendance.filter(a => a.present).length
  const daysAbsent = monthAttendance.filter(a => !a.present).length
  const unpaidLeaves = Math.max(0, daysAbsent - provider.allowedLeaves)
  const salaryDeduction = unpaidLeaves * provider.dailySalary
  const totalSalary = (daysPresent + Math.min(daysAbsent, provider.allowedLeaves)) * provider.dailySalary

  return {
    daysPresent,
    daysAbsent,
    unpaidLeaves,
    salaryDeduction,
    totalSalary
  }
}

