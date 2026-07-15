import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import { LayoutDashboard, Package, Image as ImageIcon, Users, Settings, LogOut, Mail } from 'lucide-react';
import logoUrl from '../../assets/logo.jpeg';
import { SESSION_CONFIG } from '../../config/session';

export const AdminLayout = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (role === 'admin' || role === 'employee') {
      const fetchCount = async () => {
        const { count } = await supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true })
          .in('status', ['Em aberto', 'Em andamento']);
        
        if (count !== null) setUnreadCount(count);
      };
      fetchCount();

      window.addEventListener('messages_updated', fetchCount);
      return () => {
        window.removeEventListener('messages_updated', fetchCount);
      };
    }
  }, [role]);

  // Monitor de Inatividade (Auto-Logout)
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      // Ao atingir o tempo limite, desloga o usuário
      inactivityTimer = setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
        alert('Sua sessão expirou por inatividade. Por favor, faça login novamente.');
      }, SESSION_CONFIG.INACTIVITY_TIMEOUT_MS);
    };

    // Inicia o timer assim que o layout monta
    resetTimer();

    // Eventos que configuram "Atividade" do usuário
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-eco-light text-eco-dark font-bold text-xl">Verificando acesso...</div>;

  // Proteção: Se não tiver logado, manda pro login
  if (!user) return <Navigate to="/admin/login" replace />;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // Proteção de Role: Se o usuário logar mas não tiver role, bloqueia o acesso.
  if (role !== 'admin' && role !== 'employee') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acesso Bloqueado</h2>
          <p className="text-gray-600 mb-8">Sua conta foi criada, mas você ainda não tem permissão para acessar o painel. Solicite a um Administrador que libere o seu acesso.</p>
          <button onClick={handleLogout} className="bg-eco-dark text-white px-6 py-3 rounded-lg font-bold hover:bg-eco-primary transition-colors w-full flex items-center justify-center gap-2">
            <LogOut size={20} /> Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-eco-dark text-white flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-eco-accent/20">
          <img src={logoUrl} className="w-10 h-10 rounded-full" alt="Logo" />
          <span className="font-bold text-lg text-eco-primary">Painel Admin</span>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-eco-accent/30 transition-colors">
            <LayoutDashboard size={20} /> Visão Geral
          </Link>
          <Link to="/admin/produtos" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-eco-accent/30 transition-colors">
            <Package size={20} /> Produtos
          </Link>
          <Link to="/admin/mensagens" className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-eco-accent/30 transition-colors">
            <div className="flex items-center gap-3">
              <Mail size={20} /> Caixa de Entrada
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse shadow-md">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          <Link to="/admin/anuncios" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-eco-accent/30 transition-colors">
            <ImageIcon size={20} /> Anúncios
          </Link>
          <Link to="/admin/faq" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-eco-accent/30 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> FAQ
          </Link>
          
          {role === 'admin' && (
            <>
              <Link to="/admin/usuarios" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-eco-accent/30 transition-colors">
                <Users size={20} /> Usuários (Admin)
              </Link>
              <Link to="/admin/config" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-eco-accent/30 transition-colors">
                <Settings size={20} /> Configurações
              </Link>
            </>
          )}
          
          <Link to="/admin/perfil" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-eco-accent/30 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> Perfil
          </Link>
        </nav>

        <div className="p-4 border-t border-eco-accent/20 flex flex-col gap-2">
          <Link to="/" className="flex items-center justify-center gap-2 px-4 py-3 w-full bg-eco-light/10 text-white hover:bg-eco-primary rounded-lg transition-colors text-sm font-bold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Voltar ao Site
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut size={20} /> Sair do Painel
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto bg-gray-100">
        {/* Header Mobile Omitido por Brevidade (Adicionaremos depois se necessário) */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
