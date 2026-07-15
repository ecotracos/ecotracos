import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { MessageCircle, Info } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number | null;
  stock: number;
  category: string;
  is_on_demand: boolean;
  product_images: ProductImage[];
}

export const Loja = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('5511999999999');
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryQuery = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState(categoryQuery || 'Todas');

  useEffect(() => {
    // Se a URL mudar, atualiza a categoria ativa
    if (categoryQuery) {
      setActiveCategory(categoryQuery);
    }
  }, [categoryQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          product_images ( id, image_url, is_primary )
        `)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });
        
      if (data) {
        setProducts(data);
      }
      setLoading(false);
    };
    
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('whatsapp_number').eq('id', 1).single();
      if (data && data.whatsapp_number) {
        setWhatsappNumber(data.whatsapp_number.replace(/\D/g, ''));
      }
    };

    fetchProducts();
    fetchSettings();
  }, []);

  const uniqueCategories = ['Todas', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  
  const filteredProducts = activeCategory === 'Todas' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'Todas') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-eco-primary font-bold text-xl">Carregando catálogo...</div>;
  }

  return (
    <div className="py-16 px-4 bg-eco-light min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-eco-dark mb-4">Catálogo Ecotraços</h1>
          <p className="text-lg text-eco-dark/70 max-w-2xl mx-auto">Peças exclusivas feitas para durar. Cada móvel tem uma história.</p>
        </div>

        {/* Filtros de Categorias */}
        {uniqueCategories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {uniqueCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => handleCategoryClick(cat)}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${
                  activeCategory === cat 
                  ? 'bg-eco-primary text-white scale-105' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-eco-dark'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-eco-dark/50 text-xl font-medium bg-white rounded-2xl shadow-sm border border-eco-accent/10">
            Nenhum produto encontrado nesta categoria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 perspective-[1000px]">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} whatsappNumber={whatsappNumber} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-componente para o Card do Produto com Flip 3D e Slider Automático
const ProductCard = ({ product, whatsappNumber }: { product: Product, whatsappNumber: string }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const images = product.product_images || [];

  // Slider Automático
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % images.length);
    }, 3500); // Passa a cada 3.5 segundos
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="group h-[450px] w-full perspective-[1000px] cursor-pointer">
      <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        
        {/* ================================== */}
        {/* FRENTE DO CARD (Imagem + Gradiente) */}
        {/* ================================== */}
        <div className="absolute inset-0 [backface-visibility:hidden] bg-white rounded-2xl overflow-hidden shadow-lg border border-eco-accent/10">
          {images.length > 0 ? (
            <div className="relative w-full h-full bg-gray-900">
              {/* Renderiza as imagens com transição de opacidade */}
              {images.map((img, idx) => (
                <img 
                  key={img.id}
                  src={img.image_url} 
                  alt={product.name} 
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === imgIndex ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}
              
              {/* Gradiente escuro na base para destacar o texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{product.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="bg-eco-primary/90 text-white text-sm px-3 py-1 rounded-full font-bold shadow-md">
                    {product.price ? `R$ ${product.price.toFixed(2)}` : 'Sob Consulta'}
                  </span>
                  {product.is_on_demand && (
                    <span className="bg-eco-dark/90 text-eco-secondary text-xs px-2 py-1 rounded shadow-md font-bold uppercase tracking-wider border border-eco-secondary/50">
                      Sob Demanda
                    </span>
                  )}
                </div>
              </div>

              {/* Ícone indicativo de Flip */}
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 text-white animate-pulse shadow-lg">
                <Info size={20} />
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-6 text-center">
              <span className="mb-4">Sem Imagem</span>
              <h3 className="text-xl font-bold text-eco-dark">{product.name}</h3>
            </div>
          )}
        </div>

        {/* ================================== */}
        {/* VERSO DO CARD (Detalhes + Botão) */}
        {/* ================================== */}
        <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] bg-eco-dark text-white rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center text-center border-2 border-eco-primary/30">
          <h3 className="text-2xl font-bold text-eco-secondary mb-4">{product.name}</h3>
          
          <div className="flex-grow flex items-center justify-center w-full mb-6 relative">
             {/* Barrinhas decorativas */}
             <div className="absolute left-0 top-0 w-8 h-px bg-eco-primary/50"></div>
             <div className="absolute right-0 bottom-0 w-8 h-px bg-eco-primary/50"></div>
             
             <p className="text-eco-light/80 text-sm leading-relaxed max-h-[160px] overflow-y-auto overflow-x-hidden break-words w-full px-2">
               {product.description}
             </p>
          </div>
          
          <div className="mt-auto w-full flex flex-col gap-4 items-center">
            <span className="font-bold text-2xl text-white">
              {product.price ? `R$ ${product.price.toFixed(2)}` : 'Preço sob consulta'}
            </span>
            
            <a 
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre o produto: ${product.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-colors shadow-[0_0_15px_rgba(34,197,94,0.4)]"
            >
              <MessageCircle size={22} /> Fazer Pedido
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
