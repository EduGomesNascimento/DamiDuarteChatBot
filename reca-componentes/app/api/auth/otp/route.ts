import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { ok, erro } from '@/lib/api'
import { rateLimit, ipDaRequest } from '@/lib/rate-limit'
import { emailOtp } from '@/lib/resend'
import { otpRequestSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = otpRequestSchema.safeParse(body)
    if (!parsed.success) {
      return erro(parsed.error.errors[0].message, 400)
    }

    const { email } = parsed.data
    const ip = ipDaRequest(req)

    // Rate limit por e-mail: max 3 OTPs/hora
    const rlEmail = await rateLimit(`otp:send:email:${email}`, 3, 3600)
    if (!rlEmail.ok) {
      return erro('Muitas solicitações. Aguarde antes de solicitar um novo código.', 429)
    }

    // Rate limit por IP: max 5 OTPs / 15 min
    const rlIp = await rateLimit(`otp:send:ip:${ip}`, 5, 900)
    if (!rlIp.ok) {
      return erro('Muitas solicitações deste IP. Aguarde alguns minutos.', 429)
    }

    // Gerar código de 6 dígitos
    const codigo = String(Math.floor(100000 + Math.random() * 900000))
    const codigoHash = await bcrypt.hash(codigo, 10)
    const expiraEm = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    // Checar se usuário já existe
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    const existe = !!usuario

    // Persistir OTP
    await prisma.otpCode.create({
      data: {
        email,
        codigoHash,
        expiraEm,
        usuarioId: usuario?.id ?? null,
      },
    })

    // Enviar e-mail (ou logar no console em dev)
    await emailOtp(email, codigo)

    return ok({ enviado: true, existe })
  } catch (e) {
    console.error('[otp] erro:', e)
    return erro('Erro interno ao enviar código', 500)
  }
}
