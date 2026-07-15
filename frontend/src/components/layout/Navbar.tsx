import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import logoUrl from '../../../assets/logo.jpeg';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user } = useAuth();

  const navLinks = [
    { name: 'Sobre Nós', path: '/' },
    { name: 'Loja', path: '/loja' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contatos', path: '/contatos' },
  ];

  return (
    <nav className="bg-eco-dark text-eco-light/80 shadow-sm border-b border-eco-accent/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoUrl} alt="Ecotraços Logo" className="h-12 w-12 rounded-full object-cover border-2 border-eco-primary" />
              <span className="font-bold text-2xl tracking-tight text-eco-primary">ECOTRAÇOS</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="text-gray-300 hover:text-eco-primary font-medium transition-colors">
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-eco-light hover:text-eco-secondary">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-eco-dark/95 backdrop-blur-sm border-t border-eco-accent/30">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-eco-accent/20 hover:text-eco-primary"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
