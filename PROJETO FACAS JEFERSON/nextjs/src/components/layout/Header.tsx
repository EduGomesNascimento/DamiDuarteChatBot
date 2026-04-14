'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

const NAV_LINKS = [
  { href: '/', label: '🏠 Home' },
  { href: '/categoria/facas', label: '⚔️ Facas' },
  { href: '/categoria/kits', label: '📦 Kits' },
  { href: '/categoria/acessorios', label: '🔧 Acessórios' },
  { href: '/categoria/promocoes', label: '🔥 Promoções', hot: true },
];

export default function Header() {
  const { totalQty } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [search, setSearch] = useState('');
  const router = useRouter();
  const supabase = createClient();

  // Check authentication
  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        // Try to get user name from users table
        const { data } = await supabase
          .from('users')
          .select('name')
          .eq('id', authUser.id)
          .single();

        if (data?.name) {
          setUserName(data.name);
        } else {
          setUserName(authUser.email?.split('@')[0] || 'Usuário');
        }
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserName('');
      } else {
        getUser();
      }
    });

    return () => subscription?.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Expose cart toggle globally for CartSidebar
  useEffect(() => {
    (window as any).__toggleCart = (v: boolean) => setCartOpen(v);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim().length >= 2) {
      router.push(`/categoria/todos?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-shadow duration-300',
        'bg-bg-primary/97 backdrop-blur-md border-b border-border',
        scrolled && 'shadow-2xl'
      )}
    >
      {/* Top bar */}
      <div className="bg-brand-red text-center py-1.5 text-xs font-semibold tracking-wide">
        🔥 FRETE GRÁTIS acima de R$299,90 &nbsp;|&nbsp; Cupom{' '}
        <strong>PRIMEIRACOMPRA</strong> = 5% OFF &nbsp;|&nbsp;
        <a href="tel:+5511999999999" className="hover:underline">📞 (11) 99999-9999</a>
      </div>

      {/* Main header */}
      <div className="max-w-screen-xl mx-auto px-4 flex items-center gap-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="text-2xl">⚔️</span>
          <div className="leading-none">
            <div className="font-display text-xl font-black tracking-wide">JEFERSON</div>
            <div className="text-[10px] tracking-[0.18em] text-brand-gold uppercase">Cutelaria Artesanal</div>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg relative hidden sm:block">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar facas, kits, acessórios..."
            maxLength={100}
            className="w-full px-4 py-2.5 pr-10 bg-bg-card border border-border rounded text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-colors"
          />
          <button type="submit" className="absolute right-0 top-0 bottom-0 px-3 text-gray-500 hover:text-brand-red transition-colors">
            🔍
          </button>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />

          {/* User Auth Section */}
          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 border border-border rounded text-sm text-gray-400 hover:border-brand-red hover:text-brand-red transition-all"
                >
                  👤 {userName}
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-bg-secondary border border-border rounded-lg shadow-xl z-40 min-w-48">
                    <Link
                      href="/usuario"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-400 hover:text-brand-red hover:bg-bg-card transition-colors border-b border-border"
                    >
                      👤 Meu Perfil
                    </Link>
                    <Link
                      href="/pedidos"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-400 hover:text-brand-red hover:bg-bg-card transition-colors border-b border-border"
                    >
                      📦 Meus Pedidos
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-brand-red hover:bg-bg-card transition-colors"
                    >
                      🚪 Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 border border-border rounded text-sm text-gray-400 hover:border-brand-red hover:text-brand-red transition-all"
            >
              👤 Entrar
            </Link>
          )}

          <button
            onClick={() => {
              const fn = (window as any).__toggleCart;
              if (typeof fn === 'function') fn(true);
            }}
            className="relative flex items-center justify-center bg-brand-red text-white w-10 h-10 rounded hover:bg-brand-red-dark transition-colors"
            aria-label="Carrinho"
          >
            🛒
            {totalQty > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand-gold text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {totalQty > 99 ? '99+' : totalQty}
              </span>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="sm:hidden flex flex-col gap-1.5 p-2"
            aria-label="Menu"
          >
            <span className={cn('w-5 h-0.5 bg-white transition-all', menuOpen && 'rotate-45 translate-y-2')} />
            <span className={cn('w-5 h-0.5 bg-white transition-all', menuOpen && 'opacity-0')} />
            <span className={cn('w-5 h-0.5 bg-white transition-all', menuOpen && '-rotate-45 -translate-y-2')} />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav
        className={cn(
          'bg-bg-secondary border-t border-border overflow-hidden transition-all duration-300',
          'sm:block',
          menuOpen ? 'max-h-96' : 'max-h-0 sm:max-h-none'
        )}
      >
        <ul className="max-w-screen-xl mx-auto px-4 flex flex-col sm:flex-row">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'block px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors',
                  'border-b sm:border-b-0 border-border',
                  'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-red after:scale-x-0 hover:after:scale-x-100 after:transition-transform',
                  link.hot && 'text-brand-red hover:text-brand-red'
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

    </header>
  );
}
