import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

/**
 * Storage de imagens — Cloudflare R2 / AWS S3.
 *
 * Configurado por variáveis de ambiente. Se ausente, `storageConfigured` é
 * false e o chamador deve cair no armazenamento local (/public/uploads).
 *
 *   S3_ENDPOINT     — ex.: https://<accountid>.r2.cloudflarestorage.com
 *   S3_REGION       — "auto" para R2
 *   S3_ACCESS_KEY   — access key id
 *   S3_SECRET_KEY   — secret access key
 *   S3_BUCKET       — nome do bucket
 *   S3_PUBLIC_URL   — base pública (ex.: https://cdn.recacomponentes.com.br
 *                     ou https://pub-xxxx.r2.dev). Usada para montar a URL final.
 */
export const storageConfigured = Boolean(
  process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY &&
    process.env.S3_SECRET_KEY &&
    process.env.S3_BUCKET
)

let client: S3Client | null = null
function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY as string,
        secretAccessKey: process.env.S3_SECRET_KEY as string,
      },
      forcePathStyle: true,
    })
  }
  return client
}

function publicUrl(key: string): string {
  const base = process.env.S3_PUBLIC_URL?.replace(/\/$/, '')
  if (base) return `${base}/${key}`
  // Fallback: endpoint + bucket (pode exigir bucket público)
  const endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, '')
  return `${endpoint}/${process.env.S3_BUCKET}/${key}`
}

/**
 * Envia um buffer ao bucket e retorna a URL pública.
 * Lança erro se não configurado — o chamador deve checar `storageConfigured`.
 */
export async function uploadToStorage(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  if (!storageConfigured) throw new Error('Storage não configurado')
  await getClient().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )
  return publicUrl(key)
}
