import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Save, UploadCloud, Move } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProductImage {
  id: string; // ID local temporário para o drag-and-drop
  url: string;
}

const SortableImage = ({ image, onRemove }: { image: ProductImage, onRemove: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white aspect-square">
      <img src={image.url} alt="" className="w-full h-full object-cover" />
      
      {/* Botão de excluir */}
      <button 
        type="button" 
        onClick={() => onRemove(image.id)} 
        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md hover:bg-red-600"
      >
        <X size={14}/>
      </button>

      {/* Overlay de arrasto */}
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute inset-0 bg-black/0 group-hover:bg-black/10 cursor-move transition-colors flex items-center justify-center z-10"
      >
        <div className="opacity-0 group-hover:opacity-100 bg-white/80 p-2 rounded-full shadow-sm">
          <Move size={20} className="text-gray-700"/>
        </div>
      </div>
      
      {/* Badge de Primária se for a primeira (Lógica tratada no pai, aqui é só visual se precisasse, mas deixaremos clean) */}
    </div>
  );
};

export const GerenciarProdutos = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number>(0);
  const [category, setCategory] = useState<string>('Geral');
  const [isOnDemand, setIsOnDemand] = useState(false);
  
  // Imagens
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, product_images(image_url, display_order)')
      .order('created_at', { ascending: false });
    
    // Sort nested images by display_order for preview
    if (data) {
      data.forEach(p => {
        if(p.product_images) {
          p.product_images.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
        }
      });
      setProducts(data);
    }
    setLoading(false);
  };

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('products').update({ is_visible: !currentStatus }).eq('id', id);
    if (!error) setProducts(products.map(p => p.id === id ? { ...p, is_visible: !currentStatus } : p));
  };

  const deleteProduct = async (id: string) => {
    if(!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(products.filter(p => p.id !== id));
  };

  const openModal = (product: any = null) => {
    if (product) {
      setEditingId(product.id);
      setName(product.name);
      setDescription(product.description || '');
      setCategory(product.category || 'Geral');
      setPrice(product.price || '');
      setStock(product.stock || 0);
      setIsOnDemand(product.is_on_demand);
      
      // Carregar imagens na ordem correta
      const loadedImages = (product.product_images || []).map((img: any) => ({
        id: Math.random().toString(), // ID temp pro dnd
        url: img.image_url
      }));
      setImages(loadedImages);
    } else {
      setEditingId(null);
      setName('');
      setDescription('');
      setCategory('Geral');
      setPrice('');
      setStock(0);
      setIsOnDemand(false);
      setImages([]);
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);

      if (uploadError) {
        alert('Erro ao fazer upload da imagem: ' + uploadError.message);
        continue;
      }

      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
      
      setImages(prev => [...prev, {
        id: fileName, 
        url: publicUrlData.publicUrl
      }]);
    }

    setUploadingImages(false);
    e.target.value = ''; // Limpar input
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      category,
      price: isOnDemand ? null : (price === '' ? null : Number(price)),
      stock: isOnDemand ? 0 : Number(stock),
      is_on_demand: isOnDemand,
      is_visible: true
    };

    let productId = editingId;

    if (editingId) {
      await supabase.from('products').update(payload).eq('id', editingId);
    } else {
      const { data } = await supabase.from('products').insert([payload]).select().single();
      if (data) productId = data.id;
    }
    
    // Atualizar Imagens: Estratégia de limpar e re-inserir para manter a ordem perfeitamente sincronizada com o front
    if (productId) {
      await supabase.from('product_images').delete().eq('product_id', productId);
      
      if (images.length > 0) {
        const dbImages = images.map((img, index) => ({
          product_id: productId,
          image_url: img.url,
          is_primary: index === 0,
          display_order: index // A ordem salva aqui reflete a ordem visual do Drag and Drop
        }));
        await supabase.from('product_images').insert(dbImages);
      }
    }
    
    fetchProducts();
    setIsModalOpen(false);
  };

  // Extrair categorias únicas já existentes para o autocompletar
  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Produtos</h1>
        <button onClick={() => openModal()} className="bg-eco-primary hover:bg-eco-dark text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} /> Adicionar Novo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando produtos...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum produto cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-600">Imagem</th>
                  <th className="p-4 font-bold text-gray-600">Nome</th>
                  <th className="p-4 font-bold text-gray-600">Preço</th>
                  <th className="p-4 font-bold text-gray-600">Estoque</th>
                  <th className="p-4 font-bold text-gray-600">Status</th>
                  <th className="p-4 font-bold text-gray-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      {product.product_images && product.product_images.length > 0 ? (
                        <img src={product.product_images[0].image_url} alt="" className="w-12 h-12 rounded object-cover border"/>
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">Sem Foto</div>
                      )}
                    </td>
                    <td className="p-4 font-medium text-gray-800">{product.name}</td>
                    <td className="p-4 text-gray-600">
                      {product.price ? `R$ ${product.price.toFixed(2)}` : <span className="text-sm bg-gray-200 px-2 py-1 rounded">Sob Demanda</span>}
                    </td>
                    <td className="p-4 text-gray-600">{product.stock}</td>
                    <td className="p-4">
                      <button onClick={() => toggleVisibility(product.id, product.is_visible)} className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${product.is_visible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.is_visible ? <><Eye size={14} /> Visível</> : <><EyeOff size={14} /> Oculto</>}
                      </button>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2 items-center">
                      <button onClick={() => openModal(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Excluir">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500"><X size={24} /></button>
            </div>
            
            <form onSubmit={saveProduct} className="space-y-6 overflow-y-auto flex-grow pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Nome do Produto</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg" />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3} maxLength={200} className="w-full p-2 border rounded-lg resize-none h-24" />
                  <p className="text-xs text-gray-500 text-right">{description.length}/200</p>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <input 
                    required 
                    list="category-options"
                    placeholder="Ex: Mesas, Cadeiras, Decoração..." 
                    value={category} 
                    onChange={e => setCategory(e.target.value)} 
                    className="w-full p-2 border rounded-lg" 
                  />
                  <datalist id="category-options">
                    {uniqueCategories.map((cat, idx) => (
                      <option key={idx} value={cat as string} />
                    ))}
                  </datalist>
                  <p className="text-xs text-gray-500 mt-1">Selecione uma categoria existente ou digite uma nova.</p>
                </div>

                <div className="flex items-center gap-2 col-span-1 md:col-span-2 bg-eco-light/30 p-3 rounded-lg border border-eco-accent/20">
                  <input type="checkbox" id="isOnDemand" checked={isOnDemand} onChange={e => setIsOnDemand(e.target.checked)} className="rounded text-eco-primary focus:ring-eco-primary w-5 h-5" />
                  <label htmlFor="isOnDemand" className="text-sm font-bold text-eco-dark cursor-pointer">Vendido sob demanda (Ocultar preço e estoque)</label>
                </div>

                {!isOnDemand && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                      <input type="number" step="0.01" min="0" required value={price} onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')} className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Quantidade em Estoque</label>
                      <input type="number" min="0" required value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full p-2 border rounded-lg" />
                    </div>
                  </>
                )}
              </div>

              {/* Área de Imagens com Drag and Drop */}
              <div className="border-t pt-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Galeria de Imagens</h3>
                    <p className="text-xs text-gray-500">Faça upload de fotos e <span className="font-bold text-eco-primary">arraste para reordenar</span>. A primeira imagem será a capa do produto.</p>
                  </div>
                  
                  <label className={`cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2 px-4 rounded-lg flex items-center gap-2 border border-blue-200 transition-colors ${uploadingImages ? 'opacity-50 pointer-events-none' : ''}`}>
                    <UploadCloud size={20} /> {uploadingImages ? 'Enviando...' : 'Fazer Upload'}
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploadingImages} />
                  </label>
                </div>

                {images.length > 0 ? (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={images.map(i => i.id)} strategy={horizontalListSortingStrategy}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        {images.map((img, index) => (
                          <div key={img.id} className="relative">
                            {index === 0 && (
                              <div className="absolute -top-3 -left-3 bg-eco-primary text-white text-[10px] font-bold px-2 py-1 rounded-full z-30 shadow-md">
                                CAPA
                              </div>
                            )}
                            <SortableImage image={img} onRemove={removeImage} />
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50 flex flex-col items-center justify-center">
                    <UploadCloud size={48} className="text-gray-300 mb-2" />
                    <p className="text-gray-500 font-medium">Nenhuma imagem adicionada.</p>
                    <p className="text-gray-400 text-sm mt-1">Clique no botão acima para adicionar fotos do produto.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold">Cancelar</button>
                <button type="submit" disabled={uploadingImages} className="px-8 py-3 text-white bg-eco-primary hover:bg-eco-dark rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md">
                  <Save size={20}/> Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
