import { z } from 'zod'
import { validarCPF, validarCNPJ } from './utils'

export const emailSchema = z.string().trim().toLowerCase().email('E-mail inválido')

export const otpRequestSchema = z.object({
  email: emailSchema,
})

export const otpVerifySchema = z.object({
  email: emailSchema,
  codigo: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'O código deve ter 6 dígitos'),
})

export const cadastroSchema = z.object({
  email: emailSchema,
  nomeCompleto: z.string().trim().min(3, 'Informe seu nome completo'),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine(validarCPF, 'CPF inválido'),
  telefone: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length >= 10 && v.length <= 11, 'Telefone inválido'),
  dataNasc: z.string().refine((v) => !isNaN(Date.parse(v)), 'Data inválida'),
  endereco: z.object({
    apelido: z.string().trim().min(1, 'Informe um apelido').default('Casa'),
    cep: z
      .string()
      .transform((v) => v.replace(/\D/g, ''))
      .refine((v) => v.length === 8, 'CEP inválido'),
    logradouro: z.string().trim().min(1, 'Informe o logradouro'),
    numero: z.string().trim().min(1, 'Informe o número'),
    complemento: z.string().trim().optional().default(''),
    bairro: z.string().trim().min(1, 'Informe o bairro'),
    cidade: z.string().trim().min(1, 'Informe a cidade'),
    estado: z.string().trim().length(2, 'UF inválida'),
  }),
  dadosFiscais: z
    .object({
      tipo: z.enum(['PF', 'PJ']),
      cnpj: z
        .string()
        .transform((v) => v.replace(/\D/g, ''))
        .refine((v) => v === '' || validarCNPJ(v), 'CNPJ inválido')
        .optional(),
      razaoSocial: z.string().trim().optional(),
      ie: z.string().trim().optional(),
    })
    .optional(),
})

export type CadastroInput = z.infer<typeof cadastroSchema>

export const enderecoSchema = z.object({
  apelido: z.string().trim().min(1),
  cep: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 8, 'CEP inválido'),
  logradouro: z.string().trim().min(1),
  numero: z.string().trim().min(1),
  complemento: z.string().trim().optional().default(''),
  bairro: z.string().trim().min(1),
  cidade: z.string().trim().min(1),
  estado: z.string().trim().length(2),
  principal: z.boolean().optional().default(false),
})

export const avisoEstoqueSchema = z.object({
  produtoId: z.string().min(1),
  email: emailSchema,
})

export const produtoSchema = z.object({
  nome: z.string().trim().min(2),
  sku: z.string().trim().min(2),
  descricaoInformal: z.string().trim().min(10),
  descricaoTecnica: z.string().trim().min(2),
  especificacoes: z.record(z.string()),
  preco: z.number().positive(),
  precoOriginal: z.number().positive().optional().nullable(),
  estoque: z.number().int().min(0),
  imagens: z.array(z.string()).default([]),
  datasheetUrl: z.string().optional().nullable(),
  categoriaId: z.string().min(1),
  tags: z.array(z.string()).default([]),
  destaque: z.boolean().optional().default(false),
  ativo: z.boolean().optional().default(true),
  freteGratis: z.boolean().optional().default(false),
})

export const configSchema = z.object({
  nomeLoja: z.string().trim().min(1).optional(),
  freteGratisAtivo: z.boolean().optional(),
  freteGratisMinimo: z.number().min(0).optional(),
  descontoGlobalPct: z.number().min(0).max(90).optional(),
  bannerTexto: z.string().optional().nullable(),
})

export const checkoutSchema = z.object({
  enderecoId: z.string().min(1),
  modalidadeFrete: z.string().min(1),
  freteValor: z.number().min(0),
  cupomCodigo: z.string().optional(),
  itens: z
    .array(
      z.object({
        produtoId: z.string().min(1),
        quantidade: z.number().int().positive(),
      })
    )
    .min(1, 'Carrinho vazio'),
})

export const cupomSchema = z.object({
  codigo: z.string().trim().min(1),
  subtotal: z.number().min(0),
})
