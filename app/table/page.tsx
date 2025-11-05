'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Table, Pill } from 'lucide-react'

export default function TablePage() {
  const tables = [
    {
      title: 'Drugs and Chemicals',
      description: 'ICD-10-CM Table of Drugs and Chemicals with poisoning codes',
      icon: <Pill className="w-8 h-8" />,
      href: '/table/drugs',
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Neoplasm Table',
      description: 'ICD-10-CM Neoplasm Table with malignant and benign codes',
      icon: <Table className="w-8 h-8" />,
      href: '/table/neoplasm',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-24 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            ICD-10-CM Reference Tables
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access comprehensive reference tables for drugs, chemicals, and neoplasms
          </p>
        </div>

        {/* Table Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tables.map((table, index) => (
            <motion.div
              key={table.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={table.href}
                className="block group"
              >
                <div
                  className={`h-full p-8 rounded-2xl border-2 ${table.borderColor} bg-gradient-to-br ${table.color} hover:shadow-xl transition-all duration-300 hover:scale-105`}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="mb-6 p-4 rounded-full bg-background/50 backdrop-blur-sm group-hover:bg-background/70 transition-colors">
                      {table.icon}
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                      {table.title}
                    </h2>

                    {/* Description */}
                    <p className="text-muted-foreground mb-6">
                      {table.description}
                    </p>

                    {/* CTA */}
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium group-hover:bg-primary/90 transition-colors">
                      View Table
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
