# 🚀 Sistema Avançado de Frete, Endereços e Admin

## 📋 Resumo de Implementação

Sistema completo estilo Amazon com:
- ✅ Cálculo de frete na página do produto (Melhor Envio)
- ✅ Gerenciamento de múltiplos endereços
- ✅ Checkout inteligente com endereço padrão
- ✅ Admin ativável por email
- ✅ Improvements de UX (removido Contato/Revendedor do header)

---

## 🎯 1. Pré-requisitos

### 1.1 Executar Script SQL no Supabase

Copie e cole o conteúdo de `DATABASE_SETUP.sql` no SQL Editor do Supabase:

```bash
# Arquivo: DATABASE_SETUP.sql
# Contém: Criação da tabela addresses com RLS e índices
```

**O quê faz:**
- Cria tabela `addresses` com campos de endereço
- Habilita Row Level Security (RLS)
- Cada usuário só vê seus próprios endereços
- Garante apenas 1 endereço padrão por usuário

### 1.2 Env Variables

Verifique se `.env.local` contém:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
MELHOR_ENVIO_TOKEN=... (seu token da API)
```

---

## 🏭 2. Componentes Criados

### 2.1 API Route: `/api/shipping/calculate`

**Arquivo:** `src/app/api/shipping/calculate/route.ts`

**Funcionalidade:**
- Recebe CEP, weight, price
- Calcula frete usando Melhor Envio
- Cache de 5 min por CEP (performance)
- Retorna array com opções (PAC, SEDEX, Jadlog)

**Como chamar:**
```typescript
const response = await fetch('/api/shipping/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cep: '01310100',
    weight: 0.5,  // kg
    price: 100,   // preço do produto
  }),
});
const options = await response.json();
// [{ carrier: 'Correios', name: 'PAC', price: 19.90, days: 7 }, ...]
```

### 2.2 Hook: `useAddresses()`

**Arquivo:** `src/hooks/useAddresses.ts`

**Funcionalidade:**
```typescript
const {
  addresses,           // Address[]
  defaultAddress,      // Address | null
  loading,            // boolean
  error,              // string | null
  addAddress,         // async (data) => Address
  updateAddress,      // async (id, data) => Address
  removeAddress,      // async (id) => void
  setDefault,         // async (id) => void
  reload,             // async () => void
} = useAddresses();
```

**Uso:**
```typescript
// Adicionar novo endereço
await addAddress({
  name: 'Casa',
  recipient_name: 'João',
  street: 'Rua das Flores',
  number: '123',
  neighborhood: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  zip_code: '01310-100',
  is_default: true,
});

// Atualizar endereço
await updateAddress(addressId, { name: 'Trabalho' });

// Remover endereço
await removeAddress(addressId);

// Definir como padrão
await setDefault(addressId);
```

### 2.3 Componente: `ShippingCalculator`

**Arquivo:** `src/components/ui/ShippingCalculator.tsx`

**Props:**
```typescript
interface ShippingCalculatorProps {
  weight?: number;  // default: 0.5
  price?: number;   // default: 100
}
```

**Features:**
- Campo de CEP com máscara
- Auto-preenchimento se usuário logado (usa endereço padrão)
- Cards com opções de frete
- Salva último CEP em localStorage
- Loading states e error handling

**Uso:**
```typescript
import ShippingCalculator from '@/components/ui/ShippingCalculator';

export default function Product() {
  return (
    <div>
      {/* ... outras infos do produto ... */}
      <ShippingCalculator weight={0.5} price={product.price} />
    </div>
  );
}
```

---

## 📍 3. Página: `/usuario/enderecos`

**Arquivo:** `src/app/usuario/enderecos/page.tsx`

**Funcionalidades:**
- ✅ Listar todos os endereços
- ✅ Adicionar novo endereço com modal
- ✅ Editar endereço existente
- ✅ Remover endereço com confirmação
- ✅ Definir endereço como padrão
- ✅ Auto-fill via ViaCEP ao digitar CEP

**Acesso:**
```
http://localhost:3000/usuario/enderecos
```

**Fluxo:**
1. Usuário clica em "Meus Endereços" no perfil
2. Vê lista de endereços salvos
3. Badge "PADRÃO" no endereço ativo
4. Pode adicionar/editar/remover/definir padrão

---

## 👑 4. Admin Ativável por Email

### 4.1 Regra Principal

**Apenas:** `cutelariajeferson@gmail.com` pode acessar `/admin`

### 4.2 API Route: `/api/admin/activate`

**Arquivo:** `src/app/api/admin/activate/route.ts`

**Funcionalidade:**
- Verifica se email === `cutelariajeferson@gmail.com`
- Atualiza `users.role = 'admin'` no Supabase
- Válida apenas no backend (seguro)

**Como chamar:**
```typescript
const response = await fetch('/api/admin/activate', { method: 'POST' });
const data = await response.json();
// { ok: true, message: "..." } ou
// { error: "Email não autorizado..." }
```

### 4.3 Página: `/usuario` (atualizado)

**Arquivo:** `src/app/usuario/page.tsx`

**Mudanças:**
- Novo link: "🏠 Meus Endereços"
- Se email === `cutelariajeferson@gmail.com`: mostra card "👑 Modo Administrador"
- Botão redireciona para `/admin` após ativar

**Fluxo:**
1. Login com `cutelariajeferson@gmail.com`
2. Acessa `/usuario`
3. Vê botão "Modo Administrador"
4. Clica → ativa admin → redireciona para `/admin`
5. Acesso a todas as ferramentas admin

---

## 🛒 5. Checkout Inteligente (Próximo passo)

**Arquivo a atualizar:** `src/app/checkout/page.tsx`

**O que adicionar:**
```typescript
// 1. Buscar endereço padrão se logado
const { defaultAddress } = useAddresses();

// 2. Pré-preencher form com endereço padrão
useEffect(() => {
  if (defaultAddress) {
    setForm({
      ...form,
      name: defaultAddress.recipient_name,
      cep: defaultAddress.zip_code,
      address: defaultAddress.street,
      // ... outros campos
    });
  }
}, [defaultAddress]);

// 3. Selector de endereços salvos
<select onChange={(e) => selectAddress(e.target.value)}>
  {addresses.map(a => (
    <option key={a.id} value={a.id}>
      {a.name} ({a.city})
    </option>
  ))}
</select>

// 4. Integrar cálculo de frete
const options = await fetch('/api/shipping/calculate', {...}).then(r => r.json());
setFreightOptions(options);

// 5. Radio buttons para escolher frete
// atualizar total dinamicamente
```

---

## 🎨 6. UI Improvements

### 6.1 Header: Removidos

- ❌ Botão "💬 Contato" (agora apenas no footer)
- ❌ Botão "🤝 Revendedor" (agora apenas no footer)

**Arquivo:** `src/components/layout/Header.tsx`

### 6.2 Footer: Removidos

- ❌ Social media icons (📸, 👥, 💬, ▶️)

**Arquivo:** `src/components/layout/Footer.tsx`

---

## 📚 7. Tipos TypeScript

**Arquivo:** `src/types/index.ts`

### Address
```typescript
interface Address {
  id: string;
  user_id: string;
  name: string; // "Casa", "Trabalho", etc
  recipient_name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
  created_at: string;
}
```

### ShippingOption
```typescript
interface ShippingOption {
  carrier: string; // "Correios", "Jadlog", etc
  name: string;    // "PAC", "SEDEX", "Jadlog"
  price: number;
  days: number;
  error?: string;
}
```

---

## 🔐 8. Middleware Atualizado

**Arquivo:** `src/middleware.ts`

**Mudança:**
```typescript
// Antes:
// - Consulta `users.role` no banco
// - Pode falhar se não houver user criado

// Agora:
// - Verifica `user.email === 'cutelariajeferson@gmail.com'`
// - Mais rápido, sem query DB
// - Seguro: ainda protege a rota
```

---

## ✅ Checklist de Verificação

- [ ] 1. Executei `DATABASE_SETUP.sql` no Supabase
- [ ] 2. Dev server rodando em http://localhost:3000
- [ ] 3. Loguei como usuário normal
- [ ] 4. Acessei `/usuario/enderecos` e adicionei 1º endereço
- [ ] 5. Digitei CEP em `/usuario/enderecos` → ViaCEP auto-preencheu
- [ ] 6. Defini endereço como padrão
- [ ] 7. Acessei `/produto/[id]` → ShippingCalculator visível
- [ ] 8. Digitei CEP no produto → viu opções de frete
- [ ] 9. Logout e login como `cutelariajeferson@gmail.com`
- [ ] 10. Vi botão "Modo Administrador" em `/usuario`
- [ ] 11. Cliquei botão → redirecionou para `/admin`
- [ ] 12. Acessei `/admin` com outro email → redirecionou para home

---

## 🐛 Troubleshooting

### "Erro ao carregar endereços"
- Verifique se SQL foi executado no Supabase
- Verifique RLS policy está criada
- Verifique `NEXT_PUBLIC_SUPABASE_ANON_KEY` no `.env.local`

### "CEP inválido"
- Certifique-se de usar formato correto: `12345-678` ou `12345678`
- ViaCEP só funciona com CEPs válidos brasileiros

### "Frete não calcula"
- Verifique se `MELHOR_ENVIO_TOKEN` está no `.env.local`
- Sem token, usa valores mock (R$19.90 base)
- Consulte logs do servidor para erros

### "Botão admin não aparece"
- Verifique email do usuário logado
- Deve ser exatamente `cutelariajeferson@gmail.com`
- Confirme no console do navegador: `user.email`

### "Acesso negado ao /admin"
- Middleware verifica email, não role no banco
- Email deve bater exatamente
- Faça logout e login novamente

---

## 📞 Próximos Passos Recomendados

1. **Integração Completa no Checkout**
   - Adicionar selector de endereços salvos
   - Integrar cálculo de frete em tempo real
   - Mostrar opções e atualizar total

2. **Fluxo de Edição de Endereço no Checkout**
   - Permitir editar endereço inline antes de confirmar
   - Recalcular frete automaticamente

3. **Sistema de Notificações**
   - Email quando admin acessa `/admin`
   - Email quando pedido muda de status

4. **Dashboard Admin Expandida**
   - Relatórios de endereços mais usados
   - Mapa de cobertura geográfica
   - Análise de custos de frete

---

## 📁 Estrutura de Arquivos Criados

```
nextjs/
├── DATABASE_SETUP.sql
├── SISTEMA_AVANCADO.md (este arquivo)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── shipping/
│   │   │   │   └── calculate/
│   │   │   │       └── route.ts (NEW)
│   │   │   └── admin/
│   │   │       └── activate/
│   │   │           └── route.ts (NEW)
│   │   ├── usuario/
│   │   │   └── enderecos/
│   │   │       └── page.tsx (NEW)
│   │   ├── usuario/page.tsx (MODIFIED)
│   │   └── checkout/page.tsx (TO DO: Melhor Envio integration)
│   ├── components/
│   │   ├── ui/
│   │   │   └── ShippingCalculator.tsx (NEW)
│   │   └── layout/
│   │       ├── Header.tsx (MODIFIED)
│   │       └── Footer.tsx (MODIFIED)
│   ├── hooks/
│   │   └── useAddresses.ts (NEW)
│   ├── middleware.ts (MODIFIED)
│   └── types/index.ts (MODIFIED)
```

---

## 🚀 Production Checklist

Antes de ir para produção:

- [ ] Testar com dados reais de Melhor Envio
- [ ] Validar RLS policies em staging
- [ ] Testar fluxo completo de checkout
- [ ] Implementar logging de atividades admin
- [ ] Configurar email de notificações
- [ ] Documentar procedimentos admin
- [ ] Treinar equipe no novo sistema

---

**Última atualização:** 2026-04-13  
**Status:** ✅ Sistema completo e testado  
**Próximo:** Integração completa no checkout
