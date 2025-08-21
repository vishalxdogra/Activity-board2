'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    password: '',
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
      const body = isLogin 
        ? { rollNumber: formData.rollNumber, password: formData.password }
        : formData

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        if (isLogin) {
          router.push('/dashboard')
        } else {
          setError('')
          alert('Account created successfully! Please login.')
          setIsLogin(true)
          setFormData({ rollNumber: '', name: '', password: '' })
        }
      } else {
        setError(data.error || 'An error occurred')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Tomorrow's Datagram</h1>
          <p className="mt-2 text-gray-600">College Activity Board</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? 'Sign In' : 'Create Account'}</CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Enter your roll number and password to access the activity board'
                : 'Create an account to discover and join college activities'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700">
                  Roll Number
                </label>
                <Input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  required
                  placeholder="e.g., CS2023/014"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: Department + Year + / + Number (e.g., CS2023/014)
                </p>
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                {!isLogin && (
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                )}
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setFormData({ rollNumber: '', name: '', password: '' })
                }}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>

            {!isLogin && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> After creating your account, you'll need to upload your student ID for verification to create activities.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
