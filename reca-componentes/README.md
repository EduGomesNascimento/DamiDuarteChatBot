# ⚡ RECA Componentes

E-commerce completo de microcontroladores e componentes eletrônicos — ARM, ESP,
AVR, Raspberry Pi e acessórios. Foco em makers, estudantes e engenheiros do RS.
Estética **"Circuit Board Futurism"**: dark mode, glow ciano, trilhas de PCB e
muita animação.

> Loja sediada em **Portão/RS**. Nome configurável via `NEXT_PUBLIC_STORE_NAME`.

---

## 🧱 Stack

| Camada        | Tecnologia                                            |
| ------------- | ----------------------------------------------------- |
| Frontend      | Next.js 14 (App Router) + TypeScript + Tailwind CSS   |
| Backend/API   | Next.js API Routes (Route Handlers)                   |
| Banco         | PostgreSQL via Prisma ORM                             |
| Autenticação  | Própria — e-mail + OTP, JWT (access + refresh) em cookies httpOnly |
| Pagamento     | Mercado Pago (SDK oficial) — PIX, Boleto, Cartão      |
| E-mail        | Resend (OTP e transacionais)                          |
| Cache / RL    | Redis (sessões e rate limiting) — com fallback em memória |
| Storage       | Cloudflare R2 / AWS S3 (configurável por env)         |

---

## 🚀 Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
#    (edite o .env com suas credenciais)

# 3. Subir banco de dados + Redis (Docker)
docker-compose up -d postgres redis

# 4. Executar migrations
npx prisma migrate dev

# 5. Popular o banco com o catálogo inicial
npx prisma db seed

# 6. Rodar em desenvolvimento
npm run dev
#    → http://localhost:3000

# Build de produção
npm run build && npm start
```

### Usuário admin (seed)

O seed cria um usuário administrador:

```
email: admin@recacomponentes.com.br
```

Para entrar como admin em desenvolvimento: vá em `/auth`, informe o e-mail acima,
e use o código OTP que aparece **no console do servidor** (sem `RESEND_API_KEY`,
os e-mails são logados em vez de enviados).

---

## 🔧 Modo de desenvolvimento sem credenciais externas

O projeto roda mesmo sem todas as integrações configuradas:

- **Sem `REDIS_URL`** → rate limiting e OTP usam um store em memória.
- **Sem `RESEND_API_KEY`** → e-mails (incluindo o código OTP) são impressos no
  console do servidor.
- **Sem `MP_ACCESS_TOKEN`** → o checkout usa um **fluxo mock** em
  `/checkout/mock` que simula PIX, Boleto e Cartão, com botões para simular
  pagamento aprovado / pendente / recusado (substitui o webhook real do MP).
- **Sem `S3_*`** → o upload de imagens do admin salva em `/public/uploads`
  (local). Com `S3_*` + `S3_PUBLIC_URL` preenchidos, envia para Cloudflare R2 / S3.

Isso permite demonstrar o fluxo de ponta a ponta antes de plugar as chaves reais.

### Pagamento (Mercado Pago) em produção

1. Preencha `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY` e `MP_WEBHOOK_SECRET`.
2. O checkout cria a preferência e redireciona ao **Checkout Pro** (cartão,
   PIX, boleto). Ao voltar, o cliente cai em **`/checkout/retorno`**, que faz
   *polling* em `/api/pedidos/[numero]/status` e mostra o status ao vivo.
3. O **webhook** `POST /api/pagamentos/webhook` valida a assinatura
   HMAC-SHA256, consulta o pagamento e atualiza o pedido (aprovado, pendente,
   recusado, estornado) — repondo estoque quando cancelado/estornado.

---

## 🗺️ Rotas principais

| Rota                     | Descrição                                            |
| ------------------------ | ---------------------------------------------------- |
| `/`                      | Home com hero animado, contadores, destaques         |
| `/catalogo`              | Catálogo com filtros, busca/autocomplete e tags      |
| `/produto/[slug]`        | Página do produto com 4 abas                         |
| `/carrinho`              | Carrinho (localStorage) + cupom                      |
| `/checkout`              | Checkout em 4 passos + Mercado Pago                  |
| `/auth` · `/auth/verificar` | Login/cadastro por e-mail + OTP                   |
| `/minha-conta`           | Dashboard, pedidos, endereços, dados                 |
| `/admin`                 | Painel admin (role `ADMIN`)                          |

### API (Route Handlers)

```
POST /api/auth/otp            Envia OTP (rate-limited)
POST /api/auth/verificar      Verifica OTP
POST /api/auth/cadastro       Completa cadastro
POST /api/auth/refresh        Renova JWT
GET  /api/produtos            Lista produtos (filtros via query)
GET  /api/produtos/[slug]     Detalhes do produto
POST /api/produtos/avise-me   Aviso de reposição de estoque
POST /api/frete               Cálculo de frete (mock por região)
POST /api/cupom               Valida cupom de desconto
POST /api/checkout/criar-preferencia   Cria pedido + preferência MP
POST /api/pagamentos/webhook  Webhook do Mercado Pago (HMAC-SHA256)
GET  /api/pedidos             Pedidos do usuário
... e rotas /api/admin/* protegidas por role ADMIN
```

---

## 🎨 Identidade visual

- Paleta: bg `#0A0E1A`, surface `#111827`, primário ciano `#00D4FF`, violeta
  `#7C3AED`, success/warning/danger.
- Fontes (next/font): **Space Grotesk** (display), **Plus Jakarta Sans** (corpo),
  **JetBrains Mono** (specs/SKU).
- Efeitos: trilhas de PCB no fundo, grid blueprint + partículas + scanlines no
  hero, typing effect, glow no hover dos cards, tilt 3D, ripple nos botões,
  skeleton shimmer, contadores animados, toasts, bounce no badge do carrinho.
- Dark/light mode com toggle (preferência salva em `localStorage`).

---

## 🔒 Segurança

- OTP com hash **bcrypt** (nunca em texto puro), expiração de 10 min e máximo de
  tentativas.
- Rate limiting por e-mail e por IP (Redis).
- JWT access (15 min) + refresh (7 dias) em cookies **httpOnly**; sessões
  rastreadas no banco (hash do refresh token).
- Validação e sanitização de inputs com **Zod** no server-side.
- Validação de **CPF/CNPJ** com dígitos verificadores (client + server).
- Webhook do Mercado Pago valida assinatura **HMAC-SHA256**.
- Middleware protege `/minha-conta` e `/admin`; role `ADMIN` exigida no admin.
- Headers de segurança em `next.config.js`; SQL injection mitigado pelo Prisma.

---

## 🗄️ Banco de dados

Schema completo em [`prisma/schema.prisma`](./prisma/schema.prisma): Usuário,
OtpCode, Sessão, Endereço, DadosFiscais, Categoria, Tag, Produto, ProdutoTag,
Pedido, ItemPedido, Pagamento, Cupom, AvisoEstoque.

O seed ([`prisma/seed.ts`](./prisma/seed.ts)) cadastra 18 produtos (STM32, ESP32,
Arduino, Raspberry Pi e acessórios) com descrições, specs, tags e preços, além de
categorias, cupons e o usuário admin.

---

## 🚢 Deploy

- **Frontend/app:** Vercel.
- **PostgreSQL:** Railway / Supabase / Neon.
- **Redis:** Upstash.
- **Imagens:** Cloudflare R2 ou AWS S3 (variáveis `S3_*`).

Defina todas as variáveis de `.env.example` no provedor e rode
`npx prisma migrate deploy` no banco de produção.
