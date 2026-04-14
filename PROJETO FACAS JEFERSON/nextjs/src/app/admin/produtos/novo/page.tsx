'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = ['facas', 'kits', 'acessorios'];
const BADGE_TYPES = [
  { value: 'red', label: 'Vermelho' },
  { value: 'gold', label: 'Dourado' },
  { value: 'dark', label: 'Escuro' },
];

interface ImagePreview {
  file: File;
  url: string;         // local blob URL for preview
  uploaded?: string;   // final storage URL after upload
  uploading?: boolean;
  error?: boolean;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [form, setForm] = useState({
    name: '',
    description: '',
    short_name: '',
    slug: '',
    category: 'facas',
    price: 0,
    original_price: 0,
    cost_price: 0,
    sku: '',
    stock: 0,
    weight: 0,
    height: 0,
    width: 0,
    length: 0,
    badge: '',
    badge_type: 'red',
    featured: false,
    active: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target as any;
    const isCheckbox = type === 'checkbox';
    setForm(f => ({
      ...f,
      [name]: type === 'number'
        ? parseFloat(value) || 0
        : isCheckbox
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setForm(f => ({ ...f, name, slug }));
  };

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid = arr.filter(f => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} não é uma imagem`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} é maior que 5MB`);
        return false;
      }
      return true;
    });

    const previews: ImagePreview[] = valid.map(file => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages(prev => [...prev, ...previews].slice(0, 10)); // max 10 images
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveImage = (from: number, to: number) => {
    setImages(prev => {
      const updated = [...prev];
      const [item] = updated.splice(from, 1);
      updated.splice(to, 0, item);
      return updated;
    });
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      // Already uploaded
      if (img.uploaded) {
        urls.push(img.uploaded);
        continue;
      }

      setImages(prev => prev.map((p, idx) => idx === i ? { ...p, uploading: true } : p));

      try {
        const ext = img.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const path = `products/${fileName}`;

        const { error } = await supabase.storage
          .from('product-images')
          .upload(path, img.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(path);

        urls.push(publicUrl);
        setImages(prev => prev.map((p, idx) => idx === i ? { ...p, uploading: false, uploaded: publicUrl } : p));
      } catch (err) {
        console.error('Upload failed for', img.file.name, err);
        setImages(prev => prev.map((p, idx) => idx === i ? { ...p, uploading: false, error: true } : p));
        toast.error(`Falha ao enviar ${img.file.name}`);
      }
    }

    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast.error('Nome e slug são obrigatórios');
      return;
    }

    setLoading(true);

    try {
      // Upload images first
      const imageUrls = await uploadImages();

      const { error } = await supabase.from('products').insert({
        ...form,
        image: imageUrls[0] || '',           // primeira = principal
        images: imageUrls,
        tags: [],
      });

      if (error) throw error;

      toast.success('Produto criado com sucesso!');
      router.push('/admin/produtos');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-bg-primary">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/produtos" className="text-secondary hover:text-primary">← Voltar</Link>
          <h1 className="font-display text-3xl font-black text-primary">Novo Produto</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Fotos ─────────────────────────────────────── */}
          <div className="card-dark p-6 border border-border">
            <h2 className="text-lg font-bold text-primary mb-1">📸 Fotos do Produto</h2>
            <p className="text-xs text-secondary mb-4">
              A <strong>primeira foto</strong> é a imagem principal. Máx. 10 fotos, 5MB cada. JPG, PNG ou WebP.
            </p>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all mb-4
                ${dragOver
                  ? 'border-brand-red bg-brand-red/10'
                  : 'border-border hover:border-brand-red/50 hover:bg-bg-card'}
              `}
            >
              <div className="text-4xl mb-2">📷</div>
              <p className="text-primary font-semibold">Clique ou arraste fotos aqui</p>
              <p className="text-xs text-secondary mt-1">JPG, PNG, WebP — máx 5MB cada</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {/* Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {images.map((img, i) => (
                  <div key={img.url} className="relative group">
                    <div className={`
                      aspect-square rounded-lg overflow-hidden border-2 transition-all
                      ${i === 0 ? 'border-brand-gold' : 'border-border'}
                    `}>
                      <Image
                        src={img.url}
                        alt={`Foto ${i + 1}`}
                        width={120}
                        height={120}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                      {img.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <span className="text-white text-xs">Enviando...</span>
                        </div>
                      )}
                      {img.error && (
                        <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center rounded-lg">
                          <span className="text-white text-xs">Erro</span>
                        </div>
                      )}
                      {img.uploaded && (
                        <div className="absolute bottom-1 right-1 bg-green-600 rounded-full w-4 h-4 flex items-center justify-center">
                          <span className="text-white text-[10px]">✓</span>
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    {i === 0 && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-brand-gold text-black text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                        PRINCIPAL
                      </span>
                    )}

                    {/* Controls */}
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-700"
                        title="Remover"
                      >
                        ×
                      </button>
                    </div>

                    {/* Move controls */}
                    {images.length > 1 && (
                      <div className="flex gap-1 mt-1">
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImage(i, i - 1)}
                            className="flex-1 text-[10px] bg-bg-card border border-border rounded py-0.5 text-secondary hover:text-primary"
                            title="Mover para esquerda"
                          >
                            ←
                          </button>
                        )}
                        {i < images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveImage(i, i + 1)}
                            className="flex-1 text-[10px] bg-bg-card border border-border rounded py-0.5 text-secondary hover:text-primary"
                            title="Mover para direita"
                          >
                            →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Add more button */}
                {images.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-brand-red/50 flex items-center justify-center text-secondary hover:text-primary transition-all"
                  >
                    <span className="text-2xl">+</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Informações Básicas ────────────────────────── */}
          <div className="card-dark p-6 border border-border">
            <h2 className="text-lg font-bold text-primary mb-4">📝 Informações Básicas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="form-label">Nome do Produto *</label>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={handleNameChange}
                  className="form-input"
                  placeholder="Ex: Faca Bowie Artesanal"
                />
              </div>
              <div>
                <label className="form-label">Slug (URL) *</label>
                <input
                  required
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="form-input font-mono text-sm"
                  placeholder="faca-bowie-artesanal"
                />
              </div>
              <div>
                <label className="form-label">SKU</label>
                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  className="form-input font-mono"
                  placeholder="CJ-001"
                />
              </div>
              <div className="col-span-2">
                <label className="form-label">Nome Curto</label>
                <input
                  name="short_name"
                  value={form.short_name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Nome para exibição compacta"
                />
              </div>
              <div className="col-span-2">
                <label className="form-label">Descrição</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="form-input resize-none h-24"
                  placeholder="Descrição detalhada do produto..."
                />
              </div>
            </div>
          </div>

          {/* ── Preços ─────────────────────────────────────── */}
          <div className="card-dark p-6 border border-border">
            <h2 className="text-lg font-bold text-primary mb-4">💰 Preços</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="form-label">Preço de Venda *</label>
                <input
                  required
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Preço Original (riscado)</label>
                <input
                  name="original_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.original_price}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Custo</label>
                <input
                  name="cost_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.cost_price}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* ── Estoque e Categoria ────────────────────────── */}
          <div className="card-dark p-6 border border-border">
            <h2 className="text-lg font-bold text-primary mb-4">📦 Estoque e Categoria</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Estoque *</label>
                <input
                  required
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Categoria *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="form-input"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Dimensões para Frete ───────────────────────── */}
          <div className="card-dark p-6 border border-border">
            <h2 className="text-lg font-bold text-primary mb-1">📐 Dimensões para Frete</h2>
            <p className="text-xs text-secondary mb-4">Necessário para cálculo correto de frete via Melhor Envio</p>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="form-label">Peso (kg)</label>
                <input name="weight" type="number" step="0.01" min="0" value={form.weight} onChange={handleChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Altura (cm)</label>
                <input name="height" type="number" step="0.1" min="0" value={form.height} onChange={handleChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Largura (cm)</label>
                <input name="width" type="number" step="0.1" min="0" value={form.width} onChange={handleChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Comprimento (cm)</label>
                <input name="length" type="number" step="0.1" min="0" value={form.length} onChange={handleChange} className="form-input" />
              </div>
            </div>
          </div>

          {/* ── Exibição ──────────────────────────────────── */}
          <div className="card-dark p-6 border border-border">
            <h2 className="text-lg font-bold text-primary mb-4">🏷️ Exibição</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Badge (ex: Mais Vendido)</label>
                <input
                  name="badge"
                  value={form.badge}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Kit Premium"
                />
              </div>
              <div>
                <label className="form-label">Cor do Badge</label>
                <select name="badge_type" value={form.badge_type} onChange={handleChange} className="form-input">
                  {BADGE_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-6 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4" />
                <span className="text-sm text-secondary">⭐ Destacado na home</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="w-4 h-4" />
                <span className="text-sm text-secondary">✅ Produto Ativo</span>
              </label>
            </div>
          </div>

          {/* ── Botões ─────────────────────────────────────── */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 justify-center py-3 disabled:opacity-50"
            >
              {loading
                ? images.some(i => i.uploading)
                  ? '📤 Enviando fotos...'
                  : '💾 Criando produto...'
                : '✓ Criar Produto'}
            </button>
            <Link href="/admin/produtos" className="btn-outline flex-1 text-center py-3">
              Cancelar
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}
