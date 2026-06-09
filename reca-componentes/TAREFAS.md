# ✅ RECA Componentes — Lista de Tarefas

> Loja de **componentes eletrônicos** (microcontroladores, sensores, passivos,
> semicondutores, CIs, ferramentas, instrumentação e acessórios).
> Catálogo gerado a partir da planilha (`prisma/catalogo-data.ts`, 173 itens).

---

## ✔️ Concluído

### Fundação & Identidade
- [x] Rebrand **Atacado do Microcontrolador → RECA Componentes** (pasta, marca, e-mails, prefixo de pedido `RECA-`)
- [x] Stack: Next.js 14 + TS + Tailwind + Prisma + Redis + Resend + Mercado Pago
- [x] Tema dark "Circuit Board Futurism" + toggle light/dark
- [x] Todas as animações (typing, partículas, tilt, glow, ripple, skeleton, contadores, bounce do carrinho)

### Catálogo (173 produtos da planilha)
- [x] 17 categorias agrupadas (Placas & MCUs, Sensores, Resistores, Capacitores, Transistores, MOSFETs, Diodos, CIs, LEDs, Áudio, Relés/Chaves, Energia, Prototipagem, Ferramentas, Instrumentação, Cabos…)
- [x] Geração automática de preço de venda (margem sobre custo landed), tags, specs e descrições
- [x] **Fotos em todos os produtos** (placeholder Unsplash/Picsum por categoria) + galeria
- [x] Página de produto com 4 abas, busca, filtros e descontos por volume

### Conta Admin (`admin@recacomponentes.com.br`)
- [x] CRUD de produtos com **edição de fotos** (URL + **upload de arquivo** em `/api/admin/upload`)
- [x] **Desconto por produto** (preço "de/por" via `precoOriginal`)
- [x] **Desconto global da loja** (% sobre todo o catálogo) na página de Configurações
- [x] **Frete grátis** por produto (toggle) **e** por valor mínimo do pedido (config) — aplicado no checkout
- [x] Banner promocional configurável no topo do site
- [x] Gestão de pedidos (status + rastreio), usuários (papel), cupons, relatório CSV
- [x] Cupons de desconto (BEMVINDO10, MAKER15, RECA18)

### Pagamento
- [x] Checkout em 4 passos + Mercado Pago (Checkout Pro)
- [x] Modo **mock** (PIX/Boleto/Cartão) quando MP não está configurado
- [x] Webhook com validação HMAC-SHA256; estados aprovado/pendente/recusado/estornado

---

## 🔜 A Fazer / Próximos Passos

### Pagamento (prioridade)
- [ ] Configurar credenciais reais do Mercado Pago (`MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`, `MP_WEBHOOK_SECRET`)
- [ ] Testar PIX real (QR + copia-e-cola) e boleto (PDF) em produção
- [ ] Parcelamento real no cartão (juros vindos do MP) em vez do cálculo simulado
- [x] Tela de retorno pós-pagamento com status ao vivo (`/checkout/retorno`, polling em `/api/pedidos/[numero]/status`)

### Fotos dos produtos
- [ ] Substituir placeholders por **fotos reais** dos componentes (upload pelo admin)
- [x] Upload direto para **Cloudflare R2 / S3** (`lib/storage.ts`) com fallback local automático
- [ ] Compressão/resize automático e geração de thumbnail

### Catálogo & Conteúdo
- [ ] Revisar margens de preço por categoria com o titular
- [ ] Datasheets/pinouts reais nos produtos que têm (ESP32, STM32, sensores)
- [ ] Estoque real (hoje é estimado pela planilha)

### Operação
- [ ] Integração real de frete (Correios/Melhor Envio) — estrutura já pronta em `lib/shipping.ts`
- [ ] Emissão de NF-e (integrar emissor)
- [ ] E-mails transacionais com Resend em produção (`RESEND_API_KEY`)
- [ ] Migration do banco em produção: `npx prisma migrate deploy`

### Infra / Deploy
- [ ] Deploy Vercel + PostgreSQL (Neon/Supabase/Railway) + Redis (Upstash)
- [ ] Variáveis de ambiente de produção (ver `.env.example`)
- [ ] Domínio + HTTPS

---

## 🔑 Conta administradora

```
E-mail:  admin@recacomponentes.com.br
Login:   /auth  → informe o e-mail → código OTP
```

Em desenvolvimento (sem `RESEND_API_KEY`), o **código OTP aparece no console
do servidor**. Após entrar, o painel fica em **`/admin`** (Dashboard, Produtos,
Pedidos, Usuários, Cupons, **Configurações**).

> ⚠️ Itens da planilha sobre **loja física** (construção, mobiliário, gastos
> fixos) foram **ignorados** propositalmente — este projeto é só o e-commerce.
