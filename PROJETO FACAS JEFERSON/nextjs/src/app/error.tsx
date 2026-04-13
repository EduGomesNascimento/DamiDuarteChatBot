'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg-primary">
      <div className="text-center">
        <h1 className="font-display text-4xl font-black text-primary mb-4">Oops! Algo deu errado</h1>
        <p className="text-secondary mb-8 max-w-md">
          {error.message || 'Desculpe, ocorreu um erro inesperado. Tente novamente.'}
        </p>
        <button
          onClick={() => reset()}
          className="btn-primary"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
