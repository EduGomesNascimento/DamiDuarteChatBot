import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const resend = apiKey ? new Resend(apiKey) : null
const from = process.env.EMAIL_FROM || 'noreply@recacomponentes.com.br'
const store = process.env.NEXT_PUBLIC_STORE_NAME || 'RECA Componentes'

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    // Dev: loga em vez de enviar.
    console.log(`\n[email mock] Para: ${to}\nAssunto: ${subject}\n${html}\n`)
    return { mock: true }
  }
  return resend.emails.send({ from, to, subject, html })
}

function wrapper(inner: string) {
  return `
  <div style="background:#0A0E1A;padding:32px;font-family:system-ui,Segoe UI,Arial,sans-serif;color:#F9FAFB">
    <div style="max-width:520px;margin:0 auto;background:#111827;border:1px solid #1f2937;border-radius:16px;overflow:hidden">
      <div style="padding:20px 28px;border-bottom:1px solid #1f2937;font-weight:700;color:#00D4FF;letter-spacing:.5px">
        ${store}
      </div>
      <div style="padding:28px">${inner}</div>
      <div style="padding:16px 28px;border-top:1px solid #1f2937;color:#9CA3AF;font-size:12px">
        ${store} — Portão/RS · Este é um e-mail automático.
      </div>
    </div>
  </div>`
}

export function emailOtp(to: string, codigo: string) {
  const inner = `
    <h2 style="margin:0 0 12px">Seu código de acesso</h2>
    <p style="color:#9CA3AF;margin:0 0 24px">Use o código abaixo para continuar. Ele expira em 10 minutos.</p>
    <div style="font-family:'JetBrains Mono',monospace;font-size:38px;font-weight:700;letter-spacing:10px;color:#00D4FF;background:#0A0E1A;border:1px dashed #00D4FF;border-radius:12px;padding:18px;text-align:center">
      ${codigo}
    </div>
    <p style="color:#9CA3AF;margin:24px 0 0;font-size:13px">Se você não solicitou, ignore este e-mail.</p>`
  return send(to, `${codigo} é o seu código — ${store}`, wrapper(inner))
}

export function emailConfirmacaoPedido(to: string, numero: string, total: string) {
  const inner = `
    <h2 style="margin:0 0 12px">Pedido confirmado! 🎉</h2>
    <p style="color:#9CA3AF">Recebemos seu pedido <b style="color:#F9FAFB">${numero}</b> no valor de <b style="color:#10B981">${total}</b>.</p>
    <p style="color:#9CA3AF">Você receberá um novo e-mail assim que ele for enviado.</p>`
  return send(to, `Pedido ${numero} confirmado — ${store}`, wrapper(inner))
}

export function emailPedidoEnviado(to: string, numero: string, rastreamento: string) {
  const inner = `
    <h2 style="margin:0 0 12px">Seu pedido está a caminho 🚚</h2>
    <p style="color:#9CA3AF">O pedido <b style="color:#F9FAFB">${numero}</b> foi enviado.</p>
    <p style="color:#9CA3AF">Código de rastreamento: <b style="font-family:monospace;color:#00D4FF">${rastreamento}</b></p>`
  return send(to, `Pedido ${numero} enviado — ${store}`, wrapper(inner))
}

export function emailAvisoEstoque(to: string, produto: string, url: string) {
  const inner = `
    <h2 style="margin:0 0 12px">Voltou ao estoque! ⚡</h2>
    <p style="color:#9CA3AF">O produto <b style="color:#F9FAFB">${produto}</b> está disponível novamente.</p>
    <a href="${url}" style="display:inline-block;margin-top:16px;background:#00D4FF;color:#001018;font-weight:700;padding:12px 20px;border-radius:10px;text-decoration:none">Ver produto</a>`
  return send(to, `${produto} voltou ao estoque — ${store}`, wrapper(inner))
}
