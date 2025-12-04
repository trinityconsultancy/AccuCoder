"use client"

import type React from "react"

import { motion } from "framer-motion"
import Link from "next/link"

interface ButtonPrimaryProps {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  variant?: "primary" | "outline"
  className?: string
}

export function ButtonPrimary({ href, onClick, children, variant = "primary", className = "" }: ButtonPrimaryProps) {
  const baseClasses =
    "px-6 py-3 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center"

  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
    outline: "border-2 border-primary text-primary hover:bg-primary/5",
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={classes}
    >
      {children}
    </motion.button>
  )
}
