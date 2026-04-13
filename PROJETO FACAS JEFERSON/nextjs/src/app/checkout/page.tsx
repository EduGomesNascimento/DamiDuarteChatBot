'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { formatBRL, calcFreight, FRETE_GRATIS_MIN } from '@/lib/utils';

type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

interface PixData {
  qrCode: string;
  qrCodeImage: string;
  orderId: string;
}

interface BoletoData {
  boletoBarcode: string;
  boletoPdfLink: string;
  orderId: string;
  dueDate: string;
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [boletoData, setBoletoData] = useState<BoletoData | null>(null);

  const [form, setForm] = useState({
    name: '', email: '', cpf: '', phone: '',
    cep: '', address: '', number: '', complement: '',
    neighborhood: '', city: '', state: '',
    paymentMethod: 'pix' as PaymentMethod,
  });

  const freight = calcFreight(subtotal);
  const total = subtotal + freight;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Auto-fill address from CEP
  const handleCep = async (cep: string) => {
    setForm(f => ({ ...f, cep }));
    const clean = cep.replace(/\D/g, '');
    if (clean.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm(f => ({
            ...f,
            address: data.logradouro || f.address,
            neighborhood: data.bairro || f.neighborhood,
            city: data.localidade || f.city,
            state: data.uf || f.state,
          }));
        }
      } catch {}
    }
  };

  // CPF mask
  const maskCpf = (v: string) => {
    return v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').substring(0, 14);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) { toast.error('Carrinho vazio'); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        items: items.map(i => ({
          id: i.product.id,
          name: i.product.name,
          quantity: i.qty,
          price: i.product.price,
        })),
      };

      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao processar pagamento');

      if (data.method === 'pix') {
        setPixData({ qrCode: data.qrCode, qrCodeImage: data.qrCodeImage, orderId: data.orderId });
        clear();
        toast.success('PIX gerado! Escaneie o QR Code.');
      } else if (data.method === 'boleto') {
        setBoletoData({
          boletoBarcode: data.boletoBarcode,
          boletoPdfLink: data.boletoPdfLink,
          orderId: data.orderId,
          dueDate: data.dueDate,
        });
        clear();
        toast.success('Boleto gerado!');
      } else {
        clear();
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao finalizar compra');
    } finally {
      setLoading(false);
    }
  };

  // ---- PIX Result Screen ----
  if (pixData) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4">
        <div className="max-w-lg mx-auto card-dark p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="font-display text-3xl font-black text-primary mb-2">Pagamento via PIX</h1>
          <p className="text-secondary text-sm mb-6">Escaneie o QR Code ou copie o código abaixo. Pedido: <span className="text-brand-gold font-bold">{pixData.orderId}</span></p>

          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-lg">
              {pixData.qrCodeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pixData.qrCodeImage} alt="QR Code PIX" className="w-56 h-56" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-secondary text-sm">QR Code</div>
              )}
            </div>
          </div>

          {pixData.qrCode && (
            <div className="mb-6">
              <p className="text-xs text-secondary mb-2">Copia e Cola:</p>
              <div className="flex gap-2">
                <input readOnly value={pixData.qrCode} className="flex-1 form-input text-xs" />
                <button
                  onClick={() => { navigator.clipboard.writeText(pixData.qrCode); toast.success('Copiado!'); }}
                  className="btn-primary text-xs px-4"
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-secondary mb-4">O PIX expira em 30 minutos. Após o pagamento, seu pedido será confirmado automaticamente.</p>
          <Link href="/" className="text-brand-red text-sm font-bold hover:underline">← Voltar para a loja</Link>
        </div>
      </div>
    );
  }

  // ---- Boleto Result Screen ----
  if (boletoData) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4">
        <div className="max-w-lg mx-auto card-dark p-8 text-center">
          <div className="text-5xl mb-4">📄</div>
          <h1 className="font-display text-3xl font-black text-primary mb-2">Boleto Gerado</h1>
          <p className="text-secondary text-sm mb-6">Pedido: <span className="text-brand-gold font-bold">{boletoData.orderId}</span> — Vencimento: {boletoData.dueDate}</p>

          {boletoData.boletoBarcode && (
            <div className="mb-6">
              <p className="text-xs text-secondary mb-2">Código de barras:</p>
              <div className="flex gap-2">
                <input readOnly value={boletoData.boletoBarcode} className="flex-1 form-input text-xs" />
                <button
                  onClick={() => { navigator.clipboard.writeText(boletoData.boletoBarcode); toast.success('Copiado!'); }}
                  className="btn-primary text-xs px-4"
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          {boletoData.boletoPdfLink && (
            <a href={boletoData.boletoPdfLink} target="_blank" rel="noopener noreferrer" className="btn-primary inline-block mb-4">
              Baixar Boleto PDF
            </a>
          )}

          <p className="text-xs text-secondary mb-4">O pagamento será confirmado em até 2 dias úteis após o pagamento.</p>
          <Link href="/" className="text-brand-red text-sm font-bold hover:underline">← Voltar para a loja</Link>
        </div>
      </div>
    );
  }

  // ---- Checkout Form ----
  return (
    <div className="min-h-screen pt-32 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-3xl font-black text-primary mb-8">🔒 Checkout Seguro</h1>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">

            {/* Dados Pessoais */}
            <div className="card-dark p-6">
              <h2 className="text-lg font-bold text-primary mb-4">Dados Pessoais</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="form-label">Nome Completo</label>
                  <input required name="name" value={form.name} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">E-mail</label>
                  <input required type="email" name="email" value={form.email} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">CPF</label>
                  <input required name="cpf" value={form.cpf} onChange={e => setForm({ ...form, cpf: maskCpf(e.target.value) })} className="form-input" placeholder="000.000.000-00" maxLength={14} />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Telefone</label>
                  <input required name="phone" value={form.phone} onChange={handleChange} className="form-input" placeholder="(11) 99999-9999" />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="card-dark p-6">
              <h2 className="text-lg font-bold text-primary mb-4">Endereço de Entrega</h2>
              <div className="grid sm:grid-cols-6 gap-4">
                <div className="sm:col-span-2">
                  <label className="form-label">CEP</label>
                  <input required name="cep" value={form.cep} onChange={e => handleCep(e.target.value)} className="form-input" placeholder="00000-000" />
                </div>
                <div className="sm:col-span-4">
                  <label className="form-label">Rua</label>
                  <input required name="address" value={form.address} onChange={handleChange} className="form-input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Número</label>
                  <input required name="number" value={form.number} onChange={handleChange} className="form-input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Complemento</label>
                  <input name="complement" value={form.complement} onChange={handleChange} className="form-input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Bairro</label>
                  <input required name="neighborhood" value={form.neighborhood} onChange={handleChange} className="form-input" />
                </div>
                <div className="sm:col-span-4">
                  <label className="form-label">Cidade</label>
                  <input required name="city" value={form.city} onChange={handleChange} className="form-input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">UF</label>
                  <input required name="state" value={form.state} onChange={handleChange} className="form-input" maxLength={2} />
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="card-dark p-6">
              <h2 className="text-lg font-bold text-primary mb-4">Forma de Pagamento</h2>
              <div className="space-y-3">
                {([
                  { value: 'pix', label: 'PIX', desc: 'Aprovação imediata', icon: '⚡' },
                  { value: 'credit_card', label: 'Cartão de Crédito/Débito', desc: 'Até 12x sem juros', icon: '💳' },
                  { value: 'boleto', label: 'Boleto Bancário', desc: 'Vencimento em 3 dias', icon: '📄' },
                ] as const).map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      form.paymentMethod === opt.value
                        ? 'border-brand-red bg-brand-red/5'
                        : 'border-border hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.value}
                      checked={form.paymentMethod === opt.value}
                      onChange={handleChange}
                      className="w-4 h-4 accent-[#c41230]"
                    />
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <div className="font-bold text-primary text-sm">{opt.label}</div>
                      <div className="text-xs text-secondary">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !items.length}
              className="btn-primary w-full justify-center text-center py-4 text-base disabled:opacity-50"
            >
              {loading ? 'Processando...' : '🔒 Finalizar Compra'}
            </button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="card-dark p-6 sticky top-28">
              <h2 className="text-lg font-bold text-primary mb-4 pb-3 border-b border-border">Resumo do Pedido</h2>

              {items.length === 0 ? (
                <p className="text-secondary text-sm">Carrinho vazio</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {items.map(({ product, qty }) => (
                      <div key={product.id} className="flex gap-3">
                        <div className="w-14 h-14 bg-white rounded flex-shrink-0 relative">
                          <Image src={product.image} alt={product.name} fill className="object-contain p-1" sizes="56px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-primary line-clamp-1">{product.shortName}</p>
                          <p className="text-xs text-secondary">Qtd: {qty}</p>
                        </div>
                        <p className="text-sm font-bold text-brand-red whitespace-nowrap">{formatBRL(product.price * qty)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-3 space-y-2 text-sm">
                    <div className="flex justify-between text-secondary">
                      <span>Subtotal</span><span className="text-primary">{formatBRL(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-secondary">
                      <span>Frete</span>
                      <span className={freight === 0 ? 'text-green-400 font-semibold' : 'text-primary'}>
                        {freight === 0 ? 'GRÁTIS 🎉' : formatBRL(freight)}
                      </span>
                    </div>
                    {subtotal < FRETE_GRATIS_MIN && (
                      <p className="text-xs text-secondary">Frete grátis acima de {formatBRL(FRETE_GRATIS_MIN)}</p>
                    )}
                    <div className="flex justify-between font-black text-lg text-primary pt-3 border-t border-border">
                      <span>Total</span><span className="text-brand-red">{formatBRL(total)}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-6 space-y-2 text-xs text-secondary">
                <div className="flex items-center gap-2"><span className="text-brand-gold">🔒</span> Pagamento 100% seguro via PagBank</div>
                <div className="flex items-center gap-2"><span className="text-brand-gold">✓</span> Seus dados são criptografados</div>
                <div className="flex items-center gap-2"><span className="text-brand-gold">✓</span> Dados do cartão não ficam conosco</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
