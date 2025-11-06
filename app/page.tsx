'use client'

import { FeatureCard } from '@/components/feature-card'
import { ButtonPrimary } from '@/components/button-primary'
import { useRouter } from 'next/navigation'
import { BookOpen, Search, Pill, Table, MessageSquare, GraduationCap } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-background pb-24 pt-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Welcome to AccuCoder
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Your complete medical coding companion with AI assistance, comprehensive ICD-10-CM data, 
            and powerful learning tools
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <ButtonPrimary onClick={() => router.push('/index')}>
              Browse Alphabetical Index
            </ButtonPrimary>
            <ButtonPrimary onClick={() => router.push('/table/drugs')} variant="outline">
              View Drugs & Chemicals
            </ButtonPrimary>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BookOpen className="w-8 h-8" />}
            title="Alphabetical Index"
            description="7,086+ ICD-10-CM codes with cross-references and external causes"
            onClick={() => router.push('/index')}
          />
          
          <FeatureCard
            icon={<Pill className="w-8 h-8" />}
            title="Drugs & Chemicals"
            description="7,591 substances with poisoning, adverse effects, and underdosing codes"
            onClick={() => router.push('/table/drugs')}
          />
          
          <FeatureCard
            icon={<Table className="w-8 h-8" />}
            title="Tabular List"
            description="Complete ICD-10-CM code hierarchy and descriptions"
            onClick={() => router.push('/tabular')}
          />
          
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="AccuBot AI Assistant"
            description="Get instant help with medical coding questions powered by AI"
            onClick={() => {
              // AccuBot is in floating button, just show a message
              window.dispatchEvent(new CustomEvent('open-accubot'))
            }}
          />
          
          <FeatureCard
            icon={<Search className="w-8 h-8" />}
            title="Smart Search"
            description="Quick search across all codes, terms, and references"
            onClick={() => router.push('/search')}
          />
          
          <FeatureCard
            icon={<GraduationCap className="w-8 h-8" />}
            title="Learning Resources"
            description="Educational materials and coding guidelines"
            onClick={() => router.push('/learning')}
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-secondary/20 border-y border-border py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">7,086</div>
              <div className="text-muted-foreground">Alphabetical Index Entries</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">7,591</div>
              <div className="text-muted-foreground">Drugs & Chemicals</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">AI-Powered</div>
              <div className="text-muted-foreground">AccuBot Assistant</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
