# recati-pages — redirecionamento do GitHub Pages → loja

O `recati.com.br` está no **GitHub Pages** (só serve arquivos estáticos), então
a loja RECA Componentes (Next.js + PostgreSQL) **não roda aqui** — ela vai para a
**Vercel**. Esta pasta contém uma página estática que **redireciona** o domínio
para a loja.

## Como usar
1. Faça o deploy da loja na Vercel (veja `reca-componentes/DEPLOY.md`) e copie a
   URL final (ex.: `https://reca-componentes.vercel.app`).
2. Edite **`index.html`**: troque `https://SUA-LOJA.vercel.app` pela URL real
   (há 2 lugares: a variável `LOJA` e o `<noscript>`).
3. Publique no mesmo repositório/branch que o GitHub Pages do `recati.com.br`
   usa hoje (substituindo o `index.html` atual). O arquivo `CNAME` mantém o
   domínio apontado.

## Melhor ainda (definitivo)
Apontar o `recati.com.br` direto para a Vercel (sem redirect). Nesse caso, a
loja responde no domínio raiz. Passo a passo em `reca-componentes/DEPLOY.md`
(seção "Apontar o domínio"). Se for por esse caminho, **remova** o domínio do
GitHub Pages para não conflitar.
