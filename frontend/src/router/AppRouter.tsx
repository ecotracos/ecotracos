import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Home } from '../pages/Home';
import { Loja } from '../pages/Loja';
import { Contatos } from '../pages/Contatos';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Login } from '../pages/admin/Login';
import { Dashboard } from '../pages/admin/Dashboard';
import { GerenciarProdutos } from '../pages/admin/GerenciarProdutos';
import { Faq } from '../pages/Faq';
import { PrivacyPolicy } from '../pages/PrivacyPolicy';
import { NotFound } from '../pages/NotFound';
import { GerenciarFAQ } from '../pages/admin/GerenciarFAQ';
import { GerenciarAnuncios } from '../pages/admin/GerenciarAnuncios';
import { GerenciarUsuarios } from '../pages/admin/GerenciarUsuarios';
import { GerenciarConfig } from '../pages/admin/GerenciarConfig';
import { Perfil } from '../pages/admin/Perfil';
import { GerenciarMensagens } from '../pages/admin/GerenciarMensagens';

const ScrollToTopAndTitle = () => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const path = location.pathname;
    let title = 'Ecotraços | Móveis Sustentáveis';
    
    if (path.includes('/loja')) title = 'Ecotraços | Loja';
    else if (path.includes('/contatos')) title = 'Ecotraços | Contato';
    else if (path.includes('/faq')) title = 'Ecotraços | FAQ';
    else if (path.includes('/privacidade')) title = 'Ecotraços | Privacidade';
    else if (path.includes('/admin')) title = 'Painel Admin | Ecotraços';
    
    document.title = title;
  }, [location]);

  return null;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <ScrollToTopAndTitle />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="sobre" element={<Home />} />
          <Route path="loja" element={<Loja />} />
          <Route path="faq" element={<Faq />} />
          <Route path="contatos" element={<Contatos />} />
          <Route path="privacidade" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Rotas Admin (Login - Sem Layout) */}
        <Route path="/admin/login" element={<Login />} />

        {/* Rotas Admin (Protegidas) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="produtos" element={<GerenciarProdutos />} />
          <Route path="anuncios" element={<GerenciarAnuncios />} />
          <Route path="faq" element={<GerenciarFAQ />} />
          <Route path="mensagens" element={<GerenciarMensagens />} />
          <Route path="usuarios" element={<GerenciarUsuarios />} />
          <Route path="config" element={<GerenciarConfig />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
