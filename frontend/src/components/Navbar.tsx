'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Menu, X, LogIn } from 'lucide-react';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { href: '#inicio',       label: 'Inicio' },
  { href: '#nosotros',     label: 'Sobre Nosotros' },
  { href: '#servicios',    label: 'Servicios' },
  { href: '#especialistas',label: 'Especialistas' },
  { href: '#contacto',     label: 'Contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Overlay fuera del nav para que z-index funcione correctamente */}
      {menuOpen && (
        <div className={styles.overlay} onClick={closeMenu} aria-hidden="true" />
      )}

      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>

          {/* Logo */}
          <a href="#inicio" className={styles.logo} onClick={closeMenu}>
            <div className={styles.logoIcon}>
              <Eye size={20} strokeWidth={2.5} />
            </div>
            <span className={styles.logoText}>Clínica de Ojos Norte</span>
          </a>

          {/* Links — desktop / panel deslizante en mobile */}
          <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a href={href} className={styles.link} onClick={closeMenu}>
                  {label}
                </a>
              </li>
            ))}
            {/* Login visible solo en mobile dentro del panel */}
            <li className={styles.mobileLogin}>
              <Link href="/login" className={styles.loginBtnMobile} onClick={closeMenu}>
                <LogIn size={16} />
                Iniciar Sesión
              </Link>
            </li>
          </ul>

          {/* Actions — desktop */}
          <div className={styles.actions}>
            <Link href="/login" className={styles.loginBtn}>
              <LogIn size={16} />
              Iniciar Sesión
            </Link>

            <button
              className={styles.menuBtn}
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
