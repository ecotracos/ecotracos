import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { MailOpen, Mail, Clock, Trash2, CheckCircle, Copy } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'Em aberto' | 'Em andamento' | 'Respondido';
  created_at: string;
  updated_at?: string;
  updated_by_email?: string;
}

export const GerenciarMensagens = () => {
  const { role, user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setMessages(data as ContactMessage[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const updatedData = {
      status: newStatus,
      updated_at: new Date().toISOString(),
      updated_by_email: user?.email
    };

    const { error } = await supabase
      .from('contact_messages')
      .update(updatedData)
      .eq('id', id);
      
    if (!error) {
      setMessages(messages.map(m => m.id === id ? { ...m, ...updatedData } as any : m));
      // Notifica o menu lateral (AdminLayout) para atualizar o contador
      window.dispatchEvent(new Event('messages_updated'));
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Conteúdo copiado para a área de transferência!');
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta mensagem definitivamente?')) return;
    
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);
      
    if (!error) {
      setMessages(messages.filter(m => m.id !== id));
      window.dispatchEvent(new Event('messages_updated'));
    } else {
      alert('Erro ao excluir mensagem.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Em aberto':
        return <span className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold"><Mail size={14}/> Aberto</span>;
      case 'Em andamento':
        return <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold"><Clock size={14}/> Em andamento</span>;
      case 'Respondido':
        return <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle size={14}/> Respondido</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Caixa de Entrada</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando mensagens...</div>
        ) : messages.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <MailOpen size={48} className="text-gray-300 mb-4" />
            <p className="text-lg font-medium">Sua caixa de entrada está vazia.</p>
            <p className="text-sm">Nenhuma mensagem foi recebida pelo site ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-600 w-1/4">Cliente</th>
                  <th className="p-4 font-bold text-gray-600 w-2/4">Mensagem</th>
                  <th className="p-4 font-bold text-gray-600 w-1/4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 align-top">
                      <p className="font-bold text-gray-800">{msg.name}</p>
                      <a href={`mailto:${msg.email}`} className="text-sm text-blue-500 hover:underline">{msg.email}</a>
                      <p className="text-xs text-gray-400 mt-2">{new Date(msg.created_at).toLocaleString('pt-BR')}</p>
                    </td>
                    
                    <td className="p-4 align-top">
                      <div className="relative group">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">
                          {msg.message}
                        </div>
                        <button 
                          onClick={() => handleCopy(msg.message)}
                          className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 text-gray-500 rounded hover:bg-gray-100 hover:text-eco-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          title="Copiar mensagem"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </td>
                    
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500 font-bold uppercase">Status:</label>
                          {getStatusBadge(msg.status)}
                        </div>
                        
                        <select 
                          value={msg.status}
                          onChange={(e) => updateStatus(msg.id, e.target.value)}
                          className="w-full text-sm p-2 border rounded-lg bg-white mb-1"
                        >
                          <option value="Em aberto">Marcar como Em aberto</option>
                          <option value="Em andamento">Marcar como Em andamento</option>
                          <option value="Respondido">Marcar como Respondido</option>
                        </select>
                        
                        {msg.updated_at && (
                          <div className="text-[10px] text-gray-500 bg-gray-100 p-2 rounded border border-gray-200">
                            <p><strong>Última alteração:</strong> {new Date(msg.updated_at).toLocaleString('pt-BR')}</p>
                            <p><strong>Por:</strong> {msg.updated_by_email || 'Desconhecido'}</p>
                          </div>
                        )}

                        {/* Botão de Deletar apenas para Admin */}
                        {role === 'admin' && (
                          <button 
                            onClick={() => deleteMessage(msg.id)}
                            className="mt-2 text-xs flex items-center justify-center gap-1 text-red-600 hover:bg-red-50 p-2 rounded-lg border border-red-200 transition-colors"
                          >
                            <Trash2 size={14} /> Excluir Mensagem
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
