import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'
import { ok, erro, exigirAdmin } from '@/lib/api'

export const runtime = 'nodejs'

const TIPOS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

/**
 * Upload de imagem de produto (admin).
 *
 * Sem S3/R2 configurado, salva em /public/uploads e devolve a URL pública.
 * Para produção, troque a gravação local por upload ao bucket (S3_*).
 */
export async function POST(req: NextRequest) {
  try {
    await exigirAdmin()
  } catch (e) {
    if (e instanceof Response) return e
    return erro('Erro interno', 500)
  }

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!file || !(file instanceof File)) return erro('Arquivo ausente', 400)

  const ext = TIPOS[file.type]
  if (!ext) return erro('Formato inválido (use JPG, PNG, WEBP, GIF ou AVIF)', 400)
  if (file.size > 5 * 1024 * 1024) return erro('Imagem acima de 5MB', 400)

  const bytes = Buffer.from(await file.arrayBuffer())
  const dir = join(process.cwd(), 'public', 'uploads')
  await mkdir(dir, { recursive: true })
  const nome = `${Date.now()}-${randomBytes(4).toString('hex')}.${ext}`
  await writeFile(join(dir, nome), bytes)

  return ok({ url: `/uploads/${nome}` })
}
