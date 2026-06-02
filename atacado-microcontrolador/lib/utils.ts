import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function slugify(text: string) {
  return text
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/** Desconto por volume conforme regras do atacado. */
export function descontoPorVolume(qtd: number): number {
  if (qtd >= 20) return 0.15
  if (qtd >= 10) return 0.1
  if (qtd >= 5) return 0.05
  return 0
}

export function precoComDesconto(precoUnit: number, qtd: number): number {
  const desc = descontoPorVolume(qtd)
  return precoUnit * (1 - desc)
}

/** Nível de estoque para indicador visual. */
export type NivelEstoque = 'alto' | 'medio' | 'baixo' | 'esgotado'
export function nivelEstoque(estoque: number): NivelEstoque {
  if (estoque <= 0) return 'esgotado'
  if (estoque < 5) return 'baixo'
  if (estoque <= 20) return 'medio'
  return 'alto'
}

/** Valida CPF com dígitos verificadores. */
export function validarCPF(cpf: string): boolean {
  const c = cpf.replace(/\D/g, '')
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(c[i]) * (10 - i)
  let d1 = (soma * 10) % 11
  if (d1 === 10) d1 = 0
  if (d1 !== parseInt(c[9])) return false
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(c[i]) * (11 - i)
  let d2 = (soma * 10) % 11
  if (d2 === 10) d2 = 0
  return d2 === parseInt(c[10])
}

/** Valida CNPJ com dígitos verificadores. */
export function validarCNPJ(cnpj: string): boolean {
  const c = cnpj.replace(/\D/g, '')
  if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false
  const calc = (len: number) => {
    let soma = 0
    let pos = len - 7
    for (let i = len; i >= 1; i--) {
      soma += parseInt(c[len - i]) * pos--
      if (pos < 2) pos = 9
    }
    const r = soma % 11
    return r < 2 ? 0 : 11 - r
  }
  return calc(12) === parseInt(c[12]) && calc(13) === parseInt(c[13])
}

export function formatCPF(cpf: string) {
  const c = cpf.replace(/\D/g, '').slice(0, 11)
  return c.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
}

export function formatCEP(cep: string) {
  return cep.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d{1,3})/, '$1-$2')
}

export function formatTelefone(tel: string) {
  const t = tel.replace(/\D/g, '').slice(0, 11)
  if (t.length <= 10) return t.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  return t.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

export function gerarNumeroPedido(seq: number) {
  const ano = new Date().getFullYear()
  return `AEN-${ano}-${String(seq).padStart(6, '0')}`
}
