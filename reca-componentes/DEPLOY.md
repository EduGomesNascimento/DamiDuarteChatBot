# 🚀 Deploy da loja RECA Componentes em `recati.com.br`

A loja é um app **Next.js + PostgreSQL** (dinâmico). Ela **não roda** numa
hospedagem estática (cPanel/Hostinger só com arquivos) — precisa de um host que
rode Node + um banco PostgreSQL. O caminho recomendado (e gratuito para começar):

- **App:** Vercel
- **Banco:** Neon ou Supabase (PostgreSQL gerenciado)
- **Cache (opcional):** Upstash (Redis) — sem ele, usa cache em memória
- **Domínio:** apontar `recati.com.br` para a Vercel

> Como este repositório tem vários projetos, a loja está na **subpasta
> `reca-componentes/`**. Isso é importante na configuração da Vercel.

---

## 1) Banco de dados (Neon — ~3 min)

1. Crie conta em https://neon.tech → **New Project**.
2. Copie a **connection string** (formato `postgresql://...sslmode=require`).
3. Guarde — vai em `DATABASE_URL`.

## 2) Deploy na Vercel

1. Crie conta em https://vercel.com com o **GitHub** (repo `DamiDuarteChatBot`).
2. **Add New → Project →** importe o repositório.
3. Em **Root Directory**, selecione **`reca-componentes`**. ⚠️ (essencial)
4. Framework: **Next.js** (detecta sozinho). Build: `npm run build`.
5. Em **Environment Variables**, adicione (mínimo para subir):

   | Variável | Valor |
   |---|---|
   | `DATABASE_URL` | string do Neon |
   | `JWT_SECRET` | uma chave aleatória de 32+ caracteres |
   | `JWT_REFRESH_SECRET` | outra chave aleatória |
   | `NEXT_PUBLIC_APP_URL` | `https://recati.com.br` |
   | `NEXT_PUBLIC_STORE_NAME` | `RECA Componentes` |
   | `NEXT_PUBLIC_STORE_CITY` | `Portão - RS` |

   Opcionais (ativam recursos reais):
   - `REDIS_URL` (Upstash) — rate limit/sessões distribuídas
   - `RESEND_API_KEY` + `EMAIL_FROM` — e-mails (OTP, confirmação)
   - `MP_ACCESS_TOKEN` `MP_PUBLIC_KEY` `MP_WEBHOOK_SECRET` `NEXT_PUBLIC_MP_PUBLIC_KEY` — Mercado Pago
   - `S3_ENDPOINT` `S3_ACCESS_KEY` `S3_SECRET_KEY` `S3_BUCKET` `S3_REGION` `S3_PUBLIC_URL` — fotos em R2/S3

6. **Deploy**.

## 3) Migrar e popular o banco (1ª vez)

No seu PC, com a `DATABASE_URL` de produção no ambiente:

```bash
cd reca-componentes
# Windows PowerShell: $env:DATABASE_URL="postgresql://...neon..."
export DATABASE_URL="postgresql://...neon...sslmode=require"
npx prisma migrate deploy
npx prisma db seed        # cria 17 categorias, 173 produtos, admin, cupons
```

> Dica: troque o e-mail do admin no `prisma/seed.ts` antes do seed, ou promova
> seu usuário a ADMIN depois (campo `role`).

## 4) Apontar o domínio `recati.com.br`

1. Na Vercel: **Project → Settings → Domains → Add** `recati.com.br` (e `www`).
2. A Vercel mostra os registros DNS. No painel onde o domínio está registrado
   (Registro.br ou a hospedagem atual):
   - **A** `@` → `76.76.21.21` (IP da Vercel), **ou** o `CNAME` indicado;
   - **CNAME** `www` → `cname.vercel-dns.com`.
3. Aguarde a propagação (minutos a algumas horas). HTTPS é automático.

## 5) Webhook do Mercado Pago (quando ativar pagamento real)

No painel do Mercado Pago, configure a URL de notificação:
`https://recati.com.br/api/pagamentos/webhook` e use o `MP_WEBHOOK_SECRET`.

---

## Alternativa: manter a hospedagem atual só com um "redirect"

Se você quiser deixar a loja na Vercel num endereço (ex.: `loja.recati.com.br`)
e fazer o `recati.com.br` atual **redirecionar** para ela, dá para subir um
`index.html` simples de redirecionamento na hospedagem estática antiga. Posso
gerar esse arquivo — só me diga a URL final da loja.

## O que só você pode fazer (não tenho acesso)

- Criar/entrar nas contas Vercel/Neon e clicar em deploy.
- Alterar o DNS de `recati.com.br`.

Me passe o acesso/decisões (ou faça os cliques) e eu preparo tudo no código:
variáveis, redirect, seed de produção, ajuste de domínio nas `back_urls`, etc.
