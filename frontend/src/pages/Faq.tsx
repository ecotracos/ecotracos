import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Faq {
  id: string;
  question: string;
  answer: string;
}

export const Faq = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await supabase.from('faqs').select('*').eq('is_visible', true).order('created_at', { ascending: true });
      if (data) {
        setFaqs(data);
      }
      setLoading(false);
    };
    fetchFaqs();
  }, []);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-eco-dark mb-4">Perguntas Frequentes</h1>
        <p className="text-gray-600">Tire suas dúvidas sobre nossos móveis e processos de produção sustentável.</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Carregando perguntas...</div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-eco-accent/20 overflow-hidden">
              <button 
                onClick={() => toggleAccordion(index)}
                className="w-full text-left p-6 flex justify-between items-center focus:outline-none hover:bg-eco-light/30 transition-colors"
              >
                <h3 className="font-bold text-lg text-eco-dark">{faq.question}</h3>
                <span className="text-eco-primary flex-shrink-0 ml-4">
                  {openIndex === index ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </span>
              </button>
              
              <div 
                className={`px-6 pb-6 text-gray-600 transition-all duration-300 ease-in-out ${openIndex === index ? 'block' : 'hidden'}`}
              >
                <div className="pt-2 border-t border-gray-100">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
