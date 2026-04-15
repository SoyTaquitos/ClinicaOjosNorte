'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, UserCog, ShieldCheck, KeyRound, Activity, LogOut,
  Eye, X,
} from 'lucide-react';
import { useDashboardUser } from '@/contexts/DashboardUserContext';
import { logoutApi } from '@/lib/api';
import { initialsFromMe, labelTipoUsuario } from '@/lib/meProfile';
import { getPublicAppName } from '@/lib/siteConfig';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { href: '/dashboard',           icon: LayoutDashboard, label: 'Panel'      },
  { href: '/dashboard/usuarios', icon: UserCog,        label: 'Usuarios'   },
  { href: '/dashboard/roles',    icon: ShieldCheck,    label: 'Roles'      },
  { href: '/dashboard/permisos', icon: KeyRound,       label: 'Permisos'   },
  { href: '/dashboard/bitacora',  icon: Activity,       label: 'Bitácora'   },
];

interface SidebarProps {
  collapsed: boolean;
  onClose:   () => void;
}

export default function Sidebar({ collapsed, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { me, loading } = useDashboardUser();
  const appName = getPublicAppName();

  const displayName =
    (me?.nombre_completo?.trim() || me?.username?.trim() || (loading ? '…' : 'Usuario')) ?? 'Usuario';
  const roleLabel = me
    ? labelTipoUsuario(me.tipo_usuario)
    : loading
      ? 'Cargando perfil…'
      : 'Sin sesión';
  const initials = me ? initialsFromMe(me) : loading ? '·' : '?';
  const userInfoTitle = `${displayName} — ${roleLabel}`;

  function handleNavClick() {
    if (typeof window !== 'undefined' && window.innerWidth < 769) onClose();
  }

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    await logoutApi();
    router.replace('/login');
  }

  return (
    <>
      <div
        className={`${styles.backdrop} ${!collapsed ? styles.backdropVisible : ''}`}
        onClick={onClose}
        aria-hidden
      />

      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>

        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Eye size={18} strokeWidth={2.5} />
            </div>
            <span className={styles.logoText} title={appName || undefined}>
              {appName || 'Portal'}
            </span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar menú">
            <X size={18} />
          </button>
        </div>

        <nav className={styles.nav} aria-label="Menú principal">
          <ul>
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
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

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo} title={userInfoTitle}>
            <div className={styles.userAvatar} aria-hidden>
              {initials}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{displayName}</p>
              <p className={styles.userRole}>{roleLabel}</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.logoutBtn}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            onClick={handleLogout}
          >
            <LogOut size={18} strokeWidth={1.8} aria-hidden />
            <span className={styles.navLabel}>Cerrar sesión</span>
          </button>
        </div>

      </aside>
    </>
  );
}
