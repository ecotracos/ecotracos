import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { Save, Search, Map } from 'lucide-react';

export const GerenciarConfig = () => {
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mapQuery, setMapQuery] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (data) {
      setConfig(data);
      if (data.address) {
        setMapQuery(data.address);
      }
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase.from('settings').update(config).eq('id', 1);
    
    setSaving(false);
    if (!error) {
      alert('Configurações salvas com sucesso!');
    } else {
      alert('Erro ao salvar.');
    }
  };

  const handleSearchMap = () => {
    setMapQuery(config.address || '');
  };

  if (loading) return <div className="p-8 text-gray-500">Carregando configurações...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Configurações Gerais</h1>
      
      <form onSubmit={saveConfig} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Identidade e Contato</h2>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nome da Empresa</label>
            <input name="company_name" value={config.company_name || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-mail de Contato</label>
            <input type="email" name="email_contact" value={config.email_contact || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mt-4">Redes Sociais</h2>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Link do Instagram</label>
            <input placeholder="https://instagram.com/..." name="instagram_url" value={config.instagram_url || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Número do WhatsApp (Apenas números)</label>
            <input placeholder="Ex: 5511999999999" name="whatsapp_number" value={config.whatsapp_number || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          </div>

          <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mt-4">Localização (Google Maps)</h2>
            <p className="text-sm text-gray-500 mt-2 mb-4">Digite o endereço físico e clique em "Buscar" para que o mapa encontre a localização que será exibida no rodapé.</p>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Endereço Físico (Busca no Mapa)</label>
            <div className="flex gap-2">
              <textarea 
                name="address" 
                value={config.address || ''} 
                onChange={handleChange} 
                rows={2} 
                placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP" 
                className="flex-grow p-2 border rounded-lg" 
              />
              <button 
                type="button" 
                onClick={handleSearchMap}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-4 rounded-lg border border-blue-200 transition-colors flex flex-col items-center justify-center gap-1 min-w-[120px]"
              >
                <Search size={20} />
                <span>Buscar</span>
              </button>
            </div>
            
            {mapQuery && (
              <div className="mt-4 border rounded-lg overflow-hidden bg-gray-50 p-4 shadow-inner">
                <div className="flex items-center gap-2 mb-3 text-eco-primary font-bold">
                  <Map size={18} />
                  <span>Preview do Mapa no Site:</span>
                </div>
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <iframe 
                    width="100%" 
                    height="250" 
                    style={{ border: 0 }} 
                    loading="lazy" 
                    allowFullScreen 
                    referrerPolicy="no-referrer-when-downgrade" 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          <div className="col-span-1 md:col-span-2 mt-6">
            <button type="submit" disabled={saving} className="bg-eco-primary hover:bg-eco-dark text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 w-full transition-colors">
              <Save size={20} /> {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
