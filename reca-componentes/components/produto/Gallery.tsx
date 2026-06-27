'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface GalleryProps {
  imagens: string[]
  nome: string
}

export function Gallery({ imagens, nome }: GalleryProps) {
  const fallback = 'https://picsum.photos/seed/chip/800/800'
  const imgs = imagens.length > 0 ? imagens : [fallback]
  const [ativa, setAtiva] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      {/* Imagem principal */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface-2 border border-white/5">
        <Image
          src={imgs[ativa]}
          alt={`${nome} — imagem ${ativa + 1}`}
          fill
          sizes="(max-width:768px) 100vw, 50vw"
          className="object-cover transition-all duration-500"
          priority
        />
      </div>

      {/* Miniaturas */}
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setAtiva(i)}
              aria-label={`Ver imagem ${i + 1}`}
              className={cn(
                'relative flex-shrink-0 h-16 w-16 overflow-hidden rounded-xl border-2 transition-all duration-200',
                i === ativa
                  ? 'border-primary shadow-glow'
                  : 'border-white/10 hover:border-primary/50'
              )}
            >
              <Image
                src={img}
                alt={`${nome} miniatura ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
