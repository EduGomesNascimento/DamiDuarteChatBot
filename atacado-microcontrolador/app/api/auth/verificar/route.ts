import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { ok, erro } from '@/lib/api'
import { rateLimit, ipDaRequest } from '@/lib/rate-limit'
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  randomToken,
  setAuthCookies,
  TOKEN_TTL,
} from '@/lib/auth'
import { redis } from '@/lib/redis'
import { otpVerifySchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = otpVerifySchema.safeParse(body)
    if (!parsed.success) {
      return erro(parsed.error.errors[0].message, 400)
    }

    const { email, codigo } = parsed.data
    const ip = ipDaRequest(req)

    // Rate limit verificação por IP: 5 tentativas / 15 min
    const rl = await rateLimit(`otp:verify:ip:${ip}`, 5, 900)
    if (!rl.ok) {
      return erro('Muitas tentativas. Aguarde antes de tentar novamente.', 429)
    }

    // Buscar OTP mais recente não usado e não expirado
    const otp = await prisma.otpCode.findFirst({
      where: {
        email,
        usado: false,
        expiraEm: { gt: new Date() },
      },
      orderBy: { criadoEm: 'desc' },
    })

    if (!otp) {
      return erro('Código inválido ou expirado. Solicite um novo.', 400)
    }

    // Incrementar tentativas
    const tentativasAtualizadas = otp.tentativas + 1
    if (tentativasAtualizadas > 3) {
      await prisma.otpCode.update({
        where: { id: otp.id },
        data: { usado: true },
      })
      return erro('Código expirado, solicite outro', 400)
    }

    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { tentativas: tentativasAtualizadas },
    })

    // Verificar código
    const valido = await bcrypt.compare(codigo, otp.codigoHash)
    if (!valido) {
      return erro('Código incorreto', 400)
    }

    // Marcar como usado
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { usado: true },
    })

    // Checar se usuário existe
    const usuario = await prisma.usuario.findUnique({ where: { email } })

    if (usuario) {
      // Usuário existente — emitir tokens e autenticar
      const payload = { sub: usuario.id, email: usuario.email, role: usuario.role }
      const access = await signAccessToken(payload)
      const refresh = await signRefreshToken(payload)
      const ua = req.headers.get('user-agent') ?? undefined

      await prisma.sessao.create({
        data: {
          usuarioId: usuario.id,
          refreshToken: hashToken(refresh),
          expiraEm: new Date(Date.now() + TOKEN_TTL.REFRESH_TTL * 1000),
          userAgent: ua,
          ip,
        },
      })

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { emailVerificado: true },
      })

      await setAuthCookies(access, refresh)

      return ok({ autenticado: true, cadastroCompleto: true, role: usuario.role })
    } else {
      // Usuário não existe — marcar e-mail como verificado no redis para cadastro
      await redis.set(`otp:verified:${email}`, '1', 'EX', 900)
      return ok({ autenticado: false, cadastroCompleto: false, email })
    }
  } catch (e) {
    console.error('[verificar] erro:', e)
    return erro('Erro interno', 500)
  }
}
