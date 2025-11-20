"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

export function Header() {
  const [activeLink, setActiveLink] = useState("home")

  const navLinks = [
    { href: "/", label: "Home", id: "home" },
    { href: "/dashboard", label: "Dashboard", id: "dashboard" },
    { href: "/tabular", label: "Tabular List", id: "tabular" },
    { href: "/search", label: "Code Search", id: "search" },
    { href: "/converter", label: "ICD Converter", id: "converter" },
    { href: "/learning", label: "Learning Hub", id: "learning" },
    { href: "/assistant", label: "AI Assistant", id: "assistant" },
    { href: "/cdi", label: "CDI Tools", id: "cdi" },
    { href: "/about", label: "About", id: "about" },
  ]

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-primary"
          >
            MEDINDEX
          </motion.div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => setActiveLink(link.id)}
              className="relative px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {link.label}
              {activeLink === link.id && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-foreground/70 hover:text-foreground">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>
    </header>
  )
}
