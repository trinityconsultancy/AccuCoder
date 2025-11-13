'use client'

import { useRouter } from 'next/navigation'
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
  CheckCircle2
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-background pb-24">
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
              <span className="block text-foreground">Medical Coding</span>
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Access 15,000+ ICD-10-CM codes instantly. Get AI-powered assistance. 
              Code faster and more accurately with AccuCoder.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={() => router.push('/index')}
                className="group px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/table/drugs')}
                className="px-8 py-4 bg-background border-2 border-border rounded-lg font-semibold text-lg hover:bg-secondary/50 transition-all flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Explore Database
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>7,086 Index Entries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>7,591 Drug Codes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>AI Assistant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need to Code</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools and comprehensive data to streamline your medical coding workflow
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature Cards */}
          <FeatureCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Alphabetical Index"
            description="Browse 7,086+ ICD-10-CM codes with intelligent cross-references and external causes"
            onClick={() => router.push('/index')}
            gradient="from-blue-500/10 to-cyan-500/10"
          />
          
          <FeatureCard
            icon={<Pill className="w-6 h-6" />}
            title="Drugs & Chemicals"
            description="Complete poisoning table with 7,591 substances and comprehensive coding scenarios"
            onClick={() => router.push('/table/drugs')}
            gradient="from-purple-500/10 to-pink-500/10"
          />
          
          <FeatureCard
            icon={<Table className="w-6 h-6" />}
            title="Tabular List"
            description="Full ICD-10-CM hierarchy with detailed descriptions and code relationships"
            onClick={() => router.push('/tabular')}
            gradient="from-green-500/10 to-emerald-500/10"
          />
          
          <FeatureCard
            icon={<MessageSquare className="w-6 h-6" />}
            title="AI Assistant"
            description="Ask AccuBot anything about medical coding and get instant, accurate answers"
            onClick={() => window.dispatchEvent(new CustomEvent('open-accubot'))}
            gradient="from-orange-500/10 to-red-500/10"
          />
          
          <FeatureCard
            icon={<Search className="w-6 h-6" />}
            title="Smart Search"
            description="Lightning-fast search across codes, terms, substances, and references"
            onClick={() => router.push('/search')}
            gradient="from-violet-500/10 to-purple-500/10"
          />
          
          <FeatureCard
            icon={<GraduationCap className="w-6 h-6" />}
            title="Learning Hub"
            description="Master medical coding with comprehensive guidelines and educational resources"
            onClick={() => router.push('/learning')}
            gradient="from-teal-500/10 to-cyan-500/10"
          />
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-b from-secondary/30 to-background py-24">
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
          <StatCard number="15K+" label="Total Codes" />
          <StatCard number="99.9%" label="Accuracy" />
          <StatCard number="24/7" label="AI Support" />
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 pb-24">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_70%)]" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Code Smarter?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of medical coders using AccuCoder to work faster and more accurately
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
    </div>
  )
}

// Feature Card Component
function FeatureCard({ 
  icon, 
  title, 
  description, 
  onClick, 
  gradient 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
  gradient: string
}) {
  return (
    <button
      onClick={onClick}
      className="group relative p-6 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all duration-300 hover:shadow-lg hover:scale-105 text-left"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="relative">
        <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
        <div className="mt-4 inline-flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Learn more
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
