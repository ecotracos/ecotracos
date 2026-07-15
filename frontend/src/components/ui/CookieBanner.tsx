import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Checa se o usuário já aceitou
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Pequeno delay para aparecer de forma suave
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[100] transform transition-transform duration-500 ease-in-out">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600 flex-1">
          <p>
            <strong>Aviso de Cookies e Privacidade:</strong> Utilizamos cookies e dados de navegação para aprimorar sua experiência e garantir o funcionamento seguro do nosso site. 
            Ao continuar navegando, você concorda com a nossa{' '}
            <Link to="/privacidade" className="text-eco-primary hover:underline font-bold">Política de Privacidade (LGPD)</Link>.
          </p>
        </div>
        <div className="flex-shrink-0 w-full md:w-auto flex flex-col md:flex-row gap-3">
          <button 
            onClick={handleDecline}
            className="w-full md:w-auto text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Recusar
          </button>
          <button 
            onClick={handleAccept}
            className="w-full md:w-auto bg-eco-primary hover:bg-eco-dark text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <Check size={18} /> Aceitar e Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
