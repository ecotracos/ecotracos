import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-bold text-eco-primary mb-4">404</h1>
      <h2 className="text-3xl font-bold text-eco-dark mb-4">Página não encontrada</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        A página que você está procurando não existe, foi removida ou o link está incorreto.
      </p>
      
      <Link 
        to="/" 
        className="bg-eco-primary hover:bg-eco-dark text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
      >
        <Home size={20} />
        Voltar para a Página Inicial
      </Link>
    </div>
  );
};
