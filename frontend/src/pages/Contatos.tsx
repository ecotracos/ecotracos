import React, { useEffect, useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { supabase } from '../config/supabase';

export const Contatos = () => {
  const [config, setConfig] = useState<any>({});
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (data) setConfig(data);
    };
    fetchConfig();
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação mínima de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Por favor, insira um endereço de e-mail válido (ex: seu@email.com).");
      return;
    }

    setEnviando(true);
    
    const { error } = await supabase.from('contact_messages').insert([{
      name: nome,
      email: email,
      message: mensagem
    }]);

    setEnviando(false);

    if (!error) {
      setSucesso(true);
      setNome('');
      setEmail('');
      setMensagem('');
      setTimeout(() => setSucesso(false), 5000);
    } else {
      alert('Erro ao enviar mensagem. Tente novamente mais tarde.');
    }
  };

  return (
    <div className="py-16 px-4 bg-eco-light">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-eco-dark mb-4">Fale Conosco</h1>
          <p className="text-lg text-eco-dark/70">Estamos prontos para desenhar o seu próximo móvel dos sonhos.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Informações e Mapa */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
              <h3 className="text-2xl font-bold text-eco-dark border-b border-eco-accent/20 pb-4">Informações</h3>
              
              <div className="flex items-start gap-4">
                <MapPin className="text-eco-primary mt-1 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-eco-dark">Endereço Físico</h4>
                  <p className="text-eco-dark/70 whitespace-pre-line">{config.address || 'Endereço não definido no painel'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Mail className="text-eco-primary mt-1 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-eco-dark">E-mail</h4>
                  <p className="text-eco-dark/70">{config.email_contact || 'E-mail não definido'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="text-eco-primary mt-1 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-eco-dark">WhatsApp</h4>
                  <p className="text-eco-dark/70">{config.whatsapp_number ? `+${config.whatsapp_number}` : 'Número não definido'}</p>
                </div>
              </div>
            </div>

            {/* Mapa Dinâmico do Google Maps Iframe */}
            <div className="bg-white p-2 rounded-2xl shadow-lg h-64 overflow-hidden relative border border-eco-accent/10">
              {config.address ? (
                <iframe 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(config.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, borderRadius: '0.75rem' }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade">
                </iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 rounded-xl">
                  Nenhum endereço configurado para gerar o mapa.
                </div>
              )}
            </div>
          </div>

          {/* Formulário de Email */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-eco-dark mb-6">Envie uma Mensagem</h3>
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-eco-dark mb-1">Nome Completo</label>
                <input required type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-eco-accent/30 focus:border-eco-primary focus:ring-2 focus:ring-eco-primary/20 outline-none transition-all" placeholder="Seu nome" />
              </div>
              <div>
                <label className="block text-sm font-medium text-eco-dark mb-1">Seu E-mail (Para retorno)</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-eco-accent/30 focus:border-eco-primary focus:ring-2 focus:ring-eco-primary/20 outline-none transition-all" placeholder="seu@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-eco-dark mb-1">Mensagem</label>
                <textarea required rows={5} value={mensagem} onChange={e => setMensagem(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-eco-accent/30 focus:border-eco-primary focus:ring-2 focus:ring-eco-primary/20 outline-none transition-all resize-none" placeholder="Como podemos ajudar?"></textarea>
              </div>
              
              {sucesso && (
                <div className="bg-green-100 text-green-700 p-4 rounded-lg text-sm font-bold border border-green-200">
                  Mensagem enviada com sucesso! Em breve entraremos em contato.
                </div>
              )}

              <button type="submit" disabled={enviando || sucesso} className="w-full bg-eco-primary hover:bg-eco-dark disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors shadow-lg">
                {enviando ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
