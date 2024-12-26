'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { loginUser } from '../lib/api'

export default function LoginForm() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await loginUser(credentials)
      router.push('/')
    } catch (error) {
      setError('Login failed. Please check your credentials and try again.')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" value={credentials.username} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" value={credentials.password} onChange={handleChange} required />
          </div>
          <Button type="submit">Login</Button>
          <div className="mt-4 text-center">
            <p>Don't have an account? <Link href="/register" className="text-blue-600 hover:underline">Sign up</Link></p>
          </div>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </CardContent>
    </Card>
  )
}

