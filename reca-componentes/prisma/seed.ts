import { PrismaClient, Prisma } from '@prisma/client'
import { catalogoRaw, type CatalogoRaw } from './catalogo-data'

const prisma = new PrismaClient()

function slugify(t: string) {
  return t
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 70)
}

/* ------------------------------------------------------------------ */
/* Categorias — agrupamento das categorias da planilha em seções de loja */
/* ------------------------------------------------------------------ */
interface CatDef {
  slug: string
  nome: string
  icone: string
  prefixo: string // prefixo de SKU
}

const CATEGORIAS: CatDef[] = [
  { slug: 'placas-mcu', nome: 'Placas & Microcontroladores', icone: 'cpu', prefixo: 'MCU' },
  { slug: 'sensores-modulos', nome: 'Sensores & Módulos', icone: 'radio', prefixo: 'SEN' },
  { slug: 'resistores', nome: 'Resistores', icone: 'resistor', prefixo: 'RES' },
  { slug: 'capacitores', nome: 'Capacitores', icone: 'capacitor', prefixo: 'CAP' },
  { slug: 'indutores-cristais', nome: 'Indutores & Cristais', icone: 'wave', prefixo: 'IND' },
  { slug: 'transistores', nome: 'Transistores', icone: 'transistor', prefixo: 'TRA' },
  { slug: 'mosfets-reguladores', nome: 'MOSFETs & Reguladores', icone: 'power', prefixo: 'MOS' },
  { slug: 'diodos', nome: 'Diodos', icone: 'diode', prefixo: 'DIO' },
  { slug: 'circuitos-integrados', nome: 'Circuitos Integrados', icone: 'chip', prefixo: 'CIN' },
  { slug: 'leds-iluminacao', nome: 'LEDs & Iluminação', icone: 'led', prefixo: 'LED' },
  { slug: 'buzzers-audio', nome: 'Buzzers & Áudio', icone: 'speaker', prefixo: 'AUD' },
  { slug: 'reles-chaves-botoes', nome: 'Relés, Chaves & Botões', icone: 'switch', prefixo: 'SWT' },
  { slug: 'energia-protecao', nome: 'Energia & Proteção', icone: 'battery', prefixo: 'PWR' },
  { slug: 'prototipagem-pcb', nome: 'Prototipagem & PCB', icone: 'board', prefixo: 'PRO' },
  { slug: 'ferramentas-solda', nome: 'Ferramentas & Solda', icone: 'tool', prefixo: 'FER' },
  { slug: 'instrumentacao', nome: 'Instrumentação & Medição', icone: 'meter', prefixo: 'INS' },
  { slug: 'cabos-acessorios', nome: 'Cabos & Acessórios', icone: 'cable', prefixo: 'ACE' },
]

// Mapeia a categoria da planilha → slug da loja
const MAPA: Record<string, string> = {
  'MCU / Dev Board': 'placas-mcu',
  'Sensor / Módulo': 'sensores-modulos',
  Resistor: 'resistores',
  Capacitor: 'capacitores',
  'Indutor / Cristal': 'indutores-cristais',
  Transistor: 'transistores',
  'MOSFET / Reg. TO-220': 'mosfets-reguladores',
  Diodo: 'diodos',
  'CI / IC': 'circuitos-integrados',
  LED: 'leds-iluminacao',
  'LED / Fita': 'leds-iluminacao',
  Buzzer: 'buzzers-audio',
  'Áudio / Fone': 'buzzers-audio',
  Relé: 'reles-chaves-botoes',
  'Botão / Chave': 'reles-chaves-botoes',
  'Encoder / Pot': 'reles-chaves-botoes',
  Fusível: 'energia-protecao',
  'Fonte / Alimentação': 'energia-protecao',
  'Bateria / Pilha': 'energia-protecao',
  Dissipador: 'energia-protecao',
  'Protoboard / PCB': 'prototipagem-pcb',
  'Jumper / Cabo Elétrico': 'prototipagem-pcb',
  'Conector / Pino': 'prototipagem-pcb',
  'Ferramenta Solda': 'ferramentas-solda',
  'Ferramenta Geral': 'ferramentas-solda',
  Instrumentação: 'instrumentacao',
  'Cabo USB/Dados': 'cabos-acessorios',
  'Revenda Geral': 'cabos-acessorios',
}

const catDefBySlug = new Map(CATEGORIAS.map((c) => [c.slug, c]))

/* ------------------------------------------------------------------ */
/* Preço de venda — margem aplicada sobre o custo landed da planilha    */
/* ------------------------------------------------------------------ */
function arredondar90(v: number): number {
  const f = Math.floor(v)
  return v <= f + 0.9 ? f + 0.9 : f + 1.9
}

function precoVenda(it: CatalogoRaw): { preco: number; original: number | null } {
  const custo = it.custo
  let fator: number
  if (custo < 10) fator = 2.3
  else if (custo < 30) fator = 1.95
  else if (custo < 80) fator = 1.7
  else if (custo < 200) fator = 1.55
  else fator = 1.4
  const preco = arredondar90(custo * fator)
  // Best sellers e itens "NOVO" ganham preço "de/por" para destacar oferta.
  const original = /best seller|NOVO/i.test(it.obs) ? arredondar90(preco * 1.18) : null
  return { preco, original }
}

/* ------------------------------------------------------------------ */
/* Estoque                                                              */
/* ------------------------------------------------------------------ */
function estoqueDe(it: CatalogoRaw): number {
  const m = it.obs.match(/(\d+)\s*restant/i)
  if (m) return parseInt(m[1], 10)
  if (/best seller/i.test(it.obs)) return 60 + (it.n % 40)
  if (/NOVO/i.test(it.obs)) return 25 + (it.n % 30)
  return 12 + (it.n % 45)
}

function ehDestaque(it: CatalogoRaw): boolean {
  return (
    /best seller/i.test(it.obs) ||
    ['ESP32-S3', 'Raspberry Pi Pico', 'Arduino Uno R3 ATmega', 'OLED display 0.96', 'DHT22'].some((k) =>
      it.nome.includes(k)
    )
  )
}

/* ------------------------------------------------------------------ */
/* Tags                                                                 */
/* ------------------------------------------------------------------ */
const KEYWORDS: [RegExp, string][] = [
  [/ESP32-S3/i, 'ESP32-S3'], [/ESP32-C3/i, 'ESP32-C3'], [/ESP32/i, 'ESP32'],
  [/ESP8266|ESP-01|NodeMCU/i, 'ESP8266'], [/Arduino/i, 'Arduino'], [/STM32/i, 'STM32'],
  [/Raspberry|RP2040|Pico/i, 'RaspberryPi'], [/WiFi/i, 'WiFi'], [/Bluetooth|BLE|HC-05/i, 'Bluetooth'],
  [/I2C/i, 'I2C'], [/SPI/i, 'SPI'], [/UART|Serial/i, 'UART'], [/I2S/i, 'I2S'],
  [/USB-C|Type-C/i, 'USBC'], [/\bNPN\b/i, 'NPN'], [/\bPNP\b/i, 'PNP'], [/MOSFET|IRF|IRFZ/i, 'MOSFET'],
  [/regulador|LM317|L78\d\d|7805|7812/i, 'Regulador'], [/zener/i, 'Zener'],
  [/op-?amp|LM358|LM324|TL07|NE5532|UA741|LM741/i, 'OpAmp'],
  [/RTC|DS3231/i, 'RTC'], [/OLED/i, 'OLED'], [/LCD/i, 'LCD'], [/display/i, 'Display'],
  [/relé|rele/i, 'Relé'], [/sensor/i, 'Sensor'],
  [/DC-DC|buck|boost|step-up|step-down|LM2596|MT3608|XL6009/i, 'DCDC'],
  [/18650|Li-?Ion|TP4056/i, 'Bateria'], [/RGB/i, 'RGB'], [/multímetro|multimetro/i, 'Multímetro'],
  [/solda|estanho|flux/i, 'Solda'], [/IoT/i, 'IoT'], [/giroscópio|aceler|MPU|BMI160/i, 'IMU'],
  [/protoboard|breadboard/i, 'Protoboard'], [/jumper|dupont/i, 'Jumper'],
]

function tagsDe(it: CatalogoRaw, catNome: string): string[] {
  const tags = new Set<string>()
  const base = catNome.split(/[&,]/)[0].trim().replace(/s$/, '')
  if (base) tags.add(base)
  for (const [re, tag] of KEYWORDS) if (re.test(it.nome)) tags.add(tag)
  if (it.origem === 'Brasil') tags.add('Brasil')
  if (/NOVO/i.test(it.obs)) tags.add('Novo')
  if (/best seller/i.test(it.obs)) tags.add('MaisVendido')
  if (/Iniciante|kit iniciante|37 sensores/i.test(it.nome)) tags.add('Educacional')
  return Array.from(tags).slice(0, 6)
}

/* ------------------------------------------------------------------ */
/* Especificações                                                       */
/* ------------------------------------------------------------------ */
function specsDe(it: CatalogoRaw, catNome: string): Record<string, string> {
  const s: Record<string, string> = {}
  s['Categoria'] = catNome
  if (it.conteudo) s['Conteúdo'] = it.conteudo
  const tensao = it.nome.match(/(\d+(?:\.\d+)?\s*[~-]?\s*\d*\.?\d*\s*V(?:DC|AC)?)\b/i)
  if (tensao) s['Tensão'] = tensao[1].replace(/\s+/g, '')
  const corr = it.nome.match(/(\d+(?:\.\d+)?\s*m?A)\b/)
  if (corr) s['Corrente'] = corr[1].replace(/\s+/g, '')
  const pkg = it.nome.match(/\b(TO-?\d+|DIP-?\d+|SOP-?\d+|SOT-?\d+|HC-49S|DO-\d+)\b/i)
  if (pkg) s['Encapsulamento'] = pkg[1].toUpperCase()
  const itf = it.nome.match(/\b(I2C|SPI|UART|I2S|1-?Wire|USB-?C|USB)\b/i)
  if (itf) s['Interface'] = itf[1].toUpperCase()
  const freq = it.nome.match(/(\d+(?:\.\d+)?\s*[MK]Hz)/i)
  if (freq) s['Frequência'] = freq[1].replace(/\s+/g, '')
  s['Origem'] = it.origem
  return s
}

/* ------------------------------------------------------------------ */
/* Descrição informal                                                   */
/* ------------------------------------------------------------------ */
const TEMPLATES: Record<string, string> = {
  'placas-mcu':
    'O cérebro do seu projeto começa aqui. Placas e microcontroladores prontos pra programar — pluga, sobe o código e dá vida pra sua ideia.',
  'sensores-modulos':
    'Dê olhos, ouvidos e tato pro seu projeto. Módulos e sensores que medem o mundo real e entregam os dados mastigados pro seu microcontrolador.',
  resistores:
    'O componente mais honesto da eletrônica: limita corrente e não reclama. Resistor bom é resistor que você nem percebe trabalhando.',
  capacitores:
    'Guardam energia, filtram ruído e estabilizam sua alimentação. Todo projeto sério tem um capacitor salvando o dia em algum canto da placa.',
  'indutores-cristais':
    'A batida do relógio e o controle do fluxo. Cristais que dão o clock certinho e indutores que domam a corrente nos seus circuitos.',
  transistores:
    'O tijolo que construiu a era digital. Amplifica, chaveia e comanda cargas — do bipolar clássico ao de potência parrudo.',
  'mosfets-reguladores':
    'Potência sob controle. MOSFETs pra chavear corrente alta sem esquentar e reguladores pra entregar a tensão exata que seu circuito pede.',
  diodos:
    'Mão única pra corrente. Retifica, protege contra inversão e ainda tem o zener pra travar tensão certinha. Pequeno, barato, indispensável.',
  'circuitos-integrados':
    'Funções inteiras num chip só. Op-amps, timers, contadores e drivers prontos pra encaixar no soquete e resolver seu problema.',
  'leds-iluminacao':
    'Luz que comunica. Do LED indicador que pisca no seu protótipo à iluminação que dá acabamento — eficiente e cheio de cor.',
  'buzzers-audio':
    'Som no seu projeto, do bipe simples ao áudio de verdade. Buzzers pra avisar e componentes pra quem leva som a sério.',
  'reles-chaves-botoes':
    'A interface entre você e a máquina. Botões, chaves, encoders e relés pra acionar, selecionar e comandar com clique satisfatório.',
  'energia-protecao':
    'Energia limpa e segura. Fontes, baterias, fusíveis e dissipadores pra alimentar o projeto e proteger contra os perrengues elétricos.',
  'prototipagem-pcb':
    'A bancada onde a ideia vira circuito. Protoboards, jumpers e conectores pra montar, testar e refazer sem soldar nada.',
  'ferramentas-solda':
    'A mão do maker. Ferro de solda, estanho, flux e ferramentas que transformam componentes soltos em projeto pronto.',
  instrumentacao:
    'Pare de adivinhar e meça. Multímetros e testadores que mostram a verdade do seu circuito — tensão, corrente, ESR e o que mais precisar.',
  'cabos-acessorios':
    'Os coadjuvantes que fazem tudo funcionar. Cabos, adaptadores e acessórios que conectam, alimentam e completam o setup.',
}

function descricaoInformal(it: CatalogoRaw, slug: string): string {
  const intro = TEMPLATES[slug] ?? 'Componente eletrônico selecionado para o seu projeto.'
  const conteudo = it.conteudo ? ` Vem com: ${it.conteudo}.` : ''
  const origem =
    it.origem === 'Brasil'
      ? ' Enviado a partir do Brasil — chega rapidinho.'
      : ' Produto importado e conferido pela nossa equipe.'
  const linha = `${it.nome}.${conteudo}${origem}`
  const fecho = /best seller/i.test(it.obs)
    ? 'Best seller da casa — sai voando. Garanta o seu antes que acabe.'
    : 'Qualidade conferida, preço de quem compra direto. Bora montar?'
  return `${intro}\n\n${linha}\n\n${fecho}`
}

/* ------------------------------------------------------------------ */
/* Imagens — placeholder temático por categoria (Unsplash + Picsum)     */
/* ------------------------------------------------------------------ */
const FOTO_CAT: Record<string, string> = {
  'placas-mcu': 'photo-1608564697071-ddf911d81370',
  'sensores-modulos': 'photo-1581090700227-1e8e3f1f1f1f',
  'circuitos-integrados': 'photo-1591799264318-7e6ef8ddb7ea',
  'ferramentas-solda': 'photo-1530124566582-a618bc2615dc',
  instrumentacao: 'photo-1572177812156-58036aae439c',
  'prototipagem-pcb': 'photo-1518770660439-4636190af475',
}

function imagens(sku: string, slug: string): string[] {
  const unsplash = FOTO_CAT[slug]
  const principal = unsplash
    ? `https://images.unsplash.com/${unsplash}?w=800&h=800&fit=crop&auto=format`
    : `https://picsum.photos/seed/${sku}-1/800/800`
  return [principal, `https://picsum.photos/seed/${sku}-2/800/800`, `https://picsum.photos/seed/${sku}-3/800/800`]
}

/* ------------------------------------------------------------------ */
async function main() {
  console.log('🌱 Seed RECA Componentes — iniciando...')

  const catId = new Map<string, string>()
  for (const c of CATEGORIAS) {
    const cat = await prisma.categoria.upsert({
      where: { slug: c.slug },
      update: { nome: c.nome, icone: c.icone },
      create: { slug: c.slug, nome: c.nome, icone: c.icone },
    })
    catId.set(c.slug, cat.id)
  }
  console.log(`✓ ${CATEGORIAS.length} categorias`)

  const tagId = new Map<string, string>()
  async function garanteTag(nome: string) {
    if (tagId.has(nome)) return tagId.get(nome)!
    const slug = slugify(nome)
    const tag = await prisma.tag.upsert({ where: { slug }, update: { nome }, create: { nome, slug } })
    tagId.set(nome, tag.id)
    return tag.id
  }

  const slugsUsados = new Set<string>()
  let count = 0

  for (const it of catalogoRaw) {
    const slugCat = MAPA[it.cat] ?? 'cabos-acessorios'
    const def = catDefBySlug.get(slugCat)!
    const catNome = def.nome
    const sku = `${def.prefixo}-${String(it.n).padStart(3, '0')}`

    let slug = slugify(it.nome)
    if (!slug) slug = sku.toLowerCase()
    if (slugsUsados.has(slug)) slug = `${slug}-${it.n}`
    slugsUsados.add(slug)

    const { preco, original } = precoVenda(it)
    const tags = tagsDe(it, catNome)
    const tagIds = await Promise.all(tags.map(garanteTag))

    const dadosComuns = {
      nome: it.nome,
      descricaoInformal: descricaoInformal(it, slugCat),
      descricaoTecnica: `${it.nome}. Categoria: ${catNome}. Conteúdo: ${it.conteudo || '1 unidade'}. Origem: ${it.origem}.`,
      especificacoes: specsDe(it, catNome),
      preco: new Prisma.Decimal(preco),
      precoOriginal: original ? new Prisma.Decimal(original) : null,
      estoque: estoqueDe(it),
      destaque: ehDestaque(it),
      freteGratis: preco >= 150 || /best seller/i.test(it.obs),
      categoriaId: catId.get(slugCat)!,
    }

    const produto = await prisma.produto.upsert({
      where: { sku },
      update: dadosComuns,
      create: {
        ...dadosComuns,
        slug,
        sku,
        imagens: imagens(sku, slugCat),
        pesoGramas: 80,
      },
    })

    await prisma.produtoTag.deleteMany({ where: { produtoId: produto.id } })
    for (const tid of tagIds) {
      await prisma.produtoTag.create({ data: { produtoId: produto.id, tagId: tid } })
    }
    count++
  }
  console.log(`✓ ${count} produtos`)

  await prisma.usuario.upsert({
    where: { email: 'admin@recacomponentes.com.br' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@recacomponentes.com.br',
      nomeCompleto: 'Administrador RECA',
      cpf: '00000000191',
      telefone: '51999999999',
      dataNasc: new Date('1990-01-01'),
      role: 'ADMIN',
      emailVerificado: true,
    },
  })
  console.log('✓ usuário admin (admin@recacomponentes.com.br)')

  const cupons = [
    { codigo: 'BEMVINDO10', tipo: 'PERCENTUAL' as const, valor: 10, minimo: 50, maxUsos: 1000 },
    { codigo: 'MAKER15', tipo: 'PERCENTUAL' as const, valor: 15, minimo: 200, maxUsos: 500 },
    { codigo: 'RECA18', tipo: 'FIXO' as const, valor: 18, minimo: 90, maxUsos: 500 },
  ]
  for (const c of cupons) {
    await prisma.cupom.upsert({
      where: { codigo: c.codigo },
      update: {},
      create: {
        codigo: c.codigo,
        tipo: c.tipo,
        valor: new Prisma.Decimal(c.valor),
        minimo: new Prisma.Decimal(c.minimo),
        maxUsos: c.maxUsos,
      },
    })
  }
  console.log(`✓ ${cupons.length} cupons`)

  // Configuração da loja (linha única)
  await prisma.configuracao.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      nomeLoja: 'RECA Componentes',
      freteGratisAtivo: true,
      freteGratisMinimo: new Prisma.Decimal(299),
      bannerTexto: 'Frete grátis acima de R$ 299 • Componentes com preço de quem compra direto',
    },
  })
  console.log('✓ configuração da loja')

  console.log('✅ Seed concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
