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
                onClick={() => router.push('/login')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signup')}
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
                  router.push('/login')
                }}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  router.push('/signup')
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
                onClick={() => router.push('/signup')}
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Leading Healthcare Organizations Choose AccuCoder</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade platform engineered for accuracy, efficiency, and compliance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard
              icon={<Shield className="w-8 h-8" />}
              title="Regulatory Compliance"
              description="Always current with the latest ICD-10-CM 2026 standards, official coding guidelines, and regulatory requirements"
            />
            <BenefitCard
              icon={<Zap className="w-8 h-8" />}
              title="Enhanced Productivity"
              description="Reduce coding time by up to 40% with intelligent automation, smart suggestions, and streamlined workflows"
            />
            <BenefitCard
              icon={<Sparkles className="w-8 h-8" />}
              title="AI-Driven Intelligence"
              description="Leverage advanced machine learning algorithms for complex scenario resolution and documentation analysis"
            />
            <BenefitCard
              icon={<Clock className="w-8 h-8" />}
              title="Revenue Optimization"
              description="Maximize reimbursement accuracy with pre-submission validation and comprehensive denial prevention"
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

      {/* About Section */}
      <div id="about-section" className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">About AccuCoder</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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

        {/* Team Section */}
        <div className="mb-16">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-12">Meet Our Team</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Founder */}
            <TeamMemberCard
              name="Your Name"
              role="Founder & CEO"
              description="Visionary leader with expertise in healthcare technology and medical coding innovation"
            />
            
            {/* Team Members */}
            <TeamMemberCard
              name="Team Member 1"
              role="Lead Developer"
              description="Full-stack engineer specializing in AI and healthcare applications"
            />
            
            <TeamMemberCard
              name="Team Member 2"
              role="Medical Coding Specialist"
              description="Certified coder with 10+ years experience in clinical documentation"
            />
            
            <TeamMemberCard
              name="Team Member 3"
              role="Product Manager"
              description="Healthcare IT professional focused on user experience and workflow optimization"
            />
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 md:p-12 text-center border border-primary/20">
          <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            To help healthcare organizations optimize their revenue cycle while maintaining the highest standards 
            of compliance and data security. We're building the future of medical coding, one feature at a time.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <Image 
                src="/images/design-mode/AccuCoder.png" 
                alt="AccuCoder" 
                width={140}
                height={36}
                className="h-9 w-auto mb-4"
              />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Precision ICD-10-CM coding powered by artificial intelligence.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button 
                    onClick={() => router.push('/assistant')}
                    className="hover:text-foreground transition-colors"
                  >
                    AI Assistant
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/converter')}
                    className="hover:text-foreground transition-colors"
                  >
                    ICD-9 Converter
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/search')}
                    className="hover:text-foreground transition-colors"
                  >
                    Code Finder
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/learning')}
                    className="hover:text-foreground transition-colors"
                  >
                    Learning Center
                  </button>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button 
                    onClick={() => {
                      const aboutSection = document.getElementById('about-section')
                      aboutSection?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="hover:text-foreground transition-colors"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/about')}
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <button className="hover:text-foreground transition-colors">
                    Careers
                  </button>
                </li>
                <li>
                  <button className="hover:text-foreground transition-colors">
                    Blog
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button className="hover:text-foreground transition-colors">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button className="hover:text-foreground transition-colors">
                    Cookie Policy
                  </button>
                </li>
                <li>
                  <button className="hover:text-foreground transition-colors">
                    HIPAA Compliance
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <div>
                © {new Date().getFullYear()} AccuCoder. All rights reserved.
              </div>
              <div className="flex items-center gap-6">
                <span>Made with ❤️ for Healthcare Professionals</span>
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
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
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
    <div className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-primary">
        {name.charAt(0)}
      </div>
      <h4 className="text-lg font-semibold mb-1">{name}</h4>
      <p className="text-sm text-primary mb-3">{role}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
