'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { requestOTP, verifyOTP } from '../lib/api'
import { Phone, ArrowRight, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegistrationForm() {
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      await requestOTP(mobile)
      setOtpSent(true)
    } catch (error) {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await verifyOTP(mobile, otp)
      if (response.isNewUser) {
        router.push('/setup')
      } else {
        router.push('/')
      }
    } catch (error) {
      setError('Invalid OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-blue-50 bg-[length:auto_100%] md:bg-[length:100%_auto]"
      style={{
        backgroundImage: 'url("https://res.cloudinary.com/dgmj0hyda/image/upload/v1735899471/DALL_E_2025-01-03_15.47.19_-_A_cheerful_Indian_housewife_in_traditional_attire_proudly_holding_a_smartphone_displaying_an_overlay_of_app_interface_graphics_showing_maid_attendanc_rtcaq1.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        height: 'auto',
      }}
    >
      <div className="w-full max-w-md text-center mb-8 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-blue-600 mb-2 text-shadow">
          KaamKiDairy
        </h1>
        <p className="text-orange-600 text-lg font-semibold">
          आपकी सेवा में हमेशा तत्पर
        </p>
      </div>
      
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-2 border-orange-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
            Welcome
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Enter your mobile number to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-gray-700">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="pl-10 border-2 border-orange-100 focus:border-blue-500"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                  />
                </div>
                <p className="text-sm text-gray-600">
                  We'll send you a one-time password
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 transition-all duration-300"
                disabled={isLoading || mobile.length !== 10}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-gray-700">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter the 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  className="text-center text-2xl tracking-wider border-2 border-orange-100 focus:border-blue-500"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    OTP sent to {mobile}
                  </p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 hover:text-orange-600"
                    onClick={() => setOtpSent(false)}
                    type="button"
                  >
                    Change number
                  </Button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 transition-all duration-300"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
            </form>
          )}
          {error && (
            <Alert variant="destructive" className="mt-4 border-2 border-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

