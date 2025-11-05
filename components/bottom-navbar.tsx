"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, ArrowRightLeft, FileSearch, Stethoscope, ShieldAlert, Table } from "lucide-react"

export function BottomNavbar() {
  const navItems = [
    { href: "/search", label: "Combination finder", icon: <FileSearch className="w-5 h-5" /> },
    { href: "/converter", label: "ICD Converter", icon: <ArrowRightLeft className="w-5 h-5" /> },
    { href: "/cdi", label: "Chart Decoder", icon: <Stethoscope className="w-5 h-5" /> },
    { href: "/about", label: "Denial Analyzer", icon: <ShieldAlert className="w-5 h-5" /> },
    { href: "/learning", label: "Learning Hub", icon: <BookOpen className="w-5 h-5" /> },
  ]

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-10">
        <div className="flex items-center justify-center gap-5 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-2.5 py-2 text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
            >
              <div className="flex-shrink-0">{item.icon}</div>
              <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  )
}
