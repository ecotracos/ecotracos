import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '../../config/supabase';

export const FloatWhatsAppButton = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('5511999999999'); 

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from('settings').select('whatsapp_number').eq('id', 1).single();
      if (data && data.whatsapp_number) {
        // Remove tudo que não for número (parênteses, traços, espaços)
        setWhatsappNumber(data.whatsapp_number.replace(/\D/g, ''));
      } else if (error) {
        console.error('Erro ao buscar whatsapp:', error.message);
      }
    };
    fetchSettings();
  }, []);

  const message = encodeURIComponent('Olá! Gostaria de saber mais sobre os móveis da Ecotraços.');

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 hover:scale-110 hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center group"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle size={32} />
      <span className="absolute right-16 bg-white text-gray-800 text-sm px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        Fale Conosco!
      </span>
    </a>
  );
};
