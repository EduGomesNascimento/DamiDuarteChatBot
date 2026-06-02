import Link from 'next/link'

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Atacado do Microcontrolador'
const cnpj = process.env.NEXT_PUBLIC_STORE_CNPJ || '00.000.000/0001-00'
const cidade = process.env.NEXT_PUBLIC_STORE_CITY || 'Portão - RS'

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface/50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary font-mono font-bold">
              μC
            </span>
            <span className="font-display font-bold">{storeName}</span>
          </div>
          <p className="mt-4 text-sm text-text-secondary">
            Microcontroladores, SBCs e componentes para makers, estudantes e engenheiros.
            Especificações honestas, entrega rápida no RS.
          </p>
        </div>

        <div>
          <h4 className="font-display font-semibold">Catálogo</h4>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li><Link href="/catalogo?categoria=st-arm" className="hover:text-primary">ST / ARM</Link></li>
            <li><Link href="/catalogo?categoria=esp-wifi" className="hover:text-primary">ESP / WiFi</Link></li>
            <li><Link href="/catalogo?categoria=arduino-avr" className="hover:text-primary">Arduino / AVR</Link></li>
            <li><Link href="/catalogo?categoria=raspberry-pi" className="hover:text-primary">Raspberry Pi</Link></li>
            <li><Link href="/catalogo?categoria=acessorios" className="hover:text-primary">Acessórios</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold">Conta</h4>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li><Link href="/auth" className="hover:text-primary">Entrar / Cadastrar</Link></li>
            <li><Link href="/minha-conta" className="hover:text-primary">Minha conta</Link></li>
            <li><Link href="/minha-conta/pedidos" className="hover:text-primary">Meus pedidos</Link></li>
            <li><Link href="/carrinho" className="hover:text-primary">Carrinho</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold">Contato</h4>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li>{cidade}</li>
            <li className="font-mono text-xs">CNPJ: {cnpj}</li>
            <li className="flex gap-3 pt-2">
              <a href="#" className="hover:text-primary">Instagram</a>
              <a href="#" className="hover:text-primary">YouTube</a>
              <a href="#" className="hover:text-primary">GitHub</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-text-secondary">
        © {new Date().getFullYear()} {storeName} · Feito com solda e café em {cidade}.
      </div>
    </footer>
  )
}
