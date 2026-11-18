import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg-primary">
      <div className="text-center">
        <h1 className="font-display text-6xl font-black text-primary mb-2">404</h1>
        <p className="text-secondary text-xl mb-8">Página não encontrada</p>
        <Link href="/" className="btn-primary">
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
