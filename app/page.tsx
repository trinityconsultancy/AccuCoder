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
  Menu
} from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <div className="min-h-screen bg-background">
      {/* Home Page Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Image 
                  src="/images/design-mode/AccuCoder.png" 
                  alt="AccuCoder" 
                  width={140}
                  height={36}
                  className="h-9 w-auto"
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => {
                  const featuresSection = document.getElementById('features-section')
                  featuresSection?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => {
                  const benefitsSection = document.getElementById('benefits-section')
                  benefitsSection?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Benefits
              </button>
              <button
                onClick={() => router.push('/index')}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-4 space-y-3">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false)
                  const featuresSection = document.getElementById('features-section')
                  featuresSection?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false)
                  const benefitsSection = document.getElementById('benefits-section')
                  benefitsSection?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                Benefits
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  router.push('/index')
                }}
                className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI-Powered Medical Coding Platform</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="block text-foreground">Precision ICD-10-CM Coding</span>
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Powered by Intelligence
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Your complete ICD-10-CM coding companion with AI-powered assistance. 
              Code faster and more accurately with intelligent tools.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={() => router.push('/index')}
                className="group px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  const featuresSection = document.getElementById('features-section')
                  featuresSection?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="px-8 py-4 bg-background border-2 border-border rounded-lg font-semibold text-lg hover:bg-secondary/50 transition-all flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
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
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Comprehensive Coding Solutions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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

      {/* Benefits Section */}
      <div id="benefits-section" className="bg-gradient-to-b from-secondary/30 to-background py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose AccuCoder?</h2>
            <p className="text-lg text-muted-foreground">Built for modern medical coders</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard
              icon={<Zap className="w-8 h-8" />}
              title="Lightning Fast"
              description="Instant search and navigation through thousands of codes"
            />
            <BenefitCard
              icon={<Shield className="w-8 h-8" />}
              title="Always Accurate"
              description="Up-to-date ICD-10-CM 2026 codes and guidelines"
            />
            <BenefitCard
              icon={<Sparkles className="w-8 h-8" />}
              title="AI-Powered"
              description="Smart assistant to help with complex coding scenarios"
            />
            <BenefitCard
              icon={<Clock className="w-8 h-8" />}
              title="Save Time"
              description="Code faster with intuitive interface and smart features"
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <StatCard number="ICD-10" label="Latest Standards" />
          <StatCard number="2026" label="Code Version" />
          <StatCard number="24/7" label="AI Support" />
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-24">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_70%)]" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Code Smarter?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join medical coders using AccuCoder to work faster and more accurately
            </p>
            <button
              onClick={() => router.push('/index')}
              className="group px-8 py-4 bg-white text-primary rounded-lg font-semibold text-lg hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2"
            >
              Start Coding Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image 
                src="/images/design-mode/AccuCoder.png" 
                alt="AccuCoder" 
                width={120}
                height={30}
                className="h-8 w-auto"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 AccuCoder. All rights reserved.
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
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group relative p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 text-left"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {description}
        </p>
        <div className="inline-flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Explore
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </button>
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
    <div className="text-center space-y-4">
      <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}

// Stat Card Component
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="space-y-2">
      <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        {number}
      </div>
      <div className="text-lg text-muted-foreground">{label}</div>
    </div>
  )
}
