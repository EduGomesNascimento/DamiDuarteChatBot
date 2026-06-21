'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const FRASES = [
  'Todo componente que seu projeto pede.',
  'Do resistor ao ESP32. Tudo aqui.',
  'Sensores, MCUs, ferramentas e solda.',
  'Preço de quem compra direto.',
]

function useTyping(frases: string[]) {
  const [texto, setTexto] = useState(frases[0])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const frase = frases[idx % frases.length]
    let i = 0
    let apagando = false
    let timer: ReturnType<typeof setTimeout>

    function tick() {
      if (!apagando) {
        setTexto(frase.slice(0, i + 1))
        i++
        if (i === frase.length) {
          apagando = true
          timer = setTimeout(tick, 2200)
          return
        }
        timer = setTimeout(tick, 55)
      } else {
        setTexto(frase.slice(0, i - 1))
        i--
        if (i === 0) {
          apagando = false
          setIdx((p) => p + 1)
          return
        }
        timer = setTimeout(tick, 28)
      }
    }
    timer = setTimeout(tick, 200)
    return () => clearTimeout(timer)
  }, [idx, frases])

  return texto
}

function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    let w = (canvas.width = canvas.offsetWidth)
    let h = (canvas.height = canvas.offsetHeight)
    const pts = Array.from({ length: 36 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }))
    function resize() {
      w = canvas!.width = canvas!.offsetWidth
      h = canvas!.height = canvas!.offsetHeight
    }
    window.addEventListener('resize', resize)
    function draw() {
      ctx!.clearRect(0, 0, w, h)
      for (const p of pts) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx!.fillStyle = 'rgba(0,212,255,0.6)'
        ctx!.fill()
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const dist = Math.hypot(dx, dy)
          if (dist < 120) {
            ctx!.beginPath()
            ctx!.moveTo(pts[i].x, pts[i].y)
            ctx!.lineTo(pts[j].x, pts[j].y)
            ctx!.strokeStyle = `rgba(0,212,255,${0.12 * (1 - dist / 120)})`
            ctx!.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-70" />
}

export function Hero() {
  const texto = useTyping(FRASES)
  return (
    <section className="scanlines relative overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 blueprint-grid" />
      <Particles />
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32">
        <span className="badge mb-6 inline-flex border border-primary/30 bg-primary/10 text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
          Frete grátis acima de R$ 299
        </span>
        <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl">
          <span className="text-glow typing-cursor">{texto}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-text-secondary">
          Componentes eletrônicos para quem leva projeto a sério — do estudante ao engenheiro.
          Placas, sensores, passivos, semicondutores, ferramentas e instrumentação. Tudo num lugar só.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/catalogo" className="btn-primary">
            Ver catálogo →
          </Link>
          <Link href="/catalogo?ordenar=novidades" className="btn-ghost">
            Novidades
          </Link>
        </div>
      </div>
    </section>
  )
}
