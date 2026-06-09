import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'
import { ok, erro, exigirAdmin } from '@/lib/api'
import { storageConfigured, uploadToStorage } from '@/lib/storage'

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
 * Com S3/R2 configurado (S3_*), envia ao bucket e devolve a URL pública.
 * Sem isso, salva em /public/uploads como fallback de desenvolvimento.
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
  const nome = `${Date.now()}-${randomBytes(4).toString('hex')}.${ext}`

  // Produção: bucket R2/S3
  if (storageConfigured) {
    try {
      const url = await uploadToStorage(bytes, `produtos/${nome}`, file.type)
      return ok({ url, storage: 's3' })
    } catch (e) {
      console.error('[upload] falha no S3, usando local:', e)
    }
  }

  // Fallback dev: disco local
  const dir = join(process.cwd(), 'public', 'uploads')
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, nome), bytes)
  return ok({ url: `/uploads/${nome}`, storage: 'local' })
}
