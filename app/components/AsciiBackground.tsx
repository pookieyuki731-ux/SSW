"use client"

import { useEffect, useRef } from 'react'

export function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    
    canvas.width = width
    canvas.height = height

    const characters = '0123456789ABCDEF'
    const fontSize = 16
    let columns = Math.floor(width / fontSize)
    
    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100
    }

    const draw = () => {
      // Semi-transparent black to create fade effect
      ctx.fillStyle = 'rgba(14, 14, 18, 0.05)' 
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = '#4a4a55' // Subtle gray color
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        // Randomly show a lap time in red instead of a character
        if (Math.random() > 0.995) {
            ctx.fillStyle = '#ef4444' // Red highlight
            const seconds = Math.floor(Math.random() * 60).toString().padStart(2, '0')
            const ms = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
            const text = `4:${seconds}:${ms}`
            ctx.fillText(text, i * fontSize, drops[i] * fontSize)
        } else {
            ctx.fillStyle = '#334155' // Slate-700
            const text = characters.charAt(Math.floor(Math.random() * characters.length))
            ctx.fillText(text, i * fontSize, drops[i] * fontSize)
        }

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const intervalId = setInterval(draw, 50)

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      
      columns = Math.floor(width / fontSize)
      drops.length = 0
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-30 mix-blend-screen"
    />
  )
}
