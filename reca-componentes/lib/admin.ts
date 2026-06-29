/**
 * Controle de quem é ADMIN.
 *
 * Apenas os e-mails listados em ADMIN_EMAILS (separados por vírgula) podem
 * administrar a loja (editar produtos, etc.). Qualquer outro login vira CLIENTE.
 * O papel é (re)aplicado a cada login (e-mail/OTP ou Google), então mesmo que
 * um usuário antigo tivesse role ADMIN, ele é rebaixado se sair da lista.
 */
const PADRAO_ADMIN = 'egnportao@gmail.com'

export function listaAdmins(): string[] {
  return (process.env.ADMIN_EMAILS || PADRAO_ADMIN)
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string): boolean {
  return listaAdmins().includes((email || '').trim().toLowerCase())
}

export function roleForEmail(email: string): 'ADMIN' | 'CLIENTE' {
  return isAdminEmail(email) ? 'ADMIN' : 'CLIENTE'
}
