'use client'

import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { Menu, X, User, LogOut, Settings } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface PublicNavbarProps {
  setVideoPlaying?: (playing: boolean) => void
}

interface UserProfile {
  first_name: string
  last_name: string
  email: string
  organization: string | null
  position: string | null
  aapc_id: string | null
  ahima_id: string | null
  role: string | null
}

export default function PublicNavbar({ setVideoPlaying }: PublicNavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileButtonRef = useRef<HTMLButtonElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  // Check authentication status and fetch user profile
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          setUserProfile(profile)
        }
      } else {
        setUserProfile(null)
      }
    }
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session)
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          setUserProfile(profile)
        }
      } else {
        setUserProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Clear Remember Me preference
    localStorage.removeItem('accucoder_remember_me')
    // Clear auth tokens from both storages
    localStorage.removeItem('accucoder-auth')
    sessionStorage.removeItem('accucoder-auth')
    setProfileOpen(false)
    router.push('/')
  }

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node) &&
        !profileButtonRef.current?.contains(event.target as Node)
      ) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMobileMenuOpen(false)
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-lg shadow-primary/10' 
        : 'bg-background/70 backdrop-blur-md border-b border-border/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18">
          {/* Logo */}
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-all duration-300 hover:scale-105"
          >
            <Image 
              src="/images/design-mode/AccuCoder.png" 
              alt="AccuCoder" 
              width={140}
              height={36}
              className="h-9 w-auto"
              priority
            />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {pathname !== '/' && (
              <button
                onClick={() => router.push('/')}
                className="group relative text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300"
              >
                <span>Home</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </button>
            )}

            {pathname === '/' && (
              <>
                <button 
                  onClick={() => scrollToSection('demo-section')}
                  className="group relative text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300"
                >
                  <span>Demo</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                </button>
                <button 
                  onClick={() => scrollToSection('features-section')}
                  className="group relative text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300"
                >
                  <span>Features</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                </button>
                <button 
                  onClick={() => scrollToSection('about-section')}
                  className="group relative text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300"
                >
                  <span>About</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                </button>
                <button 
                  onClick={() => scrollToSection('testimonials-section')}
                  className="group relative text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300"
                >
                  <span>Reviews</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                </button>
              </>
            )}
            
            {!isLoggedIn && (
              <>
                <div className="h-6 w-px bg-border"></div>
                
                {pathname !== '/login' && (
                  <button
                    onClick={() => router.push('/login')}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300"
                  >
                    Login
                  </button>
                )}
                {pathname !== '/signup' && (
                  <button
                    onClick={() => router.push('/signup')}
                    className="group relative px-6 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg font-medium text-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
                  >
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                )}
              </>
            )}
            
            {isLoggedIn && userProfile && (
              <>
                <div className="h-6 w-px bg-border"></div>
                
                {/* Profile Section */}
                <div className="relative">
                  <button 
                    ref={profileButtonRef}
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="p-2 text-foreground/70 hover:text-foreground hover:bg-secondary/60 rounded-lg transition-all flex items-center gap-2"
                    title="User Profile"
                    aria-label="User Profile"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                        {userProfile.first_name?.[0]}{userProfile.last_name?.[0]}
                      </div>
                      <span className="text-sm font-medium">
                        {userProfile.first_name} {userProfile.last_name}
                      </span>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {profileOpen && (
                    <div
                      ref={profileDropdownRef}
                      className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg p-4 z-50"
                    >
                      {/* User Info Header */}
                      <div className="flex items-start gap-3 pb-4 border-b border-border">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                          {userProfile.first_name?.[0]}{userProfile.last_name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">
                            {userProfile.first_name} {userProfile.last_name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
                          {userProfile.role === 'superadmin' && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                              Super Admin
                            </span>
                          )}
                          {userProfile.role === 'admin' && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/10 text-blue-500 text-xs font-medium rounded">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Profile Details */}
                      <div className="py-4 space-y-3 border-b border-border">
                        {userProfile.organization && (
                          <div>
                            <p className="text-xs text-muted-foreground">Organization</p>
                            <p className="text-sm font-medium">{userProfile.organization}</p>
                          </div>
                        )}
                        {userProfile.position && (
                          <div>
                            <p className="text-xs text-muted-foreground">Position</p>
                            <p className="text-sm font-medium">{userProfile.position}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          {userProfile.aapc_id && (
                            <div>
                              <p className="text-xs text-muted-foreground">AAPC ID</p>
                              <p className="text-sm font-medium">{userProfile.aapc_id}</p>
                            </div>
                          )}
                          {userProfile.ahima_id && (
                            <div>
                              <p className="text-xs text-muted-foreground">AHIMA ID</p>
                              <p className="text-sm font-medium">{userProfile.ahima_id}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Admin Panel Button (only for admin/superadmin) */}
                      {(userProfile.role === 'admin' || userProfile.role === 'superadmin') && (
                        <Link
                          href="/admin"
                          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-all"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                      )}

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-300">
          <div className="px-4 py-4 space-y-2">
            {pathname !== '/' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  router.push('/')
                }}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all duration-200"
              >
                Home
              </button>
            )}

            {pathname === '/' && (
              <>
                <button 
                  onClick={() => scrollToSection('demo-section')}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all duration-200"
                >
                  Demo
                </button>
                <button 
                  onClick={() => scrollToSection('features-section')}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all duration-200"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('about-section')}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all duration-200"
                >
                  About
                </button>
                <button 
                  onClick={() => scrollToSection('testimonials-section')}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all duration-200"
                >
                  Reviews
                </button>
              </>
            )}
            
            {!isLoggedIn && (
              <>
                <div className="h-px bg-border my-2"></div>
                
                {pathname !== '/login' && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      router.push('/login')
                    }}
                    className="block w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all duration-200"
                  >
                    Login
                  </button>
                )}
                {pathname !== '/signup' && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      router.push('/signup')
                    }}
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-primary/25 transition-all duration-200"
                  >
                    Get Started
                  </button>
                )}
              </>
            )}
            
            {isLoggedIn && userProfile && (
              <>
                <div className="h-px bg-border my-2"></div>
                
                {/* Mobile Profile Section */}
                <div className="px-4 py-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {userProfile.first_name?.[0]}{userProfile.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {userProfile.first_name} {userProfile.last_name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
                    </div>
                  </div>
                  
                  {(userProfile.role === 'admin' || userProfile.role === 'superadmin') && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full mb-2 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-all text-sm font-medium"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
