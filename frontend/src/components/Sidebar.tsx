'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, CalendarDays, Stethoscope,
  FileText, UserCheck, UserCog, Activity, LogOut,
  Eye, X,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const NAV_PRIMARY = [
  { href: '/dashboard',              icon: LayoutDashboard, label: 'Dashboard'        },
  { href: '/dashboard/pacientes',    icon: Users,           label: 'Pacientes'         },
  { href: '/dashboard/citas',        icon: CalendarDays,    label: 'Citas'             },
  { href: '/dashboard/consultas',    icon: Stethoscope,     label: 'Consultas Médicas' },
  { href: '/dashboard/historial',    icon: FileText,        label: 'Historial Clínico' },
  { href: '/dashboard/especialistas',icon: UserCheck,       label: 'Especialistas'     },
];

const NAV_SECONDARY = [
  { href: '/dashboard/usuarios', icon: UserCog,  label: 'Usuarios'  },
  { href: '/dashboard/bitacora', icon: Activity, label: 'Bitácora'  },
];

interface SidebarProps {
  collapsed: boolean;
  onClose:   () => void;
}

export default function Sidebar({ collapsed, onClose }: SidebarProps) {
  const pathname = usePathname();

  function handleNavClick() {
    /* Cerrar en mobile al navegar */
    if (typeof window !== 'undefined' && window.innerWidth < 769) onClose();
  }

  return (
    <>
      {/* Backdrop mobile */}
      <div
        className={`${styles.backdrop} ${!collapsed ? styles.backdropVisible : ''}`}
        onClick={onClose}
        aria-hidden
      />

      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>

        {/* ── Header ── */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Eye size={18} strokeWidth={2.5} />
            </div>
            <span className={styles.logoText}>
              Clínica<strong>Ojos Norte</strong>
            </span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar menú">
            <X size={18} />
          </button>
        </div>

        {/* ── Navegación principal ── */}
        <nav className={styles.nav} aria-label="Menú principal">
          <ul>
            {NAV_PRIMARY.map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.navItem} ${pathname === href ? styles.active : ''}`}
                  onClick={handleNavClick}
                  title={label}
                >
                  <span className={styles.navIcon}><Icon size={19} strokeWidth={1.8} /></span>
                  <span className={styles.navLabel}>{label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.navDivider} />
          <p className={styles.navSectionLabel}>Administración</p>

          <ul>
            {NAV_SECONDARY.map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.navItem} ${pathname === href ? styles.active : ''}`}
                  onClick={handleNavClick}
                  title={label}
                >
                  <span className={styles.navIcon}><Icon size={19} strokeWidth={1.8} /></span>
                  <span className={styles.navLabel}>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Footer ── */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>AD</div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>Administrador</p>
              <p className={styles.userRole}>Admin del Sistema</p>
            </div>
          </div>
          <Link href="/login" className={styles.logoutBtn} title="Cerrar Sesión">
            <LogOut size={18} strokeWidth={1.8} />
            <span className={styles.navLabel}>Cerrar Sesión</span>
          </Link>
        </div>

      </aside>
    </>
  );
}
