import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import { Save } from 'lucide-react';

export const Perfil = () => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) setMessage('Erro ao atualizar a senha.');
    else {
      setMessage('Senha atualizada com sucesso!');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Meu Perfil</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">E-mail</label>
          <input 
            type="text" 
            disabled 
            value={user?.email || ''} 
            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" 
          />
          <p className="text-xs text-gray-500 mt-1">O e-mail é vinculado à sua conta do Google ou provedor original e não pode ser alterado por aqui.</p>
        </div>

        <div className="border-t pt-6 mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Alterar Senha</h2>
          
          {message && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-bold ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={updatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Nova Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-eco-primary" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="bg-eco-primary hover:bg-eco-dark text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
            >
              <Save size={18} /> {loading ? 'Atualizando...' : 'Atualizar Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
