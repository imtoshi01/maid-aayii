const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

export async function requestOTP(mobile: string) {
  const response = await fetch(`${API_BASE_URL}/request-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobile }),
  });

  if (!response.ok) {
    throw new Error('Failed to request OTP');
  }

  return response.json();
}

export async function verifyOTP(mobile: string, otp: string) {
  const response = await fetch(`${API_BASE_URL}/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobile, otp }),
  });

  if (!response.ok) {
    throw new Error('Failed to verify OTP');
  }

  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
}

export async function updateUserDetails(userData: {
  name: string;
  email: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}) {
  const response = await fetch(`${API_BASE_URL}/update-user`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Failed to update user details');
  }

  return response.json();
}

export async function getServiceProviders() {
  const response = await fetch(`${API_BASE_URL}/service-providers`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch service providers');
  }
  return response.json();
}

export async function getAttendance(date: string) {
  const response = await fetch(`${API_BASE_URL}/attendance/${date}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch attendance');
  }
  return response.json();
}

export async function submitAttendance(date: string, attendance: Record<number, boolean>) {
  const response = await fetch(`${API_BASE_URL}/attendance`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ date, attendance }),
  });
  if (!response.ok) {
    throw new Error('Failed to submit attendance');
  }
  return response.json();
}

export async function addServiceProvider(data: Record<string, string>) {
  const response = await fetch(`${API_BASE_URL}/service-providers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to add service provider');
  }
  return response.json();
}

export async function getMonthlyAttendance(year: number, month: number) {
  const response = await fetch(`${API_BASE_URL}/monthly-attendance/${year}/${month.toString().padStart(2, '0')}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch monthly attendance');
  }
  // const data = await response.json();
  // console.log(data)
  return response.json();
}