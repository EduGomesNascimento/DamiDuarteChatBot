'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { BuyBox } from '@/components/produto/BuyBox'
import type { ProdutoDTO } from '@/lib/types'

interface Props {
  produto: ProdutoDTO
}

const TABS = [
  { id: 'descricao', label: 'O que é isso?' },
  { id: 'especificacoes', label: 'Especificações' },
  { id: 'downloads', label: 'Downloads & Recursos' },
  { id: 'comprar', label: 'Comprar' },
]

// Map tag slugs/nomes to emojis for characteristic badges
const TAG_EMOJIS: Record<string, string> = {
  wifi: '📡',
  'wi-fi': '📡',
  bluetooth: '🔵',
  bt: '🔵',
  'ble': '🔵',
  lora: '📻',
  zigbee: '🕸️',
  '5g': '📶',
  '4g': '📶',
  lte: '📶',
  gps: '🛰️',
  usb: '🔌',
  'usb-c': '🔌',
  'dual-core': '🧠',
  'single-core': '🧠',
  fpga: '⚡',
  fpu: '🧮',
  arm: '💪',
  risc: '⚡',
  rtos: '⏱️',
  ai: '🤖',
  ml: '🤖',
  camera: '📷',
  display: '🖥️',
  touch: '👆',
  adc: '📊',
  dac: '🎵',
  pwm: '〰️',
  i2c: '🔗',
  spi: '🔗',
  uart: '🔗',
  can: '🚗',
  ethernet: '🌐',
  sdcard: '💾',
  flash: '💾',
  battery: '🔋',
  solar: '☀️',
  lowpower: '⚡',
  'low-power': '⚡',
  '3.3v': '🔋',
  '5v': '🔋',
  arduino: '🔧',
  micropython: '🐍',
  espidf: '🔥',
  rust: '🦀',
}

function tagToEmoji(nome: string, slug: string): string {
  const key = slug.toLowerCase().replace(/-/g, '')
  const keySlug = slug.toLowerCase()
  const keyNome = nome.toLowerCase()
  return (
    TAG_EMOJIS[keySlug] ??
    TAG_EMOJIS[key] ??
    TAG_EMOJIS[keyNome] ??
    ''
  )
}

// Derive compatible IDEs from tags and category
function deriveCompatibilidade(produto: ProdutoDTO): string[] {
  const compat: string[] = ['Arduino IDE', 'PlatformIO']
  const tagSlugs = produto.tags.map((t) => t.slug.toLowerCase())
  const tagNomes = produto.tags.map((t) => t.nome.toLowerCase())
  const catSlug = produto.categoria.slug.toLowerCase()

  if (tagSlugs.some((s) => s.includes('esp') || s.includes('espidf')) || tagNomes.some((n) => n.includes('esp'))) {
    compat.push('ESP-IDF')
  }
  if (tagSlugs.some((s) => s.includes('stm')) || catSlug.includes('stm') || produto.nome.toLowerCase().includes('stm')) {
    compat.push('STM32CubeIDE')
  }
  if (tagSlugs.some((s) => s.includes('micropython') || s.includes('python'))) {
    compat.push('Thonny (MicroPython)')
  }
  if (tagSlugs.some((s) => s.includes('rust'))) {
    compat.push('Rust (cargo-embed)')
  }
  return compat
}

// Download icon by resource key
function resourceIcon(key: string): string {
  if (key.toLowerCase().includes('datasheet')) return '📄'
  if (key.toLowerCase().includes('schema') || key.toLowerCase().includes('esquema')) return '🗺️'
  if (key.toLowerCase().includes('github') || key.toLowerCase().includes('repo')) return '🐙'
  if (key.toLowerCase().includes('manual') || key.toLowerCase().includes('reference')) return '📚'
  if (key.toLowerCase().includes('pinout') || key.toLowerCase().includes('pino')) return '📌'
  if (key.toLowerCase().includes('video') || key.toLowerCase().includes('video')) return '▶️'
  return '📎'
}

function resourceLabel(key: string): string {
  const map: Record<string, string> = {
    datasheet: 'Datasheet',
    referenceManual: 'Manual de Referência',
    schematic: 'Esquemático',
    github: 'Repositório GitHub',
    repo: 'Repositório',
    pinout: 'Diagrama de Pinout',
    examples: 'Exemplos de Código',
    library: 'Biblioteca',
    firmware: 'Firmware',
  }
  return map[key] ?? key.replace(/([A-Z])/g, ' $1').trim()
}

export function ProductTabs({ produto }: Props) {
  const [abaAtiva, setAbaAtiva] = useState<string>('descricao')

  const paragrafos = produto.descricaoInformal
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const especificacoes = Object.entries(produto.especificacoes)
  const compatibilidade = deriveCompatibilidade(produto)

  return (
    <div className="flex flex-col h-full">
      {/* Tab buttons */}
      <div className="flex border-b border-white/5 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAbaAtiva(tab.id)}
            className={cn(
              'relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0',
              abaAtiva === tab.id
                ? 'text-primary'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {tab.label}
            {/* Animated underline */}
            <span
              className={cn(
                'absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full transition-all duration-300',
                abaAtiva === tab.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
              )}
            />
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1">
        {/* TAB 1: O que é isso? */}
        {abaAtiva === 'descricao' && (
          <div className="space-y-6 animate-fade-up">
            {/* Characteristic badges */}
            {produto.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {produto.tags.map((tag) => {
                  const emoji = tagToEmoji(tag.nome, tag.slug)
                  return (
                    <span
                      key={tag.slug}
                      className="badge bg-primary/10 text-primary border border-primary/20"
                    >
                      {emoji && <span>{emoji}</span>}
                      {tag.nome}
                    </span>
                  )
                })}
              </div>
            )}

            {/* Fake star rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400 text-sm">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
              <span className="text-sm font-mono text-text-secondary">
                4.8 · {Math.floor(Math.random() * 200) + 50 + produto.id.charCodeAt(0)} avaliações
              </span>
            </div>

            {/* Paragraphs */}
            <div className="space-y-4">
              {paragrafos.map((p, i) => (
                <p key={i} className="text-text-secondary leading-relaxed text-sm">
                  {p}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Especificações */}
        {abaAtiva === 'especificacoes' && (
          <div className="space-y-6 animate-fade-up">
            {especificacoes.length > 0 ? (
              <div className="rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full font-mono text-sm">
                  <tbody>
                    {especificacoes.map(([k, v], i) => (
                      <tr
                        key={k}
                        className={cn(
                          'border-b border-white/5 last:border-0',
                          i % 2 === 0 ? 'bg-surface-2/50' : 'bg-surface/50'
                        )}
                      >
                        <td className="px-4 py-2.5 text-text-secondary w-2/5 break-words">{k}</td>
                        <td className="px-4 py-2.5 text-text-primary font-medium">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-text-secondary text-sm font-mono">
                Especificações técnicas não disponíveis para este produto.
              </p>
            )}

            {/* Compatibilidade */}
            <div>
              <h3 className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-3">
                Compatível com:
              </h3>
              <div className="flex flex-wrap gap-2">
                {compatibilidade.map((ide) => (
                  <span
                    key={ide}
                    className="badge bg-surface-2 border border-white/10 text-text-secondary"
                  >
                    {ide}
                  </span>
                ))}
              </div>
            </div>

            {/* Pinout placeholder */}
            <div className="rounded-xl border border-white/10 border-dashed bg-surface-2/50 p-6 text-center">
              <div className="text-4xl mb-3">📌</div>
              <p className="font-display text-sm font-semibold text-text-primary mb-1">
                Diagrama de Pinout
              </p>
              <p className="text-xs text-text-secondary font-mono">
                Diagrama detalhado disponível na aba Downloads &amp; Recursos
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: Downloads & Recursos */}
        {abaAtiva === 'downloads' && (
          <div className="space-y-6 animate-fade-up">
            <div className="space-y-2">
              {/* Datasheet */}
              {produto.datasheetUrl && (
                <a
                  href={produto.datasheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface-2 px-4 py-3 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <span className="text-xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                      Datasheet
                    </p>
                    <p className="text-xs font-mono text-text-secondary truncate">
                      {produto.datasheetUrl}
                    </p>
                  </div>
                  <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                </a>
              )}

              {/* Outros recursos */}
              {produto.recursosUrls &&
                Object.entries(produto.recursosUrls)
                  .filter(([, url]) => !!url)
                  .map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface-2 px-4 py-3 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                    >
                      <span className="text-xl">{resourceIcon(key)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                          {resourceLabel(key)}
                        </p>
                        <p className="text-xs font-mono text-text-secondary truncate">{url}</p>
                      </div>
                      <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                    </a>
                  ))}

              {!produto.datasheetUrl && (!produto.recursosUrls || Object.keys(produto.recursosUrls).length === 0) && (
                <p className="text-text-secondary text-sm font-mono py-2">
                  Nenhum arquivo disponível para download.
                </p>
              )}
            </div>

            {/* Comunidades */}
            <div>
              <h3 className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-3">
                Comunidades &amp; Fóruns
              </h3>
              <div className="space-y-2">
                {[
                  {
                    nome: 'Arduino Forum',
                    url: 'https://forum.arduino.cc',
                    desc: 'Fórum oficial da comunidade Arduino',
                    emoji: '🔧',
                  },
                  {
                    nome: 'ESP32 Forum',
                    url: 'https://www.esp32.com',
                    desc: 'Comunidade oficial de desenvolvedores ESP32',
                    emoji: '🔥',
                  },
                  {
                    nome: 'ST Community',
                    url: 'https://community.st.com',
                    desc: 'Comunidade STMicroelectronics',
                    emoji: '💡',
                  },
                ].map((f) => (
                  <a
                    key={f.nome}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface-2 px-4 py-3 hover:border-secondary/40 hover:bg-secondary/5 transition-all group"
                  >
                    <span className="text-xl">{f.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary group-hover:text-secondary transition-colors">
                        {f.nome}
                      </p>
                      <p className="text-xs text-text-secondary">{f.desc}</p>
                    </div>
                    <span className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                  </a>
                ))}

                {/* YouTube search link */}
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(produto.nome + ' tutorial')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface-2 px-4 py-3 hover:border-danger/40 hover:bg-danger/5 transition-all group"
                >
                  <span className="text-xl">▶️</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-primary group-hover:text-danger transition-colors">
                      Vídeos no YouTube
                    </p>
                    <p className="text-xs text-text-secondary">
                      Tutoriais sobre {produto.nome}
                    </p>
                  </div>
                  <span className="text-danger opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Comprar */}
        {abaAtiva === 'comprar' && (
          <div className="animate-fade-up">
            <BuyBox produto={produto} />
          </div>
        )}
      </div>
    </div>
  )
}
