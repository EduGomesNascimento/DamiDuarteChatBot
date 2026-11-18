import type { Product, Category } from '@/types';

// Images served from /public/images/
// Run `npm run setup-images` to copy from the source folders
const SF = '/images/sem-fundo'; // catalog images (transparent bg)
const FD = '/images/fundo';     // lifestyle / banner images

export const PRODUCTS: Product[] = [
  {
    id: 1, slug: 'afac-full-tang-aco-carbono',
    name: 'AFAC Full Tang Aço Carbono', shortName: 'Full Tang Aço Carbono',
    category: 'facas', categoryName: 'Facas',
    badge: 'Mais Vendido', badgeType: 'red',
    price: 249.90, originalPrice: 299.90,
    rating: 4.9, reviews: 47, installments: 10, stock: 8, sku: 'CJ-001',
    image: `${SF}/AFAC FULL TANG AÇO CARBONO.png`,
    imageFundo: `${FD}/AFAC FULL TANG AÇO CARBONO.jpeg`,
    images: [`${SF}/AFAC FULL TANG AÇO CARBONO.png`, `${FD}/AFAC FULL TANG AÇO CARBONO.jpeg`],
    description: 'Faca artesanal Full Tang em aço carbono de alta qualidade. Construção robusta e durável, ideal para uso intenso no campo e churrasco.',
    features: ['Lâmina em aço carbono 1075', 'Construção Full Tang', 'Fio de alta dureza (58-60 HRC)', 'Acabamento artesanal premium', 'Bainha de couro inclusa'],
    specs: { Comprimento: '28 cm', Lâmina: '16 cm', Peso: '320 g', Aço: 'Carbono 1075' },
    tags: ['artesanal', 'carbono', 'full tang', 'campo'], featured: true,
  },
  {
    id: 2, slug: 'akatan-aco-carbono',
    name: 'Akatan Aço Carbono Premium', shortName: 'Akatan Aço Carbono',
    category: 'facas', categoryName: 'Facas',
    badge: 'Novo', badgeType: 'gold',
    price: 199.90, originalPrice: 249.90,
    rating: 4.7, reviews: 28, installments: 10, stock: 15, sku: 'CJ-002',
    image: `${SF}/AKATAN DE AÇO CARBONO.png`,
    imageFundo: `${FD}/AKATAN DE AÇO CARBONO.jpeg`,
    images: [`${SF}/AKATAN DE AÇO CARBONO.png`, `${FD}/AKATAN DE AÇO CARBONO.jpeg`],
    description: 'A Akatan é uma faca de design único com lâmina em aço carbono temperado. Perfeita para quem busca uma peça de coleção com alto desempenho.',
    features: ['Lâmina em aço carbono temperado', 'Design exclusivo Akatan', 'Cabo trabalhado à mão', 'Excelente equilíbrio', 'Certificado de autenticidade'],
    specs: { Comprimento: '25 cm', Lâmina: '13 cm', Peso: '280 g', Aço: 'Carbono 1060' },
    tags: ['artesanal', 'carbono', 'coleção'], featured: true,
  },
  {
    id: 3, slug: 'faca-bowie-artesanal',
    name: 'Faca Bowie Artesanal', shortName: 'Faca Bowie',
    category: 'facas', categoryName: 'Facas',
    badge: undefined, badgeType: undefined,
    price: 229.90, originalPrice: 279.90,
    rating: 4.8, reviews: 35, installments: 10, stock: 12, sku: 'CJ-003',
    image: `${SF}/FACA BOWIE.png`,
    imageFundo: `${FD}/FACA BOWIE.jpeg`,
    images: [`${SF}/FACA BOWIE.png`, `${FD}/FACA BOWIE.jpeg`],
    description: 'Clássica faca Bowie com lâmina longa e robusta. Inspirada nas tradicionais facas do faroeste americano, com materiais modernos e acabamento artesanal.',
    features: ['Lâmina longa em aço inox', 'Formato Bowie clássico', 'Cabo de madeira nobre', 'Guard em aço inox', 'Bainha de couro costurada à mão'],
    specs: { Comprimento: '33 cm', Lâmina: '20 cm', Peso: '380 g', Aço: 'Inox 420' },
    tags: ['bowie', 'clássico', 'coleção'], featured: true,
  },
  {
    id: 4, slug: 'faca-cabo-municao',
    name: 'Faca Cabo Munição Artesanal', shortName: 'Faca Cabo Munição',
    category: 'facas', categoryName: 'Facas',
    badge: 'Edição Limitada', badgeType: 'dark',
    price: 169.90, originalPrice: 199.90,
    rating: 4.6, reviews: 22, installments: 8, stock: 5, sku: 'CJ-004',
    image: `${SF}/FACA CABO MUNIÇÃO.png`,
    imageFundo: `${FD}/FACA CABO MUNIÇÃO.jpeg`,
    images: [`${SF}/FACA CABO MUNIÇÃO.png`, `${FD}/FACA CABO MUNIÇÃO.jpeg`],
    description: 'Faca exclusiva com cabo produzido a partir de munição real. Uma peça de arte funcional, perfeita para colecionadores e entusiastas.',
    features: ['Cabo de munição artesanal', 'Lâmina em aço inox', 'Edição limitada', 'Peça numerada', 'Estojo de couro incluso'],
    specs: { Comprimento: '22 cm', Lâmina: '12 cm', Peso: '240 g', Aço: 'Inox 440' },
    tags: ['edição limitada', 'munição', 'coleção'], featured: false,
  },
  {
    id: 5, slug: 'faca-inox-cabo-misto-resina',
    name: 'Faca Inox Cabo Misto de Resina', shortName: 'Faca Cabo Misto Resina',
    category: 'facas', categoryName: 'Facas',
    badge: undefined, badgeType: undefined,
    price: 189.90, originalPrice: 229.90,
    rating: 4.7, reviews: 19, installments: 8, stock: 20, sku: 'CJ-005',
    image: `${SF}/FACA DE INOX CABO MISTO DE RESINA.png`,
    imageFundo: `${FD}/FACA DE INOX CABO MISTO DE RESINA.jpeg`,
    images: [`${SF}/FACA DE INOX CABO MISTO DE RESINA.png`, `${FD}/FACA DE INOX CABO MISTO DE RESINA.jpeg`],
    description: 'Faca com lâmina em inox e cabo misto produzido com resina colorida e materiais naturais. Visual exclusivo e durabilidade garantida.',
    features: ['Lâmina em inox polido', 'Cabo misto resina + materiais naturais', 'Alta durabilidade', 'Fácil manutenção', 'Ótimo custo-benefício'],
    specs: { Comprimento: '24 cm', Lâmina: '13 cm', Peso: '260 g', Aço: 'Inox 420' },
    tags: ['inox', 'resina', 'custo-benefício'], featured: false,
  },
  {
    id: 6, slug: 'faca-inox-dorso-chifre-osso',
    name: 'Faca Inox Dorso Cabo Chifre/Osso', shortName: 'Faca Chifre ou Osso',
    category: 'facas', categoryName: 'Facas',
    badge: 'Artesanal', badgeType: 'gold',
    price: 279.90, originalPrice: 319.90,
    rating: 4.9, reviews: 41, installments: 12, stock: 7, sku: 'CJ-006',
    image: `${SF}/FACA DE INOX DE DORSO CABO DE CHIFRE OU OSSO.png`,
    imageFundo: `${FD}/FACA DE INOX DE DORSO CABO DE CHIFRE OU OSSO.jpeg`,
    images: [`${SF}/FACA DE INOX DE DORSO CABO DE CHIFRE OU OSSO.png`, `${FD}/FACA DE INOX DE DORSO CABO DE CHIFRE OU OSSO.jpeg`],
    description: 'Faca artesanal com dorso em inox e cabo natural em chifre ou osso. Cada peça é única, os materiais naturais garantem variações únicas.',
    features: ['Lâmina em inox com dorso espesso', 'Cabo em chifre ou osso natural', 'Cada peça é única', 'Acabamento artesanal premium', 'Bainha de couro artesanal'],
    specs: { Comprimento: '27 cm', Lâmina: '15 cm', Peso: '310 g', Aço: 'Inox 420HC' },
    tags: ['artesanal', 'chifre', 'osso', 'natural'], featured: true,
  },
  {
    id: 7, slug: 'faca-full-tang-9-polegadas',
    name: 'Faca Full Tang 9 Polegadas Inox', shortName: 'Full Tang 9 Pol.',
    category: 'facas', categoryName: 'Facas',
    badge: 'Premium', badgeType: 'red',
    price: 349.90, originalPrice: 389.90,
    rating: 5.0, reviews: 63, installments: 12, stock: 10, sku: 'CJ-007',
    image: `${SF}/FACA DE INOX FULL TANG 9 POLEGADAS.png`,
    imageFundo: `${FD}/FACA DE INOX FULL TANG.jpeg`,
    images: [`${SF}/FACA DE INOX FULL TANG 9 POLEGADAS.png`, `${FD}/FACA DE INOX FULL TANG.jpeg`],
    description: 'Faca Full Tang de 9 polegadas em inox de alta resistência. Construção robusta ideal para churrasco, campo e uso profissional.',
    features: ['Lâmina de 9 polegadas em inox', 'Construção Full Tang completa', 'Acabamento espelhado', 'Cabo rebitado', 'Alta resistência à corrosão'],
    specs: { Comprimento: '35 cm', Lâmina: '22 cm', Peso: '420 g', Aço: 'Inox 440C' },
    tags: ['premium', 'full tang', 'profissional', 'churrasco'], featured: true,
  },
  {
    id: 8, slug: 'faca-fosfatada-militar',
    name: 'Faca Fosfatada Estilo Militar', shortName: 'Faca Fosfatada',
    category: 'facas', categoryName: 'Facas',
    badge: 'Mais Vendido', badgeType: 'red',
    price: 179.90, originalPrice: 219.90,
    rating: 4.8, reviews: 52, installments: 8, stock: 30, sku: 'CJ-009',
    image: `${SF}/FACA FOSFATADA.png`,
    imageFundo: `${FD}/FACA FOSFATADA.jpeg`,
    images: [`${SF}/FACA FOSFATADA.png`, `${FD}/FACA FOSFATADA.jpeg`],
    description: 'Faca com tratamento fosfatado estilo militar. O acabamento fosfatado confere proteção extra contra corrosão e um visual tático robusto.',
    features: ['Tratamento fosfatado industrial', 'Proteção superior contra corrosão', 'Visual tático militar', 'Lâmina de alta dureza', 'Cabo grip antiderrapante'],
    specs: { Comprimento: '28 cm', Lâmina: '16 cm', Peso: '350 g', Aço: 'Carbono tratado' },
    tags: ['fosfatada', 'militar', 'tático'], featured: false,
  },
  {
    id: 9, slug: 'faca-picanheira-inox',
    name: 'Faca Picanheira de Inox', shortName: 'Faca Picanheira',
    category: 'facas', categoryName: 'Facas',
    badge: 'Mais Vendido', badgeType: 'red',
    price: 139.90, originalPrice: 179.90,
    rating: 4.9, reviews: 78, installments: 6, stock: 40, sku: 'CJ-012',
    image: `${SF}/FACA PICANHEIRA DE INOX.png`,
    imageFundo: `${FD}/FACA PICANHEIRA DE INOX.jpeg`,
    images: [`${SF}/FACA PICANHEIRA DE INOX.png`, `${FD}/FACA PICANHEIRA DE INOX.jpeg`],
    description: 'Faca picanheira em inox, o clássico do churrasco brasileiro! Lâmina larga e resistente, ideal para cortar picanha e carnes suculentas.',
    features: ['Lâmina larga para picanha', 'Inox de alta qualidade', 'Fio excepcional', 'Cabo ergonômico', 'Lavável na máquina de lavar louça'],
    specs: { Comprimento: '30 cm', Lâmina: '17 cm', Peso: '310 g', Aço: 'Inox 420' },
    tags: ['picanheira', 'churrasco', 'clássico'], featured: true,
  },
  {
    id: 10, slug: 'facao-kukri-aco-carbono',
    name: 'Facão Kukri Aço Carbono', shortName: 'Facão Kukri',
    category: 'facas', categoryName: 'Facas',
    badge: 'Edição Limitada', badgeType: 'dark',
    price: 379.90, originalPrice: 449.90,
    rating: 4.9, reviews: 33, installments: 12, stock: 6, sku: 'CJ-013',
    image: `${SF}/FACÃO KUKRI AÇO CARBONO.png`,
    imageFundo: `${FD}/FACÃO KUKRI AÇO CARBONO.jpeg`,
    images: [`${SF}/FACÃO KUKRI AÇO CARBONO.png`, `${FD}/FACÃO KUKRI AÇO CARBONO.jpeg`],
    description: 'Facão Kukri em aço carbono, inspirado na famosa faca dos guerreiros Gurkha do Nepal. Lâmina curva com alto poder de corte.',
    features: ['Lâmina curva estilo Kukri', 'Aço carbono de alta dureza', 'Corte poderoso', 'Cabo com guard de proteção', 'Bainha de couro reforçada'],
    specs: { Comprimento: '42 cm', Lâmina: '28 cm', Peso: '580 g', Aço: 'Carbono 1075' },
    tags: ['kukri', 'facão', 'carbono', 'coleção'], featured: true,
  },
  {
    id: 11, slug: 'kit-triplo-forjado-10-polegadas',
    name: 'Kit Triplo Forjado 10 Polegadas', shortName: 'Kit Triplo Forjado',
    category: 'kits', categoryName: 'Kits',
    badge: 'Kit Premium', badgeType: 'gold',
    price: 699.90, originalPrice: 799.90,
    rating: 5.0, reviews: 29, installments: 12, stock: 8, sku: 'CJ-014',
    image: `${SF}/KIT TRIPLO FORJADO 10 POLEGADAS.png`,
    imageFundo: `${FD}/KIT TRIPLO FORJADO 10 POLEGADAS.jpeg`,
    images: [`${SF}/KIT TRIPLO FORJADO 10 POLEGADAS.png`, `${FD}/KIT TRIPLO FORJADO 10 POLEGADAS.jpeg`],
    description: 'Kit completo com três facas forjadas de 10 polegadas. Perfeito presente para o churrasqueiro exigente. Inclui estojo presenteável.',
    features: ['3 facas forjadas de 10 polegadas', 'Lâminas de aço inox', 'Cabos resinados premium', 'Estojo presenteável incluso', 'Garantia de 1 ano'],
    specs: { Comprimento: '38 cm cada', Lâmina: '25 cm', Peso: '1,2 kg', Aço: 'Inox forjado' },
    tags: ['kit', 'forjado', 'presente', 'churrasco'], featured: true,
  },
  {
    id: 12, slug: 'chaira-profissional',
    name: 'Chaira Profissional de Afiar', shortName: 'Chaira Profissional',
    category: 'acessorios', categoryName: 'Acessórios',
    badge: 'Promoção', badgeType: 'red',
    price: 59.90, originalPrice: 79.90,
    rating: 4.8, reviews: 61, installments: 3, stock: 45, sku: 'CJ-017',
    image: `${SF}/CHAIRA.png`,
    imageFundo: `${FD}/CHAIRA.jpeg`,
    images: [`${SF}/CHAIRA.png`, `${FD}/CHAIRA.jpeg`],
    description: 'Chaira profissional para afiar e manter o fio das suas facas. Ideal para uso doméstico e profissional.',
    features: ['Aço cromo-vanádio', 'Handle ergonômico com guard', 'Superfície texturizada', 'Alta eficiência de afiar', 'Inclui case de proteção'],
    specs: { Comprimento: '30 cm', Lâmina: '20 cm', Peso: '180 g', Material: 'Cromo-Vanádio' },
    tags: ['chaira', 'afiar', 'manutenção', 'acessório'], featured: false,
  },
  {
    id: 13, slug: 'mini-faca-fosfatada',
    name: 'Mini Faca Fosfatada Tática', shortName: 'Mini Faca Fosfatada',
    category: 'facas', categoryName: 'Facas',
    badge: undefined, badgeType: undefined,
    price: 89.90, originalPrice: 129.90,
    rating: 4.5, reviews: 24, installments: 4, stock: 35, sku: 'CJ-015',
    image: `${SF}/MINI FACA FOSFATADA.png`,
    imageFundo: `${FD}/MINI FACA FOSFATADA.jpeg`,
    images: [`${SF}/MINI FACA FOSFATADA.png`, `${FD}/MINI FACA FOSFATADA.jpeg`],
    description: 'Versão miniaturizada da faca fosfatada. Prática e elegante, ideal para EDC. Acabamento fosfatado resistente.',
    features: ['Tamanho compacto (EDC)', 'Tratamento fosfatado', 'Lâmina afiada', 'Fácil de carregar', 'Clip incluso'],
    specs: { Comprimento: '18 cm', Lâmina: '9 cm', Peso: '140 g', Aço: 'Carbono tratado' },
    tags: ['mini', 'fosfatada', 'edc', 'tático'], featured: false,
  },
  {
    id: 14, slug: 'disco-eletrico-1800w',
    name: 'Disco Elétrico 220V 1800W Anti Aderente', shortName: 'Disco Elétrico 1800W',
    category: 'acessorios', categoryName: 'Acessórios',
    badge: 'Mais Vendido', badgeType: 'red',
    price: 449.90, originalPrice: 599.90,
    rating: 4.7, reviews: 44, installments: 12, stock: 20, sku: 'CJ-020',
    image: `${SF}/DISCO ELETRICO 220V ANTI ADERENTE 1800W.png`,
    imageFundo: `${FD}/DISCO ELETRICO 220V ANTI ADERENTE 1800W.jpeg`,
    images: [`${SF}/DISCO ELETRICO 220V ANTI ADERENTE 1800W.png`, `${FD}/DISCO ELETRICO 220V ANTI ADERENTE 1800W.jpeg`],
    description: 'Disco elétrico de alta potência (1800W) com revestimento anti aderente. Ideal para churrascos e confraternizações.',
    features: ['Potência de 1800W', 'Revestimento anti aderente', '220V', 'Controle de temperatura', 'Design robusto e elegante'],
    specs: { Potência: '1800W', Tensão: '220V', Diâmetro: '50 cm', Material: 'Aço com anti-aderente' },
    tags: ['elétrico', 'churrasco', 'acessório'], featured: false,
  },
  {
    id: 15, slug: 'faca-inox-matizada',
    name: 'Faca Inox Matizada Premium', shortName: 'Faca Matizada',
    category: 'facas', categoryName: 'Facas',
    badge: undefined, badgeType: undefined,
    price: 199.90, originalPrice: 259.90,
    rating: 4.6, reviews: 18, installments: 8, stock: 25, sku: 'CJ-008',
    image: `${SF}/FACA DE INOX MATIZADA.png`,
    imageFundo: `${FD}/FACA DE INOX MATIZADA.jpeg`,
    images: [`${SF}/FACA DE INOX MATIZADA.png`, `${FD}/FACA DE INOX MATIZADA.jpeg`],
    description: 'Faca em inox com acabamento matizado artesanal. O processo de matização confere beleza única e rusticidade à peça.',
    features: ['Lâmina em inox matizada artesanalmente', 'Acabamento opaco elegante', 'Alta resistência', 'Fácil de afiar', 'Visual diferenciado'],
    specs: { Comprimento: '26 cm', Lâmina: '14 cm', Peso: '290 g', Aço: 'Inox 420' },
    tags: ['matizada', 'artesanal', 'elegante'], featured: false,
  },
  {
    id: 16, slug: 'pegador-de-carne',
    name: 'Pegador de Carne Artesanal', shortName: 'Pegador de Carne',
    category: 'acessorios', categoryName: 'Acessórios',
    badge: undefined, badgeType: undefined,
    price: 69.90, originalPrice: 99.90,
    rating: 4.7, reviews: 38, installments: 3, stock: 50, sku: 'CJ-016',
    image: `${SF}/PEGADOR DE CARNE.png`,
    imageFundo: `${FD}/PEGADOR DE CARNE.jpeg`,
    images: [`${SF}/PEGADOR DE CARNE.png`, `${FD}/PEGADOR DE CARNE.jpeg`],
    description: 'Pegador de carne artesanal em inox com cabo de madeira. Complemento perfeito para o seu kit de churrasco.',
    features: ['Corpo em inox polido', 'Cabo de madeira tratada', 'Alta resistência ao calor', 'Comprimento adequado', 'Fácil de limpar'],
    specs: { Comprimento: '36 cm', Peso: '200 g', Material: 'Inox + Madeira' },
    tags: ['churrasco', 'acessório', 'pegador'], featured: false,
  },
];

export const CATEGORIES: Category[] = [
  {
    id: 'facas', name: 'Facas Artesanais', slug: 'facas',
    description: 'Facas de alta qualidade para churrasco, campo e coleção',
    icon: '⚔️', image: `${FD}/FACA BOWIE.jpeg`,
    count: PRODUCTS.filter(p => p.category === 'facas').length,
  },
  {
    id: 'kits', name: 'Kits Exclusivos', slug: 'kits',
    description: 'Conjuntos completos para presentear ou colecionar',
    icon: '📦', image: `${FD}/KIT TRIPLO FORJADO 10 POLEGADAS.jpeg`,
    count: PRODUCTS.filter(p => p.category === 'kits').length,
  },
  {
    id: 'acessorios', name: 'Acessórios', slug: 'acessorios',
    description: 'Complementos essenciais para sua coleção',
    icon: '🔧', image: `${FD}/CHAIRA.jpeg`,
    count: PRODUCTS.filter(p => p.category === 'acessorios').length,
  },
  {
    id: 'promocoes', name: 'Promoções', slug: 'promocoes',
    description: 'Melhores preços em peças selecionadas',
    icon: '🔥', image: `${FD}/MINI FACA FOSFATADA.jpeg`,
    count: PRODUCTS.filter(p => p.originalPrice && p.originalPrice > p.price).length,
  },
];

export const HERO_SLIDES = [
  {
    image: `${FD}/FACA DE INOX FULL TANG.jpeg`,
    badge: 'Coleção Premium',
    title: 'Facas Artesanais\nde Alta Qualidade',
    titleHighlight: 'Artesanais',
    subtitle: 'Cada peça é única, forjada com dedicação e precisão por mestres cuteleiros.',
    btnPrimary: { text: 'Ver Coleção', href: '/categoria/facas' },
    btnSecondary: { text: 'Saiba Mais', href: '#sobre' },
  },
  {
    image: `${FD}/KIT TRIPLO FORJADO 10 POLEGADAS.jpeg`,
    badge: 'Kit Especial',
    title: 'Kits Exclusivos\nPara Presentear',
    titleHighlight: 'Exclusivos',
    subtitle: 'Presenteie com elegância. Kits completos para o churrasqueiro e colecionador.',
    btnPrimary: { text: 'Ver Kits', href: '/categoria/kits' },
    btnSecondary: { text: 'Comprar Agora', href: '/categoria/kits' },
  },
  {
    image: `${FD}/FACÃO KUKRI AÇO CARBONO.jpeg`,
    badge: 'Edição Limitada',
    title: 'Facão Kukri\nAço Carbono',
    titleHighlight: 'Kukri',
    subtitle: 'Peças de coleção em edição limitada. Lâminas de alta resistência e acabamento premium.',
    btnPrimary: { text: 'Ver Edição Limitada', href: '/categoria/facas' },
    btnSecondary: { text: 'Comprar Agora', href: '/produto/10' },
  },
];

// ---- Helpers ----
export function getProductById(id: number) {
  return PRODUCTS.find(p => p.id === id);
}
export function getProductBySlug(slug: string) {
  return PRODUCTS.find(p => p.slug === slug);
}
export function getProductsByCategory(cat: string) {
  if (!cat || cat === 'todos' || cat === 'all') return PRODUCTS;
  if (cat === 'promocoes') return PRODUCTS.filter(p => p.originalPrice && p.originalPrice > p.price);
  return PRODUCTS.filter(p => p.category === cat);
}
export function getFeaturedProducts(limit = 8) {
  return PRODUCTS.filter(p => p.featured).slice(0, limit);
}
export function getRelatedProducts(id: number, limit = 4) {
  const p = getProductById(id);
  if (!p) return [];
  return PRODUCTS.filter(x => x.category === p.category && x.id !== id).slice(0, limit);
}
export function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
export function calcDiscount(price: number, original?: number) {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}
export function starsArr(rating: number) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return { full, half, empty };
}
