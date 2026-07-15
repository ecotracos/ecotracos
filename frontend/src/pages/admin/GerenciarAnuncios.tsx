import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Link as LinkIcon, UploadCloud } from 'lucide-react';

export const GerenciarAnuncios = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [hasLink, setHasLink] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
          const { data } = await supabase.from('hero_banners').select('*').order('created_at', { ascending: false });
    if (data) setAds(data);
    setLoading(false);
  };

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('hero_banners').update({ is_visible: !currentStatus }).eq('id', id);
    if (!error) setAds(ads.map(a => a.id === id ? { ...a, is_visible: !currentStatus } : a));
  };

  const deleteAd = async (id: string) => {
    if(!window.confirm('Excluir este anúncio do carrossel?')) return;
    const { error } = await supabase.from('hero_banners').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir: ' + error.message);
    } else {
      setAds(ads.filter(a => a.id !== id));
    }
  };
  const openModal = (ad: any = null) => {
    if (ad) {
      setEditingId(ad.id);
      setTitle(ad.title || '');
      setImageUrl(ad.image_url);
      setLinkUrl(ad.link_url || '');
      setHasLink(!!ad.link_url);
    } else {
      setEditingId(null);
      setTitle('');
      setImageUrl('');
      setLinkUrl('');
      setHasLink(false);
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);

    if (uploadError) {
      alert('Erro ao fazer upload da imagem: ' + uploadError.message);
    } else {
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
      setImageUrl(publicUrlData.publicUrl);
    }
    setUploadingImage(false);
    e.target.value = '';
  };
  const saveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Faça o upload de uma imagem primeiro.');
      return;
    }

    const payload = { 
      title, 
      image_url: imageUrl, 
      link_url: hasLink ? linkUrl : null 
    };

    if (editingId) {
      const { error } = await supabase.from('hero_banners').update(payload).eq('id', editingId);
      if (error) {
        alert('Erro ao atualizar: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from('hero_banners').insert([{ ...payload, is_visible: true }]);
      if (error) {
        alert('Erro ao criar: ' + error.message);
        return;
      }
    }
    
    fetchAds();
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Anúncios (Carrossel)</h1>
        <button onClick={() => openModal()} className="bg-eco-primary hover:bg-eco-dark text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} /> Adicionar Imagem
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : ads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum anúncio/imagem no carrossel.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-600">Imagem</th>
                  <th className="p-4 font-bold text-gray-600">Título</th>
                  <th className="p-4 font-bold text-gray-600">Link</th>
                  <th className="p-4 font-bold text-gray-600">Status</th>
                  <th className="p-4 font-bold text-gray-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr key={ad.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <img src={ad.image_url} alt={ad.title} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    </td>
                    <td className="p-4 font-medium text-gray-800">{ad.title || '-'}</td>
                    <td className="p-4 text-gray-500 text-sm">{ad.link_url ? <a href={ad.link_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1"><LinkIcon size={14}/> Acessar</a> : '-'}</td>
                    <td className="p-4">
                      <button onClick={() => toggleVisibility(ad.id, ad.is_visible)} className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${ad.is_visible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ad.is_visible ? <><Eye size={14} /> Visível</> : <><EyeOff size={14} /> Oculto</>}
                      </button>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2 items-center h-full">
                      <button onClick={() => openModal(ad)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => deleteAd(ad.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingId ? 'Editar Anúncio' : 'Novo Anúncio'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500"><X size={24} /></button>
            </div>
            <form onSubmit={saveAd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Imagem do Anúncio</label>
                {imageUrl ? (
                  <div className="relative mb-2 inline-block">
                    <img src={imageUrl} alt="Preview" className="w-full max-h-40 object-cover rounded-lg border" />
                    <button type="button" onClick={() => setImageUrl('')} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow"><X size={16}/></button>
                  </div>
                ) : (
                  <label className={`cursor-pointer w-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                    <UploadCloud size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 font-medium">{uploadingImage ? 'Enviando...' : 'Clique para fazer upload'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploadingImage} />
                  </label>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Título (Opcional)</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-lg" />
              </div>
              
              <div className="flex items-center gap-2">
                <input type="checkbox" id="hasLink" checked={hasLink} onChange={e => setHasLink(e.target.checked)} className="rounded text-eco-primary focus:ring-eco-primary" />
                <label htmlFor="hasLink" className="text-sm font-medium">Adicionar link de redirecionamento</label>
              </div>

              {hasLink && (
                <div>
                  <label className="block text-sm font-medium mb-1">URL do Link</label>
                  <input required type="text" placeholder="Ex: /loja ou https://..." value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="w-full p-2 border rounded-lg" />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold">Cancelar</button>
                <button type="submit" disabled={uploadingImage} className="px-4 py-2 text-white bg-eco-primary hover:bg-eco-dark rounded-lg font-bold flex items-center gap-2"><Save size={18}/> Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
