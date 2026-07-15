import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, MapPin, Mail, Instagram, Phone } from 'lucide-react';
import { supabase } from '../../config/supabase';

export const Footer = () => {
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (data) setConfig(data);
    };
    fetchConfig();
  }, []);

  return (
    <footer className="bg-eco-dark text-eco-light/80 border-t border-eco-accent/20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div>
            <h3 className="text-eco-primary font-bold text-lg mb-4">{config.company_name || 'ECOTRAÇOS'}</h3>
            <p className="text-sm">Móveis de madeira sustentável feitos sob demanda com excelência e qualidade.</p>
            <div className="flex space-x-4 mt-4">
              <a href={config.instagram_url || '#'} target="_blank" rel="noreferrer" className="hover:text-eco-secondary">
                <Instagram size={20} />
              </a>
              <a href={config.whatsapp_number ? `https://wa.me/${config.whatsapp_number}` : '#'} target="_blank" rel="noreferrer" className="hover:text-eco-secondary">
                <Phone size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Contato</h3>
            <ul className="space-y-2 text-sm pr-4">
              <li className="flex gap-2">
                <MapPin size={16} className="text-eco-primary shrink-0 mt-1"/> 
                <span>{config.address || 'Endereço não definido'}</span>
              </li>
              <li className="flex items-center gap-2 mt-4">
                <Mail size={16} className="text-eco-primary shrink-0"/> 
                <span>{config.email_contact || 'contato@ecotracos.com'}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Desenvolvedor</h3>
            <p className="text-sm mb-2">Desenvolvido por <span className="font-bold text-eco-secondary">{config.developer_name || 'William Max'}</span></p>
            <div className="flex space-x-4 mt-2">
              <a href="https://github.com/WilliamM4x" target="_blank" rel="noreferrer" className="hover:text-white"><Github size={20} /></a>
              <a href="https://www.linkedin.com/in/william-max-7b8036140" target="_blank" rel="noreferrer" className="hover:text-white"><Linkedin size={20} /></a>
            </div>
          </div>
          
        </div>
        <div className="mt-8 border-t border-eco-accent/20 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>&copy; {new Date().getFullYear()} {config.company_name || 'Ecotraços'}. Todos os direitos reservados.</p>
          <div className="mt-4 md:mt-0 flex gap-4">
             <Link to="/privacidade" className="hover:text-eco-primary transition-colors text-gray-400">
               Política de Privacidade
             </Link>
             <Link to="/admin/login" className="hover:text-eco-primary transition-colors font-bold uppercase tracking-wider text-[10px] text-gray-500">
               Acesso Restrito
             </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
