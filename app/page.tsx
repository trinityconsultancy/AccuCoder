'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  BookOpen, 
  Search, 
  Pill, 
  Table, 
  MessageSquare, 
  GraduationCap,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  Menu,
  ExternalLink,
  Mail,
  Play,
  Star,
  Quote,
  Award,
  Lock,
  FileText,
  Calendar,
  Send,
  X,
  Check
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { getRandomTestimonialSet, type Testimonial } from '@/lib/testimonials-data'
import PublicNavbar from '@/components/public-navbar'
import { supabase } from '@/lib/supabase'

// Get Started Button Component
function GetStartedButton() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <button
      onClick={() => router.push(isLoggedIn ? '/dashboard' : '/signup')}
      className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg shadow-lg shadow-primary/15 hover:shadow-primary/25 hover:scale-105 transition-all duration-300 flex items-center gap-2 overflow-hidden"
    >
      <span className="absolute inset-0 bg-primary/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      <span className="relative flex items-center gap-2">
        {isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </span>
    </button>
  )
}

export default function Home() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [email, setEmail] = useState('')
  const [shuffledTestimonials, setShuffledTestimonials] = useState<Testimonial[]>([])
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    role: '',
    location: '',
    country: '',
    rating: 5,
    comment: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Get random testimonial set and shuffle on component mount
  useEffect(() => {
    const randomSet = getRandomTestimonialSet()
    const shuffled = [...randomSet].sort(() => Math.random() - 0.5)
    setShuffledTestimonials(shuffled)
  }, [])

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    if (shuffledTestimonials.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => {
        // Move to next set of 3 testimonials
        const nextIndex = prev + 3
        return nextIndex >= shuffledTestimonials.length ? 0 : nextIndex
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [shuffledTestimonials])

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      console.log('Submitting review:', reviewForm)
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      })

      const result = await response.json()
      console.log('Response:', result)

      if (response.ok) {
        alert('Thank you for your review! It will be visible after admin approval.')
        setShowReviewModal(false)
        setReviewForm({
          name: '',
          email: '',
          role: '',
          location: '',
          country: '',
          rating: 5,
          comment: ''
        })
      } else {
        const errorMsg = result.error || 'Failed to submit review'
        console.error('Server error:', errorMsg)
        alert(`Failed to submit review: ${errorMsg}`)
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Network error. Please check your internet connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const displayTestimonials = shuffledTestimonials.length > 0 ? [
    shuffledTestimonials[currentTestimonialIndex],
    shuffledTestimonials[(currentTestimonialIndex + 1) % shuffledTestimonials.length],
    shuffledTestimonials[(currentTestimonialIndex + 2) % shuffledTestimonials.length]
  ] : []
  
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <PublicNavbar setVideoPlaying={setVideoPlaying} />

      {/* Hero Section with Animated Gradient */}
      <div className="relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-primary/2 to-accent/3 animate-gradient-xy" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/6 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-accent/6 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(198,119,180,0.15),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="text-center space-y-8">
            {/* Badge with Animation */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-sm font-medium animate-fade-in-up shadow-md shadow-primary/5">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-primary font-semibold">AI-Powered Medical Coding Platform</span>
            </div>
            
            {/* Main Headline with Animation */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-in-up animation-delay-200">
              <span className="block text-foreground mb-2">Precision ICD-10-CM Coding</span>
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent animate-gradient-x">
                Powered by Intelligence
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Your complete ICD-10-CM coding companion with AI-powered assistance. 
              Code faster and more accurately with intelligent tools.
            </p>
            
            {/* CTA Buttons with Enhanced Effects */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in-up animation-delay-400">
              <GetStartedButton />
              <button
                onClick={() => {
                  const featuresSection = document.getElementById('features-section')
                  featuresSection?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="group px-8 py-4 bg-background/80 backdrop-blur-sm border-2 border-primary/30 rounded-xl font-semibold text-lg hover:bg-secondary/50 hover:border-primary transition-all duration-300 flex items-center gap-2 hover:scale-105 shadow-lg"
              >
                <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Explore Features
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Comprehensive Coverage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Always Updated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features-section" className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-6">
            <span className="animate-pulse">✨</span> Features
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Comprehensive Coding Solutions
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Enterprise-grade tools and curated resources designed to enhance accuracy and efficiency in medical coding
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature Cards */}
          <FeatureCard
            icon={<MessageSquare className="w-6 h-6" />}
            title="AI-Powered Coding Assistant"
            description="Leverage AccuBot's advanced natural language processing to resolve complex coding scenarios, documentation queries, and guideline interpretations in real-time"
            onClick={() => router.push('/assistant')}
          />
          
          <FeatureCard
            icon={<ArrowRight className="w-6 h-6 rotate-180" />}
            title="ICD-9 to ICD-10 Converter"
            description="Seamlessly migrate legacy ICD-9 codes to current ICD-10-CM standards with intelligent mapping and conversion recommendations"
            onClick={() => router.push('/converter')}
          />
          
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Claim Denial Analyzer"
            description="Identify coding errors and documentation gaps before submission with AI-driven analysis to minimize claim denials and optimize reimbursement"
            onClick={() => router.push('/about')}
          />
          
          <FeatureCard
            icon={<Search className="w-6 h-6" />}
            title="Clinical Chart Decoder"
            description="Transform complex clinical documentation into accurate ICD-10-CM codes with context-aware analysis and automated code suggestion"
            onClick={() => router.push('/cdi')}
          />
          
          <FeatureCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Combination Code Finder"
            description="Discover valid code combinations and identify required secondary codes with built-in compliance checking and sequencing guidance"
            onClick={() => router.push('/search')}
          />
          
          <FeatureCard
            icon={<GraduationCap className="w-6 h-6" />}
            title="Interactive Learning Center"
            description="Master advanced coding techniques through case studies, real-world scenarios, and continuously updated regulatory guidelines"
            onClick={() => router.push('/learning')}
          />
        </div>
      </div>

      {/* Comparison Section - Card Based Approach */}
      <div className="max-w-7xl mx-auto px-4 py-20" id="comparison-section">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Comparison</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Why Choose <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AccuCoder?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how AccuCoder transforms your medical coding workflow
          </p>
        </div>

        {/* Comparison Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {/* Card 1 */}
          <div className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Search Speed</h3>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Check className="w-6 h-6 text-primary mb-1" />
                <span className="text-xs font-medium text-primary">Instant</span>
                <span className="text-[10px] text-muted-foreground">AccuCoder</span>
              </div>
              <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-muted/30">
                <Clock className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="text-xs font-medium text-muted-foreground">Minutes</span>
                <span className="text-[10px] text-muted-foreground">Traditional</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">AI Assistance</h3>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Check className="w-6 h-6 text-primary mb-1" />
                <span className="text-xs font-medium text-primary">24/7</span>
                <span className="text-[10px] text-muted-foreground">AccuCoder</span>
              </div>
              <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-muted/30">
                <X className="w-6 h-6 text-red-500 mb-1" />
                <span className="text-xs font-medium text-muted-foreground">None</span>
                <span className="text-[10px] text-muted-foreground">Traditional</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Learning Resources</h3>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Check className="w-6 h-6 text-primary mb-1" />
                <span className="text-xs font-medium text-primary">Integrated</span>
                <span className="text-[10px] text-muted-foreground">AccuCoder</span>
              </div>
              <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-muted/30">
                <X className="w-6 h-6 text-red-500 mb-1" />
                <span className="text-xs font-medium text-muted-foreground">External</span>
                <span className="text-[10px] text-muted-foreground">Traditional</span>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Code Updates</h3>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Check className="w-6 h-6 text-primary mb-1" />
                <span className="text-xs font-medium text-primary">Automatic</span>
                <span className="text-[10px] text-muted-foreground">AccuCoder</span>
              </div>
              <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-muted/30">
                <Clock className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="text-xs font-medium text-muted-foreground">Manual</span>
                <span className="text-[10px] text-muted-foreground">Traditional</span>
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Accuracy Check</h3>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Check className="w-6 h-6 text-primary mb-1" />
                <span className="text-xs font-medium text-primary">AI-Powered</span>
                <span className="text-[10px] text-muted-foreground">AccuCoder</span>
              </div>
              <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-muted/30">
                <X className="w-6 h-6 text-red-500 mb-1" />
                <span className="text-xs font-medium text-muted-foreground">Manual</span>
                <span className="text-[10px] text-muted-foreground">Traditional</span>
              </div>
            </div>
          </div>

          {/* Card 6 */}
          <div className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Time Saved</h3>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Zap className="w-6 h-6 text-primary mb-1" />
                <span className="text-xs font-medium text-primary">40%</span>
                <span className="text-[10px] text-muted-foreground">AccuCoder</span>
              </div>
              <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-muted/30">
                <span className="w-6 h-6 flex items-center justify-center text-muted-foreground mb-1">-</span>
                <span className="text-xs font-medium text-muted-foreground">Baseline</span>
                <span className="text-[10px] text-muted-foreground">Traditional</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video/Animation Section */}
      <div id="demo-section" className="max-w-7xl mx-auto px-4 py-20 bg-gradient-to-b from-secondary/10 to-transparent">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 mb-4">
            <Play className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">See It In Action</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Experience <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AccuCoder</span> Live
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how AccuCoder simplifies medical coding in real-time
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-primary/25 shadow-2xl shadow-primary/15 group">
            {/* Background with animated blobs */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/15">
              <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-primary/15 rounded-full blur-3xl animate-blob animation-delay-4000" />
              </div>
            </div>

            {/* Play button overlay - always visible until video is added */}
            <div className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors">
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto group-hover:scale-110 group-hover:bg-primary transition-all shadow-lg shadow-primary/25">
                  <Play className="w-8 h-8 text-primary-foreground ml-1" />
                </div>
                <p className="text-lg font-semibold mb-2">Watch Demo Video</p>
                <p className="text-sm text-muted-foreground">See AccuCoder in action (2:30)</p>
              </div>
            </div>
          </div>

          {/* Key Features Below Video */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <Search className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Smart Search</h4>
              <p className="text-sm text-muted-foreground">Find codes instantly with AI</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <Sparkles className="w-8 h-8 text-accent mx-auto mb-3" />
              <h4 className="font-semibold mb-2">AI Assistant</h4>
              <p className="text-sm text-muted-foreground">Get help coding complex cases</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <GraduationCap className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Learn & Grow</h4>
              <p className="text-sm text-muted-foreground">Improve skills while working</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about-section" className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-6">
            <span className="animate-pulse">👋</span> About Us
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              About AccuCoder
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Revolutionizing medical coding through innovation and expertise
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Founder & Vision */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  AccuCoder was founded with a mission to transform medical coding through artificial intelligence and automation. 
                  We believe that advanced technology should empower healthcare professionals, not replace them.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Future Roadmap</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We're continuously expanding AccuCoder with advanced features including real-time coding assistance, 
                  predictive analytics, integration with major EHR systems, and comprehensive audit trail capabilities.
                </p>
              </div>
            </div>
          </div>

          {/* Mission */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Our Commitment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We are committed to delivering the most accurate, efficient, and user-friendly medical coding platform. 
                  Our goal is to reduce coding errors and minimize claim denials.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Why We Built This</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Understanding the complexities of modern healthcare documentation and reimbursement, we created tools 
                  that make a real difference in healthcare operations and patient care.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Team */}
        <div className="mb-16">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            The People Behind AccuCoder
          </h3>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            A passionate group working together to make medical coding better
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Rohit Pekhale */}
            <div className="group p-6 rounded-xl border border-border bg-card hover:border-primary/25 transition-all duration-300 hover:shadow-md text-center">
              <div className="relative w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden ring-2 ring-primary/15 group-hover:ring-primary/35 transition-all group-hover:scale-105">
                <Image
                  src="/images/team/rohit-pekhale.jpg"
                  alt="Rohit Pekhale"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
              <a 
                href="https://www.linkedin.com/in/pekhalerohit/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg font-semibold mb-1 hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                Rohit Pekhale
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-sm text-primary mb-2">Medical Coder • Project Lead</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Leading development with real-world coding expertise</p>
            </div>

            {/* Dhananjay Kakade */}
            <div className="group p-6 rounded-xl border border-border bg-card hover:border-primary/25 transition-all duration-300 hover:shadow-md text-center">
              <div className="relative w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden ring-2 ring-primary/15 group-hover:ring-primary/35 transition-all group-hover:scale-105">
                <Image
                  src="/images/team/dhananjay-kakade.jpg"
                  alt="Dhananjay Kakade"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full scale-115 -translate-y-2"
                />
              </div>
              <a 
                href="https://www.linkedin.com/in/dhananjay-kakade-657087294/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg font-semibold mb-1 hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                Dhananjay Kakade
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-sm text-primary mb-2">Full-Stack Developer</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Coding the magic behind the scenes</p>
            </div>

            {/* Senior Medical Coder - We Need A */}
            <div className="group p-6 rounded-xl border border-dashed border-primary/25 bg-primary/3 hover:border-primary/40 transition-all duration-300 hover:shadow-md text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center text-xl font-bold text-primary group-hover:scale-110 transition-transform">
                🏥
              </div>
              <h4 className="text-lg font-semibold mb-1">We Need A</h4>
              <p className="text-sm text-primary mb-2">Senior Medical Coder</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Join us to bring advanced coding expertise</p>
            </div>

            {/* Quality Assurance Engineer - We Need A */}
            <div className="group p-6 rounded-xl border border-dashed border-primary/25 bg-primary/3 hover:border-primary/40 transition-all duration-300 hover:shadow-md text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center text-xl font-bold text-primary group-hover:scale-110 transition-transform">
                🔍
              </div>
              <h4 className="text-lg font-semibold mb-1">We Need A</h4>
              <p className="text-sm text-primary mb-2">Quality Assurance Engineer</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Help ensure excellence and reliability</p>
            </div>
          </div>

          {/* Join Us CTA */}
          <div className="mt-12 text-center">
            <div className="inline-block p-6 rounded-2xl border-2 border-dashed border-primary/25 bg-primary/3 hover:border-primary/40 hover:bg-primary/5 transition-all">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-2xl">💼</span>
                <h4 className="text-xl font-semibold">Want to Join Our Team?</h4>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                We're looking for passionate individuals in medical coding and quality assurance. 
                Let's build something amazing together!
              </p>
              <button 
                onClick={() => {
                  const contactSection = document.getElementById('contact-section')
                  contactSection?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  // Add highlight effect
                  contactSection?.style.setProperty('transition', 'all 0.5s ease')
                  contactSection?.style.setProperty('background', 'rgba(var(--primary-rgb, 120 119 198) / 0.2)')
                  contactSection?.style.setProperty('border-radius', '0.75rem')
                  contactSection?.style.setProperty('padding', '1rem')
                  setTimeout(() => {
                    contactSection?.style.setProperty('background', 'transparent')
                  }, 2000)
                }}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2 mx-auto hover:scale-105"
              >
                <Mail className="w-4 h-4" />
                Get in Touch
              </button>
            </div>
          </div>
        </div>

        {/* Project Goal */}
        <div className="relative bg-gradient-to-r from-primary/3 to-accent/3 rounded-3xl p-8 md:p-12 text-center border border-primary/15 shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 to-accent/2" />
          <div className="relative">
            <h3 className="text-2xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Project Goal</span>
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Making medical coding simpler and more accessible through smart tools and AI assistance. 
              This project aims to help coders work more efficiently while learning and improving their skills.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials Section with Auto-Rotation */}
      <div className="max-w-7xl mx-auto px-4 py-20 bg-gradient-to-b from-secondary/10 to-transparent" id="testimonials-section">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 mb-4">
            <Quote className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Testimonials</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Loved by <span className="bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent animate-gradient-x">Medical Coders Worldwide</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            100+ professionals from USA, India, UAE & more have transformed their workflow
          </p>
        </div>

        {/* Animated Testimonials Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {displayTestimonials.map((testimonial, index) => (
            <div 
              key={`testimonial-${currentTestimonialIndex}-${index}`} 
              className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10 transition-all duration-700 ease-out animate-smooth-fade-slide hover:animate-gentle-float flex flex-col h-full min-h-[280px]"
              style={{
                animationDelay: `${index * 0.15}s`,
                animationFillMode: 'backwards',
                transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
            >
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium whitespace-nowrap">
                  {testimonial.country}
                </span>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-4 flex-grow">
                "{testimonial.comment}"
              </p>
              <div className="flex items-center gap-3 mt-auto pt-2 flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                  {testimonial.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold truncate">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground truncate">{testimonial.role}</p>
                  <p className="text-xs text-muted-foreground/70 truncate">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Your Review Button */}
        <div className="text-center mb-12">
          <button
            onClick={() => setShowReviewModal(true)}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-3 mx-auto shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:scale-105 group"
          >
            <Star className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Share Your Experience
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Stats Below Testimonials */}
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-16">
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/8 to-accent/8 border border-primary/15">
            <p className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent mb-2">500+</p>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/8 to-accent/8 border border-primary/15">
            <p className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent mb-2">98%</p>
            <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/8 to-accent/8 border border-primary/15">
            <p className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent mb-2">4.9/5</p>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/8 to-accent/8 border border-primary/15">
            <p className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent mb-2">100+</p>
            <p className="text-sm text-muted-foreground">Reviews</p>
          </div>
        </div>
      </div>

      {/* Newsletter Signup Section */}
      <div id="newsletter-section" className="max-w-7xl mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-primary/8 via-primary/5 to-accent/8 border-2 border-primary/25 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/3" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/25 mb-6">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Stay Updated</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Get <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AccuCoder</span> Updates
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest features, coding tips, and industry insights delivered to your inbox.
            </p>
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                alert(`Thanks for subscribing with ${email}!`)
                setEmail('')
              }}
              className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-6 py-4 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:scale-105"
              >
                <Send className="w-5 h-5" />
                Subscribe
              </button>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-2xl font-bold">Share Your Experience</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={reviewForm.email}
                    onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Role *</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.role}
                    onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                    placeholder="e.g., Medical Coder"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Country *</label>
                  <select
                    required
                    value={reviewForm.country}
                    onChange={(e) => setReviewForm({ ...reviewForm, country: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                  >
                    <option value="">Select Country</option>
                    <option value="USA">USA</option>
                    <option value="India">India</option>
                    <option value="UAE">UAE</option>
                    <option value="UK">UK</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location *</label>
                <input
                  type="text"
                  required
                  value={reviewForm.location}
                  onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                  placeholder="e.g., New York, USA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rating *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= reviewForm.rating
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {reviewForm.rating} / 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Review *</label>
                <textarea
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all resize-none"
                  placeholder="Share your experience with AccuCoder..."
                  minLength={20}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 20 characters
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Review
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-secondary transition-all"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Your review will be visible after admin approval. We respect your privacy.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative border-t border-border bg-gradient-to-b from-secondary/20 to-secondary/40">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand & Description */}
            <div>
              <Image 
                src="/images/design-mode/AccuCoder.png" 
                alt="AccuCoder" 
                width={140}
                height={36}
                className="h-9 w-auto mb-4"
              />
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                AI-powered medical coding platform designed to enhance accuracy, efficiency, and compliance for healthcare professionals worldwide.
              </p>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} AccuCoder. All rights reserved.
              </p>
            </div>

            {/* Legal & Compliance */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-foreground">Legal & Compliance</h4>
              <div className="space-y-2.5">
                <a 
                  href="#privacy"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Privacy Policy: We respect your privacy and handle your data securely. We collect only essential information needed for service delivery. Your personal information is never shared with third parties without consent. Contact us for detailed privacy policy.')
                  }}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200"
                >
                  Privacy Policy
                </a>
                <a 
                  href="#terms"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Terms & Conditions: By using AccuCoder, you agree to use the platform responsibly and in compliance with healthcare regulations. All ICD-10 codes are provided for informational purposes. Final coding decisions remain the responsibility of certified medical coders.')
                  }}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200"
                >
                  Terms of Service
                </a>
                <a 
                  href="#disclaimer"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Medical Disclaimer: AccuCoder is an educational and assistive tool. It does not replace professional medical coding expertise or judgment. Always verify codes with official ICD-10-CM guidelines before submission.')
                  }}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200"
                >
                  Medical Disclaimer
                </a>
                <a 
                  href="#cookie"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Cookie Policy: We use essential cookies to ensure platform functionality and improve your experience. No third-party tracking cookies are used without your consent.')
                  }}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200"
                >
                  Cookie Policy
                </a>
              </div>
            </div>

            {/* Contact Information */}
            <div id="contact-section">
              <h4 className="font-semibold text-sm mb-4 text-foreground">Get In Touch</h4>
              <div className="space-y-3">
                <a 
                  href="mailto:accucoder.app@gmail.com" 
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>accucoder.app@gmail.com</span>
                </a>
                <a 
                  href="tel:+918420690958" 
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors text-base">
                    📞
                  </div>
                  <span>+91 8420690958</span>
                </a>
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    Available Monday - Friday<br />
                    9:00 AM - 6:00 PM IST
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground text-center md:text-left">
                Made with ❤️ for healthcare professionals worldwide
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">Certified ICD-10-CM 2026</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Feature Card Component
function FeatureCard({ 
  icon, 
  title, 
  description, 
  onClick
}: { 
  icon: React.ReactNode
  title: string
  description: string
  onClick?: () => void
}) {
  const Component = onClick ? 'button' : 'div'
  
  return (
    <Component
      onClick={onClick}
      className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all duration-500 hover:shadow-lg hover:shadow-primary/8 hover:-translate-y-2 text-left overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/2 to-accent/2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl opacity-0 group-hover:opacity-5 blur transition-opacity duration-500" />
      <div className="relative">
        <div className="inline-flex p-3 rounded-xl bg-primary/8 text-primary mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md group-hover:shadow-primary/20">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-all duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
          {description}
        </p>
        {onClick && (
          <div className="mt-4 flex items-center gap-2 text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Learn more <ArrowRight className="w-4 h-4" />
          </div>
        )}
      </div>
    </Component>
  )
}

// Benefit Card Component
function BenefitCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="group text-center space-y-4 p-6 rounded-2xl hover:bg-card/50 transition-all duration-300 hover:shadow-lg">
      <div className="inline-flex p-4 rounded-full bg-primary/8 text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md group-hover:shadow-primary/20">
        {icon}
      </div>
      <h3 className="text-xl font-semibold group-hover:text-primary transition-all duration-300">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground/80 transition-colors">{description}</p>
    </div>
  )
}

// Stat Card Component
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="group space-y-2 p-8 rounded-2xl hover:bg-gradient-to-br hover:from-primary/3 hover:to-accent/3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-gradient-x group-hover:scale-110 transition-transform duration-300">
        {number}
      </div>
      <div className="text-lg text-muted-foreground group-hover:text-foreground transition-colors font-medium">{label}</div>
    </div>
  )
}

// Team Member Card Component
function TeamMemberCard({ 
  name, 
  role, 
  description 
}: { 
  name: string
  role: string
  description: string
}) {
  return (
    <div className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-primary/30">
        {name.charAt(0)}
      </div>
      <h4 className="text-lg font-semibold mb-1 group-hover:text-primary transition-all">{name}</h4>
      <p className="text-sm text-primary mb-3 font-medium">{role}</p>
      <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">{description}</p>
    </div>
  )
}
