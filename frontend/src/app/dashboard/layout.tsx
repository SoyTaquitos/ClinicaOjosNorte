'use client';

import { useState, useEffect } from 'react';
import Sidebar         from '@/components/Sidebar';
import DashboardNavbar from '@/components/DashboardNavbar';
import styles          from './layout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  /*
   * collapsed:
   *   Desktop → true = icono-only (72px), false = ancho completo (260px)
   *   Mobile  → true = oculto,            false = visible (overlay)
   */
  const [collapsed, setCollapsed] = useState(false);

  /* En mobile, empezar colapsado */
  useEffect(() => {
    function syncBreakpoint() {
      if (window.innerWidth < 769) setCollapsed(true);
    }
    syncBreakpoint();
    window.addEventListener('resize', syncBreakpoint);
    return () => window.removeEventListener('resize', syncBreakpoint);
  }, []);

  function toggle() {
    setCollapsed(c => !c);
  }

  return (
    <div className={styles.wrapper}>
      <Sidebar collapsed={collapsed} onClose={() => setCollapsed(true)} />

      <div className={`${styles.main} ${collapsed ? styles.sidebarCollapsed : ''}`}>
        <DashboardNavbar onMenuToggle={toggle} />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
