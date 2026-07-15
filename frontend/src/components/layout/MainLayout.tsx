import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatWhatsAppButton } from '../ui/FloatWhatsAppButton';
import { CookieBanner } from '../ui/CookieBanner';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-eco-light text-eco-dark font-sans relative">
      <Navbar />
      
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
      
      <FloatWhatsAppButton />
      <CookieBanner />
    </div>
  );
};
