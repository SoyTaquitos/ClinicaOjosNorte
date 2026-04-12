import Link from 'next/link';
import {
  Users, CalendarDays, Stethoscope, UserCheck,
  TrendingUp, Clock, UserPlus, CalendarPlus,
} from 'lucide-react';
import { fmtDateFull } from '@/lib/timezone';
import styles from './page.module.css';

/* ─── Datos mock ────────────────────────────────────── */
const KPIS = [
  {
    value: '2,847',
    label: 'Total Pacientes',
    icon: Users,
    color: '#7C3AED',
    bg: '#EDE9FE',
    trend: '+12%',
    trendUp: true,
  },
  {
    value: '12',
    label: 'Citas para Hoy',
    icon: CalendarDays,
    color: '#0EA5E9',
    bg: '#E0F2FE',
    trend: '8 pendientes',
    trendUp: false,
  },
  {
    value: '234',
    label: 'Consultas del Mes',
    icon: Stethoscope,
    color: '#16A34A',
    bg: '#DCFCE7',
    trend: '+8%',
    trendUp: true,
  },
  {
    value: '8',
    label: 'Especialistas Activos',
    icon: UserCheck,
    color: '#F59E0B',
    bg: '#FEF3C7',
    trend: 'Disponibles',
    trendUp: false,
  },
];

const CITAS = [
  { paciente: 'María López',    doctor: 'Dr. Ramírez',    hora: '09:00',  tipo: 'Consulta General',  estado: 'Programada' },
  { paciente: 'Juan Pérez',     doctor: 'Dra. González',  hora: '09:30',  tipo: 'Control Visual',    estado: 'Atendida'   },
  { paciente: 'Ana Martínez',   doctor: 'Dr. Mendoza',    hora: '10:00',  tipo: 'Cirugía Refractiva', estado: 'Programada' },
  { paciente: 'Carlos Ruiz',    doctor: 'Dr. Ramírez',    hora: '10:30',  tipo: 'Examen Diagnóstico', estado: 'Pendiente'  },
  { paciente: 'Laura Sánchez',  doctor: 'Dra. González',  hora: '11:00',  tipo: 'Consulta General',  estado: 'Cancelada'  },
  { paciente: 'Pedro García',   doctor: 'Dr. Mendoza',    hora: '11:30',  tipo: 'Retina y Vítreo',   estado: 'Programada' },
];

const ACTIVIDAD = [
  { text: 'Nueva cita registrada',        sub: 'María López — 09:00 AM',   time: 'hace 5 min',  color: '#7C3AED' },
  { text: 'Consulta completada',          sub: 'Dr. Ramírez — Juan Pérez', time: 'hace 18 min', color: '#16A34A' },
  { text: 'Paciente actualizado',         sub: 'Ana Martínez — expediente', time: 'hace 32 min', color: '#0EA5E9' },
  { text: 'Cita cancelada',               sub: 'Laura Sánchez — 11:00 AM', time: 'hace 1h',     color: '#DC2626' },
  { text: 'Historial clínico creado',     sub: 'Pedro García — nuevo',     time: 'hace 2h',     color: '#F59E0B' },
  { text: 'Especialista registrado',      sub: 'Dr. Herrera — Glaucoma',   time: 'ayer',        color: '#7C3AED' },
];

const QUICK_ACTIONS = [
  { href: '/dashboard/citas/nueva',     icon: CalendarPlus, label: 'Nueva Cita',       sub: 'Programar',     color: '#7C3AED', bg: '#EDE9FE' },
  { href: '/dashboard/pacientes/nuevo', icon: UserPlus,     label: 'Nuevo Paciente',   sub: 'Registrar',     color: '#0EA5E9', bg: '#E0F2FE' },
  { href: '/dashboard/consultas',       icon: Stethoscope,  label: 'Ver Consultas',    sub: 'Historial',     color: '#16A34A', bg: '#DCFCE7' },
  { href: '/dashboard/especialistas',   icon: UserCheck,    label: 'Especialistas',    sub: 'Equipo médico', color: '#F59E0B', bg: '#FEF3C7' },
];

const BADGE_CLASS: Record<string, string> = {
  Programada: styles.badgeProgramada,
  Atendida:   styles.badgeAtendida,
  Cancelada:  styles.badgeCancelada,
  Pendiente:  styles.badgePendiente,
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

/* Usa timezone Bolivia (UTC-4) */
function formatDate() {
  return fmtDateFull(new Date());
}

/* ─── Página ─────────────────────────────────────────── */
export default function DashboardPage() {
  return (
    <>
      {/* ── Encabezado ── */}
      <div className={styles.pageHeader}>
        <p className={styles.greeting}>{getGreeting()},</p>
        <h1 className={styles.pageTitle}>Administrador</h1>
        <p className={styles.pageDate}>
          <Clock size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {formatDate()}
        </p>
      </div>

      {/* ── KPIs ── */}
      <div className={styles.kpiGrid}>
        {KPIS.map(({ value, label, icon: Icon, color, bg, trend, trendUp }) => (
          <div key={label} className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <div className={styles.kpiIconWrap} style={{ background: bg }}>
                <Icon size={20} strokeWidth={1.8} color={color} />
              </div>
              <span className={`${styles.kpiTrend} ${trendUp ? styles.trendUp : styles.trendNeutral}`}>
                {trendUp && <TrendingUp size={11} />}
                {trend}
              </span>
            </div>
            <p className={styles.kpiValue}>{value}</p>
            <p className={styles.kpiLabel}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Tabla + Actividad ── */}
      <div className={styles.twoCol}>

        {/* Tabla de citas del día */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Citas de Hoy</h2>
            <Link href="/dashboard/citas" className={styles.panelAction}>
              Ver todas →
            </Link>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Hora</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {CITAS.map((c, i) => (
                  <tr key={i}>
                    <td>
                      <p className={styles.patientName}>{c.paciente}</p>
                      <p className={styles.doctorName}>{c.doctor}</p>
                    </td>
                    <td>{c.hora}</td>
                    <td>{c.tipo}</td>
                    <td>
                      <span className={`${styles.badge} ${BADGE_CLASS[c.estado] ?? ''}`}>
                        {c.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Actividad Reciente</h2>
          </div>
          <ul className={styles.activityList}>
            {ACTIVIDAD.map(({ text, sub, time, color }, i) => (
              <li key={i} className={styles.activityItem}>
                <div className={styles.activityDot} style={{ background: color }} />
                <div className={styles.activityBody}>
                  <p className={styles.activityText}>{text}</p>
                  <p className={styles.activitySub}>{sub}</p>
                </div>
                <span className={styles.activityTime}>{time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Acciones rápidas ── */}
      <p className={styles.sectionLabel}>Acciones Rápidas</p>
      <div className={styles.quickGrid}>
        {QUICK_ACTIONS.map(({ href, icon: Icon, label, sub, color, bg }) => (
          <Link key={href} href={href} className={styles.quickCard}>
            <div className={styles.quickIcon} style={{ background: bg }}>
              <Icon size={19} strokeWidth={1.8} color={color} />
            </div>
            <div>
              <p className={styles.quickLabel}>{label}</p>
              <p className={styles.quickSub}>{sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
