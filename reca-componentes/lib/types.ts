export interface ProdutoDTO {
  id: string
  nome: string
  slug: string
  sku: string
  descricaoInformal: string
  descricaoTecnica: string
  especificacoes: Record<string, string>
  preco: number
  precoOriginal: number | null
  estoque: number
  imagens: string[]
  datasheetUrl: string | null
  recursosUrls: Record<string, string> | null
  pesoGramas: number | null
  destaque: boolean
  freteGratis: boolean
  categoria: { id: string; nome: string; slug: string; icone: string | null }
  tags: { nome: string; slug: string }[]
}

export interface CategoriaDTO {
  id: string
  nome: string
  slug: string
  icone: string | null
  totalProdutos?: number
}

export interface CartItem {
  produtoId: string
  slug: string
  nome: string
  sku: string
  preco: number
  imagem: string
  quantidade: number
  estoque: number
}
