"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface LogoProps {
  width?: number
  type?: "logo" | "icon"
  className?: string
}

export function Logo({ width = 120, type = "logo", className = "" }: LogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Evita hidratação inconsistente
  if (!mounted) {
    return (
      <div 
        style={{ width: `${width}px`, height: 'auto' }} 
        className={className}
      />
    )
  }

  const getLogoSrc = () => {
    if (type === "icon") {
      return "/icon.svg"
    }

    // Para type === "logo"
    const currentTheme = resolvedTheme || theme
    return currentTheme === "dark" ? "/erbe-dark.svg" : "/erbe-light.svg"
  }

  return (
    <Image
      src={getLogoSrc()}
      alt="Logo"
      width={width}
      height={0}
      style={{ height: 'auto' }}
      className={className}
      priority
    />
  )
}