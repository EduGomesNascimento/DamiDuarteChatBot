import { prisma } from '@/lib/prisma'
import { exigirAdmin, erro } from '@/lib/api'

function csvCell(v: unknown) {
  const s = String(v ?? '')
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET() {
  try {
    await exigirAdmin()
  } catch (e) {
    if (e instanceof Response) return e
    return erro('Erro interno', 500)
  }

  const pedidos = await prisma.pedido.findMany({
    include: { usuario: { select: { nomeCompleto: true, email: true } } },
    orderBy: { criadoEm: 'desc' },
  })

  const header = [
    'numero',
    'data',
    'cliente',
    'email',
    'status',
    'subtotal',
    'frete',
    'desconto',
    'total',
    'modalidadeFrete',
    'rastreamento',
  ]

  const linhas = pedidos.map((p) =>
    [
      p.numero,
      p.criadoEm.toISOString(),
      p.usuario.nomeCompleto,
      p.usuario.email,
      p.status,
      Number(p.subtotal).toFixed(2),
      Number(p.frete).toFixed(2),
      Number(p.desconto).toFixed(2),
      Number(p.total).toFixed(2),
      p.modalidadeFrete,
      p.rastreamento ?? '',
    ]
      .map(csvCell)
      .join(',')
  )

  const csv = '﻿' + [header.join(','), ...linhas].join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="pedidos.csv"',
    },
  })
}
