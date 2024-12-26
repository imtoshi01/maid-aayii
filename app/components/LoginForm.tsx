'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { loginUser, loginWithOTP, loginWithGoogle, requestOTP } from '../lib/api'
import { GoogleLogin } from '@react-oauth/google';

export default function LoginForm() {
  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email')
  const [credentials, setCredentials] = useState({ email: '', password: '', mobile: '', otp: '' })
  const [error, setError] = useState('')
  const [otpRequested, setOtpRequested] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (loginMethod === 'email') {
        await loginUser(credentials)
      } else {
        await loginWithOTP(credentials.mobile, credentials.otp)
      }
      router.push('/')
    } catch (error) {
      setError('Login failed. Please check your credentials and try again.')
    }
  }

  const handleRequestOTP = async () => {
    try {
      await requestOTP(credentials.mobile)
      setOtpRequested(true)
    } catch (error) {
      setError('Failed to send OTP. Please try again.')
    }
  }

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      router.push('/')
    } catch (error) {
      setError('Google login failed. Please try again.')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button onClick={() => setLoginMethod('email')} variant={loginMethod === 'email' ? 'default' : 'outline'} className="mr-2">
            Email
          </Button>
          <Button onClick={() => setLoginMethod('otp')} variant={loginMethod === 'otp' ? 'default' : 'outline'}>
            Mobile OTP
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {loginMethod === 'email' ? (
            <>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={credentials.email} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" value={credentials.password} onChange={handleChange} required />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input id="mobile" name="mobile" value={credentials.mobile} onChange={handleChange} required />
              </div>
              {otpRequested ? (
                <div>
                  <Label htmlFor="otp">OTP</Label>
                  <Input id="otp" name="otp" value={credentials.otp} onChange={handleChange} required />
                </div>
              ) : (
                <Button type="button" onClick={handleRequestOTP}>Request OTP</Button>
              )}
            </>
          )}
          <Button type="submit" className="w-full">Login</Button>
        </form>
        <div className="mt-4">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              setError('Google login failed. Please try again.');
            }}
          />
        </div>
        <div className="mt-4 text-center">
          <p>Don't have an account? <Link href="/register" className="text-blue-600 hover:underline">Sign up</Link></p>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </CardContent>
    </Card>
  )
}

