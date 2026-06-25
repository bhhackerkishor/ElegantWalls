'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiSun, FiMoon, FiShoppingBag, FiMenu, FiX } from 'react-icons/fi';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import AnnouncementBar from './AnnouncementBar';
import Container from '@/components/ui/Container';
import AuthModal from '@/components/AuthModal';
import { cn } from '@/lib/utils';
import { SITE_NAME } from '@/lib/constants';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/posters', label: 'Posters' },
  { href: '/photo-frames', label: 'Photo Frames' },
  { href: '/wall-stickers', label: 'Wall Stickers' },
  { href: '/about', label: 'About' },
  { href: '/support', label: 'Support' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { cartCount, setIsCartOpen } = useCart();
  const { email, isAuthenticated, login } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <AnnouncementBar />
      <nav className="glass-nav fixed top-[35px] left-0 right-0 h-20 z-[100]">
        <Container className="flex h-full items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" aria-hidden>
              <rect x="15" y="15" width="20" height="25" rx="2" stroke="var(--accent)" strokeWidth="4" />
              <rect x="42" y="15" width="43" height="20" rx="2" stroke="var(--accent)" strokeWidth="4" />
              <rect x="15" y="47" width="23" height="35" rx="2" stroke="var(--accent)" strokeWidth="4" />
              <rect x="45" y="42" width="40" height="40" rx="2" stroke="var(--accent)" strokeWidth="4" />
            </svg>
            <div>
              <span className="font-display text-xl font-extrabold tracking-wider text-foreground">
                {SITE_NAME.toUpperCase()}
              </span>
              <span className="block text-[10px] text-accent tracking-widest -mt-0.5">Embrace Your Memories</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-[15px] font-medium text-accent hover:opacity-80">
                {l.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Link href="/profile" className="text-[15px] font-medium text-accent">My Account</Link>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="text-[15px] font-medium text-accent bg-transparent border-none cursor-pointer p-0"
              >
                Login
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 bg-transparent border-none cursor-pointer text-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FiSun size={22} /> : <FiMoon size={22} />}
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 bg-transparent border-none cursor-pointer text-foreground"
              aria-label="Open cart"
            >
              <FiShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-accent text-black text-[11px] font-bold animate-pulse-badge">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 bg-transparent border-none cursor-pointer text-foreground"
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </Container>

        {menuOpen && (
          <div className="lg:hidden absolute top-20 left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-4 shadow-md z-[99] animate-fade-in">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-lg font-medium">
                {l.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="text-lg font-medium text-accent">
                My Account
              </Link>
            ) : (
              <button
                onClick={() => { setMenuOpen(false); setAuthOpen(true); }}
                className="text-lg font-medium text-accent bg-transparent border-none cursor-pointer text-left p-0"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        )}
      </nav>

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onLoginSuccess={(userEmail, token, role) => login(userEmail, token, role)}
        />
      )}
    </>
  );
}
