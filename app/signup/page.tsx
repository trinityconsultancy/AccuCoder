'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import PublicNavbar from '@/components/public-navbar'

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [checking, setChecking] = useState(true)
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // User is already logged in, redirect to app
        router.push('/dashboard')
      } else {
        setChecking(false)
      }
    }
    checkAuth()
  }, [router])
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    certificationType: '', // 'AAPC' or 'AHIMA'
    certificationTitle: '', // Specific certification (CPC, CIC, etc.)
    customCertification: '', // For 'Other' option
    certificationId: '',
    organization: '',
    position: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Reset certification title when certification body changes
    if (name === 'certificationType') {
      setFormData({
        ...formData,
        [name]: value,
        certificationTitle: '', // Reset certification title
        customCertification: '' // Reset custom certification
      })
    } else if (name === 'certificationTitle' && value !== 'Other') {
      // Reset custom certification if not "Other"
      setFormData({
        ...formData,
        [name]: value,
        customCertification: ''
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validation
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        throw new Error('Please fill in all required fields')
      }

      if (!formData.certificationType || !formData.certificationTitle || !formData.certificationId) {
        throw new Error('Please select certification body, title, and provide your certification ID')
      }

      if (formData.certificationTitle === 'Other' && !formData.customCertification) {
        throw new Error('Please specify your certification title')
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // Strong password validation
      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }
      if (!/[A-Z]/.test(formData.password)) {
        throw new Error('Password must contain at least one uppercase letter')
      }
      if (!/[a-z]/.test(formData.password)) {
        throw new Error('Password must contain at least one lowercase letter')
      }
      if (!/[0-9]/.test(formData.password)) {
        throw new Error('Password must contain at least one number')
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        throw new Error('Password must contain at least one special character (!@#$%^&*...)')
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation for demo
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            certification_body: formData.certificationType,
            certification_title: formData.certificationTitle === 'Other' 
              ? formData.customCertification 
              : formData.certificationTitle,
            aapc_id: formData.certificationType === 'AAPC' ? formData.certificationId : null,
            ahima_id: formData.certificationType === 'AHIMA' ? formData.certificationId : null,
            organization: formData.organization || null,
            position: formData.position || null
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw new Error(`Profile creation failed: ${profileError.message}`)
        }

        setSuccess(true)
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err) {
      console.error('Signup error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up'
      
      // Check if it's an email rate limit error
      if (errorMessage.includes('rate limit') || errorMessage.includes('magic link')) {
        setError('Email confirmation is temporarily unavailable. Please disable email confirmation in Supabase Dashboard (Authentication → Providers → Email) or use the Login page if you already have an account.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
          <p className="text-muted-foreground mb-4">
            Please check your email to verify your account.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to login...
          </p>
        </div>
      </div>
    )
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
      
      <div className="relative px-4 pt-8 pb-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-start">
          {/* Left Side - Branding */}
          <div className="hidden md:block space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15">
              <span className="text-sm font-medium text-primary">Join 1000+ Healthcare Professionals</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight">
              Start Your Journey with
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-2">
                AccuCoder
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Access powerful AI-driven medical coding tools designed for AAPC and AHIMA certified professionals.
            </p>
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <span className="text-muted-foreground">Complete ICD-10-CM 2026 database</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <span className="text-muted-foreground">AI-powered code suggestions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <span className="text-muted-foreground">Interactive learning modules</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full">
            {/* Mobile Logo */}
            <div className="md:hidden text-center mb-6">
              <Image 
                src="/images/design-mode/AccuCoder.png" 
                alt="AccuCoder" 
                width={140}
                height={36}
                className="h-9 w-auto mx-auto mb-3"
              />
              <h2 className="text-2xl font-bold">Create Your Account</h2>
            </div>

            {/* Form Card */}
            <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl shadow-primary/5 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-base font-semibold mb-3 text-foreground">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* First Name */}
                    <div className="h-[68px]">
                      <label htmlFor="firstName" className="block text-xs font-medium mb-1.5">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="John"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="h-[68px]">
                      <label htmlFor="lastName" className="block text-xs font-medium mb-1.5">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Security Section */}
                <div>
                  <h3 className="text-base font-semibold mb-3 text-foreground">Account Security</h3>
                  <div className="space-y-3">
                    {/* Email */}
                    <div className="h-[68px]">
                      <label htmlFor="email" className="block text-xs font-medium mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="john.doe@example.com"
                      />
                    </div>

                    {/* Password with Show/Hide */}
                    <div className="h-[95px]">
                      <label htmlFor="password" className="block text-xs font-medium mb-1.5">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength={8}
                          className="w-full px-3 py-2 pr-10 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div className="h-5 mt-1">
                        {formData.password && (
                          <div className="flex items-center gap-1">
                            <div className={`h-1 flex-1 rounded-full transition-colors ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} title="8+ characters" />
                            <div className={`h-1 flex-1 rounded-full transition-colors ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`} title="Uppercase" />
                            <div className={`h-1 flex-1 rounded-full transition-colors ${/[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`} title="Lowercase" />
                            <div className={`h-1 flex-1 rounded-full transition-colors ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`} title="Number" />
                            <div className={`h-1 flex-1 rounded-full transition-colors ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`} title="Special character" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Confirm Password with Show/Hide */}
                    <div className="h-[95px]">
                      <label htmlFor="confirmPassword" className="block text-xs font-medium mb-1.5">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          minLength={8}
                          className="w-full px-3 py-2 pr-10 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div className="h-5 mt-1">
                        {formData.confirmPassword && (
                          <div className="text-xs flex items-center gap-1">
                            {formData.password === formData.confirmPassword ? (
                              <>
                                <span className="text-green-500">✓</span>
                                <span className="text-green-500">Passwords match</span>
                              </>
                            ) : (
                              <>
                                <span className="text-red-500">✗</span>
                                <span className="text-red-500">Passwords do not match</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Credentials Section */}
                <div>
                  <h3 className="text-base font-semibold mb-3 text-foreground">Professional Credentials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Certification Body */}
                    <div className="h-[68px]">
                      <label htmlFor="certificationType" className="block text-xs font-medium mb-1.5">
                        Certification Body <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="certificationType"
                        name="certificationType"
                        value={formData.certificationType}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      >
                        <option value="">Select Certification Body</option>
                        <option value="AAPC">AAPC</option>
                        <option value="AHIMA">AHIMA</option>
                      </select>
                    </div>

                    {/* Certification Title */}
                    <div className="h-[68px]">
                      <label htmlFor="certificationTitle" className="block text-xs font-medium mb-1.5">
                        Certification Title <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="certificationTitle"
                        name="certificationTitle"
                        value={formData.certificationTitle}
                        onChange={handleChange}
                        required
                        disabled={!formData.certificationType}
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {!formData.certificationType 
                            ? "Select certification body first" 
                            : "Select Your Certification"}
                        </option>
                        
                        {/* AAPC Certifications */}
                        {formData.certificationType === 'AAPC' && (
                          <>
                            <option value="CPC">CPC - Certified Professional Coder</option>
                            <option value="CPC-A">CPC-A - Certified Professional Coder (Apprentice)</option>
                            <option value="CIC">CIC - Certified Inpatient Coder</option>
                            <option value="COC">COC - Certified Outpatient Coder</option>
                            <option value="CRC">CRC - Certified Risk Adjustment Coder</option>
                            <option value="CPB">CPB - Certified Professional Biller</option>
                            <option value="CPMA">CPMA - Certified Professional Medical Auditor</option>
                            <option value="CPPM">CPPM - Certified Physician Practice Manager</option>
                            <option value="CPC-P">CPC-P - Certified Professional Coder (Payer)</option>
                            <option value="CEMC">CEMC - Certified Evaluation & Management Coder</option>
                            <option value="CGSC">CGSC - Certified General Surgery Coder</option>
                            <option value="COPC">COPC - Certified Outpatient Pain Coder</option>
                            <option value="CASCC">CASCC - Certified Ambulatory Surgery Center Coder</option>
                            <option value="CPCO">CPCO - Certified Physician Coding Specialist (Ophthalmology)</option>
                            <option value="Other">Other AAPC Certification</option>
                          </>
                        )}

                        {/* AHIMA Certifications */}
                        {formData.certificationType === 'AHIMA' && (
                          <>
                            <option value="CCS">CCS - Certified Coding Specialist</option>
                            <option value="CCS-P">CCS-P - Certified Coding Specialist (Physician-based)</option>
                            <option value="CCA">CCA - Certified Coding Associate</option>
                            <option value="RHIA">RHIA - Registered Health Information Administrator</option>
                            <option value="RHIT">RHIT - Registered Health Information Technician</option>
                            <option value="CDIP">CDIP - Certified Documentation Improvement Practitioner</option>
                            <option value="CHDA">CHDA - Certified Health Data Analyst</option>
                            <option value="CHPS">CHPS - Certified in Healthcare Privacy and Security</option>
                            <option value="Other">Other AHIMA Certification</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Custom Certification Input (shown when "Other" is selected) */}
                  {formData.certificationTitle === 'Other' && (
                    <div className="mt-3 h-[68px]">
                      <label htmlFor="customCertification" className="block text-xs font-medium mb-1.5">
                        Specify Certification <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="customCertification"
                        name="customCertification"
                        value={formData.customCertification}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Enter your certification title"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {/* Certification ID */}
                    <div className="h-[68px]">
                      <label htmlFor="certificationId" className="block text-xs font-medium mb-1.5">
                        Certification ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="certificationId"
                        name="certificationId"
                        value={formData.certificationId}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
                        placeholder={formData.certificationType ? `Enter ${formData.certificationType} ID` : "Select certification first"}
                        disabled={!formData.certificationType}
                      />
                    </div>

                    {/* Organization */}
                    <div className="h-[68px]">
                      <label htmlFor="organization" className="block text-xs font-medium mb-1.5">
                        Organization / Company
                      </label>
                      <input
                        type="text"
                        id="organization"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Your organization"
                      />
                    </div>
                  </div>

                  {/* Job Title - Full Width */}
                  <div className="mt-3 h-[68px]">
                    <label htmlFor="position" className="block text-xs font-medium mb-1.5">
                      Job Title / Position
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="e.g., Medical Coder"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Sign Up
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-4 text-center text-xs">
                <span className="text-muted-foreground">Already have an account? </span>
                <button
                  onClick={() => router.push('/login')}
                  className="text-primary font-medium hover:underline"
                >
                  Log in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


