'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { ArrowRight, Loader2, Mail, CheckCircle2 } from 'lucide-react'
import PublicNavbar from '@/components/public-navbar'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // User is already logged in, redirect to app
        router.push('/index')
      } else {
        setChecking(false)
      }
    }
    checkAuth()
  }, [router])
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
    setError(null)
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please enter email and password')
      }

      // IMPORTANT: Set Remember Me preference BEFORE signing in
      // This ensures the custom storage in supabase.ts uses the correct storage type
      if (formData.rememberMe) {
        localStorage.setItem('accucoder_remember_me', 'true')
      } else {
        localStorage.removeItem('accucoder_remember_me')
        // Clear any existing session from localStorage
        localStorage.removeItem('accucoder-auth')
      }
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) throw signInError

      if (data.user) {
        // Password correct, redirect to app
        router.push('/index')
        router.refresh() // Force a refresh to update layout state
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Failed to log in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-primary/2 to-accent/3" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/6 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-accent/6 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <PublicNavbar />
      
      {checking ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
      <div className="relative px-4 pt-8 pb-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-start">
          {/* Left Side - Branding */}
          <div className="hidden md:block space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15">
              <span className="text-sm font-medium text-primary">Trusted by Healthcare Professionals</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight">
              Welcome Back to
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-2">
                AccuCoder
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Continue your medical coding journey with AI-powered precision and efficiency.
            </p>
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <span className="text-muted-foreground">Instant access to all ICD-10 codes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <span className="text-muted-foreground">AI-powered coding assistance</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <span className="text-muted-foreground">Real-time validation & compliance</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full">
            {/* Mobile Logo */}
            <div className="md:hidden text-center mb-8">
              <Image 
                src="/images/design-mode/AccuCoder.png" 
                alt="AccuCoder" 
                width={140}
                height={36}
                className="h-9 w-auto mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold">Welcome Back</h2>
            </div>

            {/* Form Card */}
            <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl shadow-primary/5 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
          {/* Password Login Form */}
          <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="••••••••"
                />
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-muted-foreground cursor-pointer">
                  Remember me
                </label>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Log In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

          {/* Signup Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <button
              onClick={() => router.push('/signup')}
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </button>
          </div>
        </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
