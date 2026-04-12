'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  Menu, Bell, ChevronDown, ChevronRight,
  User, Settings, LogOut,
} from 'lucide-react';
import styles from './DashboardNavbar.module.css';

const PAGE_NAMES: Record<string, string> = {
  '/dashboard':               'Dashboard',
  '/dashboard/pacientes':     'Pacientes',
  '/dashboard/citas':         'Citas',
  '/dashboard/consultas':     'Consultas Médicas',
  '/dashboard/historial':     'Historial Clínico',
  '/dashboard/especialistas': 'Especialistas',
  '/dashboard/usuarios':      'Usuarios',
  '/dashboard/bitacora':      'Bitácora',
};

interface DashboardNavbarProps {
  onMenuToggle: () => void;
}

export default function DashboardNavbar({ onMenuToggle }: DashboardNavbarProps) {
  const pathname             = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef          = useRef<HTMLDivElement>(null);

  const currentPage = PAGE_NAMES[pathname] ?? 'Dashboard';

  /* Cerrar dropdown al hacer click fuera */
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header className={styles.navbar}>

      {/* ── Izquierda ── */}
      <div className={styles.left}>
        <button
          className={styles.menuBtn}
          onClick={onMenuToggle}
          aria-label="Alternar menú lateral"
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Navegación">
          <Link href="/dashboard" className={styles.breadcrumbHome}>
            Inicio
          </Link>
          {pathname !== '/dashboard' && (
            <>
              <span className={styles.breadcrumbSep}>
                <ChevronRight size={14} />
              </span>
              <span className={styles.breadcrumbCurrent}>{currentPage}</span>
            </>
          )}
        </nav>
      </div>

      {/* ── Derecha ── */}
      <div className={styles.right}>

        {/* Notificaciones */}
        <button className={styles.iconBtn} aria-label="Notificaciones">
          <Bell size={18} strokeWidth={1.8} />
          <span className={styles.badge} aria-hidden />
        </button>

        <div className={styles.divider} />

        {/* Menú de usuario */}
        <div className={styles.userMenu} ref={dropdownRef}>
          <button
            className={styles.userBtn}
            onClick={() => setDropdownOpen(o => !o)}
            aria-label="Menú de usuario"
            aria-expanded={dropdownOpen}
          >
            <div className={styles.avatar}>AD</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>Administrador</span>
              <span className={styles.userRole}>Admin del Sistema</span>
            </div>
            <ChevronDown size={14} className={styles.chevron} />
          </button>

          {dropdownOpen && (
            <div className={styles.dropdown} role="menu">
              <a href="#" className={styles.dropdownItem} role="menuitem">
                <User size={15} /> Mi Perfil
              </a>
              <a href="#" className={styles.dropdownItem} role="menuitem">
                <Settings size={15} /> Configuración
              </a>
              <div className={styles.dropdownDivider} />
              <Link
                href="/login"
                className={`${styles.dropdownItem} ${styles.danger}`}
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <LogOut size={15} /> Cerrar Sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
