'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requestOTP, verifyOTP } from '../lib/api'

export default function RegistrationForm() {
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await requestOTP(mobile)
      setOtpSent(true)
      setError('')
    } catch (error) {
      setError('Failed to send OTP. Please try again.')
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await verifyOTP(mobile, otp)
      if (response.isNewUser) {
        router.push('/setup')
      } else {
        router.push('/')
      }
    } catch (error) {
      setError('Invalid OTP. Please try again.')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign Up / Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        {!otpSent ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">Request OTP</Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">Verify OTP</Button>
          </form>
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </CardContent>
    </Card>
  )
}

