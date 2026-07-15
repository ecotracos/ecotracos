import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import logoUrl from '../assets/logo.jpeg';
import { HOME_CONTENT } from '../config/content';

// Subcomponente para animação de scroll
const AnimatedSection = ({ children, direction = 'left', className = '' }: { children: React.ReactNode, direction?: 'left' | 'right', className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Um pequeno delay garante que o navegador renderize o estado inicial antes de transicionar
            setTimeout(() => setIsVisible(true), 100);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  const translateClass = direction === 'left' ? '-translate-x-24 md:-translate-x-40' : 'translate-x-24 md:translate-x-40';

  return (
    <div
      ref={domRef}
      className={`transition-all duration-[1200ms] ease-out ${
        isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${translateClass}`
      } ${className}`}
    >
      {children}
    </div>
  );
};

interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
}

interface Category {
  name: string;
  image: string;
}

export const Home = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const fetchAds = async () => {
      const { data } = await supabase.from('hero_banners').select('*').eq('is_visible', true).order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setAds(data);
      } else {
        setAds([
          { id: 'mock1', title: 'Bem-vindo à Ecotraços', image_url: logoUrl }
        ]);
      }
    };

    const fetchCategories = async () => {
      // Busca produtos para extrair categorias únicas e uma imagem representativa
      const { data } = await supabase.from('products').select('category, product_images(image_url, is_primary)').eq('is_visible', true);
      if (data && data.length > 0) {
        const catMap = new Map<string, Category>();
        data.forEach(p => {
          if (p.category && !catMap.has(p.category)) {
            let img = 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=500&q=60';
            if (p.product_images && p.product_images.length > 0) {
              const primary = p.product_images.find((i: any) => i.is_primary);
              img = primary ? primary.image_url : p.product_images[0].image_url;
            }
            catMap.set(p.category, { name: p.category, image: img });
          }
        });
        setCategories(Array.from(catMap.values()));
      }
    };

    fetchAds();
    fetchCategories();
  }, []);

  // Slider automático para o Hero (Anúncios)
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % ads.length);
    }, 5000); // 5 segundos
    return () => clearInterval(interval);
  }, [ads]);

  const nextAd = () => setCurrentAdIndex((prev) => (prev + 1) % ads.length);
  const prevAd = () => setCurrentAdIndex((prev) => (prev - 1 + ads.length) % ads.length);

  return (
    <div className="flex flex-col">
      {/* Hero Section (Carrossel de Anúncios) */}
      <section className="relative bg-eco-dark text-eco-light h-[400px] md:h-[450px] flex items-center justify-center overflow-hidden group">
        {ads.length > 0 && (
          <>
            {/* Background Image Carousel */}
            {ads.map((ad, index) => (
              <div
                key={ad.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentAdIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <div className="absolute inset-0 bg-black/50 z-10" />
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${ad.image_url})` }}
                />

                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
                  <h1 className="text-5xl md:text-7xl font-bold text-eco-secondary mb-6 tracking-tight drop-shadow-lg">
                    {ad.title || 'ECOTRAÇOS'}
                  </h1>
                  {ad.link_url && (
                    <a href={ad.link_url} className="bg-eco-primary hover:bg-eco-secondary text-eco-dark font-bold text-lg py-4 px-10 rounded-full transition-all transform hover:scale-105 inline-block shadow-xl">
                      Acessar
                    </a>
                  )}
                  {!ad.link_url && index === 0 && (
                    <p className="text-xl md:text-2xl mb-8 font-light max-w-2xl mx-auto drop-shadow-md text-white">
                      Móveis exclusivos de madeira sustentável, feitos sob demanda para o seu ambiente.
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Controles do Carrossel (Visíveis no Hover) */}
            {ads.length > 1 && (
              <div className="absolute inset-0 z-30 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button onClick={prevAd} className="pointer-events-auto bg-black/40 text-white p-3 rounded-full hover:bg-black/70 backdrop-blur-sm transition-all"><ChevronLeft size={30} /></button>
                <button onClick={nextAd} className="pointer-events-auto bg-black/40 text-white p-3 rounded-full hover:bg-black/70 backdrop-blur-sm transition-all"><ChevronRight size={30} /></button>
              </div>
            )}

            {/* Indicadores (Dots) */}
            {ads.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
                {ads.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentAdIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${idx === currentAdIndex ? 'bg-eco-primary scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Sobre Nós */}
      <section className="py-20 bg-eco-light px-4 overflow-hidden">
        <AnimatedSection direction="left" className="max-w-5xl mx-auto text-left">
          <h2 className="text-4xl font-bold text-eco-dark mb-8">{HOME_CONTENT.sobreArte.titulo}</h2>
          <p className="text-lg text-eco-dark/80 leading-relaxed mb-12">
            {HOME_CONTENT.sobreArte.texto}
          </p>
        </AnimatedSection>
      </section>

      {/* Idealizador */}
      <section className="py-20 bg-white px-4 overflow-hidden border-t border-eco-accent/10">
        <AnimatedSection direction="right" className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1 md:text-right order-2 md:order-1 text-center md:text-left">
            <h2 className="text-4xl font-bold text-eco-dark mb-6">{HOME_CONTENT.idealizador.titulo}</h2>
            <p className="text-lg text-eco-dark/80 leading-relaxed">
              {HOME_CONTENT.idealizador.texto}
            </p>
          </div>

          <div className="order-1 md:order-2 flex-shrink-0">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-eco-primary shadow-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
              {HOME_CONTENT.idealizador.imagemUrl ? (
                <img 
                  src={HOME_CONTENT.idealizador.imagemUrl} 
                  alt="Idealizador" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={80} className="text-gray-300" />
              )}
            </div>
          </div>

        </AnimatedSection>
      </section>

      {/* Navegue por Categorias */}
      <section className="py-16 bg-eco-dark text-white px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-eco-primary mb-10 text-center">Navegue por Categorias</h2>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat, idx) => (
                <Link to={`/loja?category=${encodeURIComponent(cat.name)}`} key={idx} className="block rounded-xl overflow-hidden shadow-xl group border border-eco-accent/20 hover:border-eco-primary transition-colors">
                  <div className="relative h-64 overflow-hidden bg-gray-800">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end justify-center p-6">
                      <h3 className="text-3xl font-bold text-white group-hover:text-eco-secondary transition-colors tracking-wide uppercase">{cat.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-eco-light/60">Nenhuma categoria encontrada no momento.</p>
          )}
        </div>
      </section>
    </div>
  );
};
