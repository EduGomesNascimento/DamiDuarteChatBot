# DamiDuarteChatBot

Repositório com o **Dami CRM** e alguns projetos guardados que não têm
repositório próprio.

## Conteúdo

| Pasta | O que é |
|---|---|
| [`dami-crm/`](dami-crm/) | Dami CRM: CRM em Flask com automação de mensagens via WhatsApp. Veja o README da pasta para rodar. |
| [`cutelaria-jeferson/`](cutelaria-jeferson/) | Loja da Cutelaria Jeferson (Next.js + Supabase + PagBank). Única cópia do código. |
| [`recati/redirect-pages/`](recati/redirect-pages/) | Página estática para redirecionar `recati.com.br` para a loja RECA Componentes (não publicada) |
| [`recati/site-antigo/`](recati/site-antigo/) | Site institucional antigo da RECATI, guardado como histórico |

### Projetos que estavam aqui e agora vivem no próprio repositório

| Projeto | Repositório |
|---|---|
| Loja RECA Componentes | [Reca-Componentes](https://github.com/EduGomesNascimento/Reca-Componentes) |
| Site da Brambatti Odontologia | [Brambatti](https://github.com/EduGomesNascimento/Brambatti) |
| Site atual da RECATI | [Recati](https://github.com/EduGomesNascimento/Recati) |

As cópias antigas continuam acessíveis no histórico do git deste repositório.

## Pendência conhecida

`cutelaria-jeferson/nextjs/` não tem `package.json`, `tsconfig.json` nem
`next.config.js`, e esses arquivos nunca foram versionados. Para rodar o
projeto, é preciso recriá-los (Next.js com App Router, `@supabase/ssr` e
Tailwind, conforme os imports em `src/`).
