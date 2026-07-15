import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';

export const GerenciarFAQ = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    const { data } = await supabase.from('faqs').select('*').order('created_at', { ascending: false });
    if (data) setFaqs(data);
    setLoading(false);
  };

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('faqs').update({ is_visible: !currentStatus }).eq('id', id);
    if (!error) setFaqs(faqs.map(f => f.id === id ? { ...f, is_visible: !currentStatus } : f));
  };

  const deleteFaq = async (id: string) => {
    if(!window.confirm('Excluir esta pergunta?')) return;
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (!error) setFaqs(faqs.filter(f => f.id !== id));
  };

  const openModal = (faq: any = null) => {
    if (faq) {
      setEditingId(faq.id);
      setQuestion(faq.question);
      setAnswer(faq.answer);
    } else {
      setEditingId(null);
      setQuestion('');
      setAnswer('');
    }
    setIsModalOpen(true);
  };

  const saveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from('faqs').update({ question, answer }).eq('id', editingId);
      if (!error) fetchFaqs();
    } else {
      const { error } = await supabase.from('faqs').insert([{ question, answer, is_visible: true }]);
      if (!error) fetchFaqs();
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar FAQ</h1>
        <button onClick={() => openModal()} className="bg-eco-primary hover:bg-eco-dark text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} /> Nova Pergunta
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : faqs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhuma pergunta cadastrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-600">Pergunta</th>
                  <th className="p-4 font-bold text-gray-600">Status</th>
                  <th className="p-4 font-bold text-gray-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((faq) => (
                  <tr key={faq.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{faq.question}</td>
                    <td className="p-4">
                      <button onClick={() => toggleVisibility(faq.id, faq.is_visible)} className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${faq.is_visible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {faq.is_visible ? <><Eye size={14} /> Visível</> : <><EyeOff size={14} /> Oculto</>}
                      </button>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => openModal(faq)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => deleteFaq(faq.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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
              <h2 className="text-xl font-bold">{editingId ? 'Editar Pergunta' : 'Nova Pergunta'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500"><X size={24} /></button>
            </div>
            <form onSubmit={saveFaq} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pergunta</label>
                <input required value={question} onChange={e => setQuestion(e.target.value)} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resposta</label>
                <textarea required value={answer} onChange={e => setAnswer(e.target.value)} rows={4} className="w-full p-2 border rounded-lg" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-white bg-eco-primary hover:bg-eco-dark rounded-lg font-bold flex items-center gap-2"><Save size={18}/> Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
