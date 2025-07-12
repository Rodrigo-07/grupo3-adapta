// src/components/Navbar.tsx
import { Link } from 'react-router-dom';

export default function Navbar() {
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/features", label: "Features" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="bg-indigo-900 shadow sticky top-0 z-20">
      <div className="max-w-7xl mx-auto text-white px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          ⚡️ MyApp
        </Link>
        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="hover:text-indigo-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {/* Menu mobile */}
        <div className="md:hidden">
          {/* Você pode inserir um botão de menu aqui se quiser */}
        </div>
      </div>
    </header>
  );
}
