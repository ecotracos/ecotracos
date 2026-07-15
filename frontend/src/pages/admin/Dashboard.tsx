import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const Dashboard = () => {
  const { user, role } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Visão Geral</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-eco-dark mb-2">Bem-vindo(a), {user?.email}</h2>
        <p className="text-gray-600 mb-4">Você está logado no painel da Ecotraços.</p>
        
        <div className="inline-block bg-eco-light/50 border border-eco-primary/30 px-4 py-2 rounded-lg text-eco-dark font-medium">
          Nível de Acesso atual: <span className="font-bold text-eco-primary">{role === 'admin' ? 'Administrador Total' : (role || 'Não definido / Funcionário')}</span>
        </div>
      </div>
    </div>
  );
};
