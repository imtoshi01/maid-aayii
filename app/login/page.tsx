'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/register');
  }, [router]);

  return null; // Optionally, show a loading spinner here
}
