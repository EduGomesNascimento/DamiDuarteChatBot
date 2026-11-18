# Dami CRM

CRM single-tenant com automação de mensagens via WhatsApp para a Dami.

## Como rodar

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Acesse `http://127.0.0.1:5000`.

## WhatsApp

Por padrão, o envio é em modo **stub** (apenas log no console). Para ativar o envio via
WhatsApp Web usando `pywhatkit`:

```powershell
$env:WHATSAPP_MODE = "pywhatkit"
python app.py
```

Mantenha o WhatsApp Web aberto e use números com DDI (ex: `+55`).

## Automação

- Corte: após 3 meses do último agendamento.
- Carinho: após 20 dias sem contato.
- Aniversário: mensagem personalizada no dia.

O scheduler roda diariamente às 09:00 e registra tudo em “Ações Automáticas”.
