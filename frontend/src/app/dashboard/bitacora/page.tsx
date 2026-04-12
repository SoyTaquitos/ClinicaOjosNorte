'use client';

/**
 * Bitácora del Sistema — Clínica de Ojos Norte
 *
 * Todas las marcas de tiempo se muestran en hora Bolivia (UTC-4).
 * El backend almacena UTC; aquí convertimos usando Intl.DateTimeFormat
 * con timeZone: 'America/La_Paz'.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Activity, Search, RotateCcw, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown, Shield, LogIn, LogOut,
  AlertTriangle, Clock,
} from 'lucide-react';
import { fmtDate, fmtTimeFull, fmtRelative, nowBoliviaTime, nowBoliviaDateFull } from '@/lib/timezone';
import styles from './page.module.css';

/* ─── Tipos ──────────────────────────────────────────── */
type Accion =
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FALLIDO'
  | 'CREAR' | 'EDITAR' | 'ELIMINAR'
  | 'CAMBIAR_PASSWORD' | 'RECUPERAR_PASSWORD'
  | 'REPROGRAMAR' | 'CANCELAR' | 'CONFIRMAR';

interface BitacoraEvento {
  id_bitacora:          number;
  usuario_nombre:       string;
  usuario_username:     string | null;
  modulo:               string;
  tabla_afectada:       string | null;
  id_registro_afectado: number | null;
  accion:               Accion;
  descripcion:          string | null;
  ip_origen:            string | null;
  fecha_evento:         string; /* ISO UTC — se convierte a Bolivia en el display */
}

/* ─── Datos mock (UTC → se muestra en Bolivia UTC-4) ── */
const MOCK: BitacoraEvento[] = [
  { id_bitacora: 1248, usuario_nombre: 'Administrador', usuario_username: 'admin',       modulo: 'Autenticación',   tabla_afectada: 'usuarios',          id_registro_afectado: 1,   accion: 'LOGIN',               descripcion: 'Inicio de sesión exitoso desde navegador Chrome', ip_origen: '192.168.1.45',  fecha_evento: '2026-03-29T18:32:05Z' },
  { id_bitacora: 1247, usuario_nombre: 'Dr. Carlos Ramírez', usuario_username: 'c.ramirez', modulo: 'Consultas',     tabla_afectada: 'consultas_medicas', id_registro_afectado: 87,  accion: 'CREAR',               descripcion: 'Nueva consulta médica registrada para paciente ID 312', ip_origen: '192.168.1.62',  fecha_evento: '2026-03-29T18:28:30Z' },
  { id_bitacora: 1246, usuario_nombre: 'Recepcionista Ana', usuario_username: 'a.perez',    modulo: 'Citas',          tabla_afectada: 'citas',             id_registro_afectado: 204, accion: 'CONFIRMAR',           descripcion: 'Cita confirmada: María López — 09:00 AM', ip_origen: '192.168.1.38',  fecha_evento: '2026-03-29T18:15:00Z' },
  { id_bitacora: 1245, usuario_nombre: 'Administrador', usuario_username: 'admin',           modulo: 'Pacientes',     tabla_afectada: 'pacientes',         id_registro_afectado: 312, accion: 'CREAR',               descripcion: 'Nuevo paciente registrado: Juan Carlos Mendoza Flores', ip_origen: '192.168.1.45',  fecha_evento: '2026-03-29T17:58:12Z' },
  { id_bitacora: 1244, usuario_nombre: 'Sistema',       usuario_username: null,              modulo: 'Autenticación', tabla_afectada: 'usuarios',          id_registro_afectado: 7,   accion: 'LOGIN_FALLIDO',       descripcion: 'Intento de login fallido para usuario: test@test.com', ip_origen: '10.0.0.104',    fecha_evento: '2026-03-29T17:42:00Z' },
  { id_bitacora: 1243, usuario_nombre: 'Recepcionista Ana', usuario_username: 'a.perez',     modulo: 'Citas',         tabla_afectada: 'citas',             id_registro_afectado: 198, accion: 'REPROGRAMAR',         descripcion: 'Cita reprogramada: Carlos Ruiz — nueva fecha 02/04/2026', ip_origen: '192.168.1.38', fecha_evento: '2026-03-29T17:30:45Z' },
  { id_bitacora: 1242, usuario_nombre: 'Dra. María González', usuario_username: 'm.gonzalez', modulo: 'Historial',   tabla_afectada: 'historias_clinicas',id_registro_afectado: 88,  accion: 'EDITAR',              descripcion: 'Historia clínica actualizada — diagnóstico añadido', ip_origen: '192.168.1.71',  fecha_evento: '2026-03-29T17:18:20Z' },
  { id_bitacora: 1241, usuario_nombre: 'Administrador', usuario_username: 'admin',           modulo: 'Usuarios',      tabla_afectada: 'usuarios',          id_registro_afectado: 9,   accion: 'CREAR',               descripcion: 'Nueva cuenta creada: recepcionista Luis Torres', ip_origen: '192.168.1.45',  fecha_evento: '2026-03-29T17:05:00Z' },
  { id_bitacora: 1240, usuario_nombre: 'Dr. Carlos Ramírez', usuario_username: 'c.ramirez', modulo: 'Autenticación', tabla_afectada: null,                id_registro_afectado: null, accion: 'LOGOUT',             descripcion: 'Cierre de sesión', ip_origen: '192.168.1.62',  fecha_evento: '2026-03-29T16:55:10Z' },
  { id_bitacora: 1239, usuario_nombre: 'Administrador', usuario_username: 'admin',           modulo: 'Especialistas', tabla_afectada: 'especialistas',     id_registro_afectado: 8,   accion: 'EDITAR',              descripcion: 'Datos del especialista actualizados: Dr. Luis Mendoza', ip_origen: '192.168.1.45',  fecha_evento: '2026-03-29T16:40:33Z' },
  { id_bitacora: 1238, usuario_nombre: 'Recepcionista Ana', usuario_username: 'a.perez',     modulo: 'Citas',         tabla_afectada: 'citas',             id_registro_afectado: 195, accion: 'CANCELAR',            descripcion: 'Cita cancelada por paciente: Laura Sánchez', ip_origen: '192.168.1.38',  fecha_evento: '2026-03-29T16:22:00Z' },
  { id_bitacora: 1237, usuario_nombre: 'Administrador', usuario_username: 'admin',           modulo: 'Autenticación', tabla_afectada: null,                id_registro_afectado: null, accion: 'CAMBIAR_PASSWORD',   descripcion: 'Contraseña actualizada por el administrador', ip_origen: '192.168.1.45',  fecha_evento: '2026-03-29T15:50:00Z' },
  { id_bitacora: 1236, usuario_nombre: 'Dra. María González', usuario_username: 'm.gonzalez', modulo: 'Autenticación', tabla_afectada: null,               id_registro_afectado: null, accion: 'LOGIN',              descripcion: 'Inicio de sesión exitoso', ip_origen: '192.168.1.71',  fecha_evento: '2026-03-29T15:35:20Z' },
  { id_bitacora: 1235, usuario_nombre: 'Administrador', usuario_username: 'admin',           modulo: 'Pacientes',     tabla_afectada: 'pacientes',         id_registro_afectado: 310, accion: 'EDITAR',              descripcion: 'Datos actualizados del paciente: Ana Martínez', ip_origen: '192.168.1.45',  fecha_evento: '2026-03-29T15:12:44Z' },
  { id_bitacora: 1234, usuario_nombre: 'Sistema',       usuario_username: null,              modulo: 'Autenticación', tabla_afectada: null,                id_registro_afectado: null, accion: 'LOGIN_FALLIDO',      descripcion: 'Intento de login fallido — IP bloqueada temporalmente', ip_origen: '185.220.101.8', fecha_evento: '2026-03-29T14:58:00Z' },
  { id_bitacora: 1233, usuario_nombre: 'Dr. Luis Mendoza', usuario_username: 'l.mendoza',   modulo: 'Consultas',     tabla_afectada: 'consultas_medicas', id_registro_afectado: 86,  accion: 'CREAR',               descripcion: 'Consulta registrada — Pedro García, Glaucoma', ip_origen: '192.168.1.80',  fecha_evento: '2026-03-29T14:30:15Z' },
  { id_bitacora: 1232, usuario_nombre: 'Recepcionista Ana', usuario_username: 'a.perez',     modulo: 'Autenticación', tabla_afectada: null,                id_registro_afectado: null, accion: 'LOGIN',              descripcion: 'Inicio de sesión exitoso', ip_origen: '192.168.1.38',  fecha_evento: '2026-03-29T13:02:00Z' },
  { id_bitacora: 1231, usuario_nombre: 'Administrador', usuario_username: 'admin',           modulo: 'Citas',         tabla_afectada: 'citas',             id_registro_afectado: 200, accion: 'CREAR',               descripcion: 'Nueva cita programada: Pedro García — 01/04/2026 11:30', ip_origen: '192.168.1.45',  fecha_evento: '2026-03-29T12:45:00Z' },
  { id_bitacora: 1230, usuario_nombre: 'Administrador', usuario_username: 'admin',           modulo: 'Autenticación', tabla_afectada: null,                id_registro_afectado: null, accion: 'LOGIN',              descripcion: 'Inicio de sesión exitoso', ip_origen: '192.168.1.45',  fecha_evento: '2026-03-29T12:00:00Z' },
  { id_bitacora: 1229, usuario_nombre: 'Dr. Carlos Ramírez', usuario_username: 'c.ramirez', modulo: 'Autenticación', tabla_afectada: null,                id_registro_afectado: null, accion: 'LOGIN',              descripcion: 'Inicio de sesión exitoso', ip_origen: '192.168.1.62',  fecha_evento: '2026-03-29T11:55:30Z' },
];

/* ─── Helpers ────────────────────────────────────────── */
const ACCION_LABEL: Record<Accion, string> = {
  LOGIN: 'Login', LOGOUT: 'Logout', LOGIN_FALLIDO: 'Login fallido',
  CREAR: 'Crear', EDITAR: 'Editar', ELIMINAR: 'Eliminar',
  CAMBIAR_PASSWORD: 'Cambiar contraseña', RECUPERAR_PASSWORD: 'Recuperar contraseña',
  REPROGRAMAR: 'Reprogramar', CANCELAR: 'Cancelar', CONFIRMAR: 'Confirmar',
};

const MODULOS = ['Todos', 'Autenticación', 'Pacientes', 'Citas', 'Consultas', 'Historial', 'Especialistas', 'Usuarios'];
const ACCIONES: Array<{ value: string; label: string }> = [
  { value: 'all',                label: 'Todas las acciones' },
  { value: 'LOGIN',              label: 'Login'              },
  { value: 'LOGOUT',             label: 'Logout'             },
  { value: 'LOGIN_FALLIDO',      label: 'Login fallido'      },
  { value: 'CREAR',              label: 'Crear'              },
  { value: 'EDITAR',             label: 'Editar'             },
  { value: 'ELIMINAR',           label: 'Eliminar'           },
  { value: 'CAMBIAR_PASSWORD',   label: 'Cambiar contraseña' },
  { value: 'REPROGRAMAR',        label: 'Reprogramar'        },
  { value: 'CANCELAR',           label: 'Cancelar'           },
  { value: 'CONFIRMAR',          label: 'Confirmar'          },
];

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

type SortField = 'fecha_evento' | 'accion' | 'modulo' | 'usuario_nombre';
type SortDir   = 'asc' | 'desc';

const PAGE_SIZE = 10;

/* ─── Componente reloj Bolivia (actualiza cada segundo) ── */
function BoliviaClock() {
  const [time, setTime]     = useState('');
  const [dateStr, setDate]  = useState('');

  useEffect(() => {
    function tick() {
      setTime(nowBoliviaTime());
      setDate(nowBoliviaDateFull());
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.clockBox}>
      <span className={styles.clockLabel}>
        <span className={styles.clockDot} />
        Santa Cruz, Bolivia (UTC-4)
      </span>
      <span className={styles.clockTime}>{time || '—'}</span>
      <span className={styles.clockDate}>{dateStr}</span>
    </div>
  );
}

/* ─── Página ─────────────────────────────────────────── */
export default function BitacoraPage() {
  const [search,      setSearch]    = useState('');
  const [filterAcc,   setFilterAcc] = useState('all');
  const [filterMod,   setFilterMod] = useState('Todos');
  const [sortField,   setSortField] = useState<SortField>('fecha_evento');
  const [sortDir,     setSortDir]   = useState<SortDir>('desc');
  const [page,        setPage]      = useState(1);

  /* ── Filtrado + ordenamiento ── */
  const filtered = useMemo(() => {
    let data = [...MOCK];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(e =>
        e.descripcion?.toLowerCase().includes(q) ||
        e.modulo.toLowerCase().includes(q) ||
        e.ip_origen?.includes(q) ||
        e.usuario_nombre.toLowerCase().includes(q)
      );
    }

    if (filterAcc !== 'all')   data = data.filter(e => e.accion  === filterAcc);
    if (filterMod !== 'Todos') data = data.filter(e => e.modulo  === filterMod);

    data.sort((a, b) => {
      let av: string, bv: string;
      if (sortField === 'fecha_evento') {
        av = a.fecha_evento; bv = b.fecha_evento;
      } else {
        av = (a[sortField] ?? '').toString().toLowerCase();
        bv = (b[sortField] ?? '').toString().toLowerCase();
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return data;
  }, [search, filterAcc, filterMod, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(1);
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown size={12} className={styles.sortIcon} />;
    return sortDir === 'asc'
      ? <ArrowUp   size={12} className={`${styles.sortIcon} ${styles.active}`} />
      : <ArrowDown size={12} className={`${styles.sortIcon} ${styles.active}`} />;
  }

  /* Estadísticas del mock */
  const stats = {
    total:    MOCK.length,
    hoy:      MOCK.filter(e => fmtDate(e.fecha_evento) === fmtDate(new Date())).length,
    fallidos: MOCK.filter(e => e.accion === 'LOGIN_FALLIDO').length,
    sesiones: MOCK.filter(e => e.accion === 'LOGIN').length,
  };

  function clearFilters() {
    setSearch(''); setFilterAcc('all'); setFilterMod('Todos'); setPage(1);
  }

  const hasFilters = search || filterAcc !== 'all' || filterMod !== 'Todos';

  return (
    <>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.pageTitleRow}>
            <Activity size={22} color="var(--color-primary)" strokeWidth={2} />
            <h1 className={styles.pageTitle}>Bitácora del Sistema</h1>
          </div>
          <p className={styles.pageSubtitle}>
            Registro de auditoría y seguridad — todas las horas en zona horaria Bolivia (UTC-4)
          </p>
        </div>
        <BoliviaClock />
      </div>

      {/* ── KPI Stats ── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#EDE9FE' }}>
            <Shield size={19} color="var(--color-primary)" strokeWidth={1.8} />
          </div>
          <div className={styles.statBody}>
            <p className={styles.statValue}>{stats.total.toLocaleString()}</p>
            <p className={styles.statLabel}>Total registros</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#DBEAFE' }}>
            <Clock size={19} color="#2563EB" strokeWidth={1.8} />
          </div>
          <div className={styles.statBody}>
            <p className={styles.statValue}>{stats.hoy}</p>
            <p className={styles.statLabel}>Eventos hoy</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#DCFCE7' }}>
            <LogIn size={19} color="#16A34A" strokeWidth={1.8} />
          </div>
          <div className={styles.statBody}>
            <p className={styles.statValue}>{stats.sesiones}</p>
            <p className={styles.statLabel}>Sesiones iniciadas</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#FEE2E2' }}>
            <AlertTriangle size={19} color="#DC2626" strokeWidth={1.8} />
          </div>
          <div className={styles.statBody}>
            <p className={styles.statValue}>{stats.fallidos}</p>
            <p className={styles.statLabel}>Intentos fallidos</p>
          </div>
        </div>
      </div>

      {/* ── Panel con tabla ── */}
      <div className={styles.panel}>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          {/* Búsqueda */}
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}><Search size={15} /></span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por descripción, módulo, IP o usuario…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Filtro acción */}
          <select
            className={styles.filterSelect}
            value={filterAcc}
            onChange={e => { setFilterAcc(e.target.value); setPage(1); }}
          >
            {ACCIONES.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>

          {/* Filtro módulo */}
          <select
            className={styles.filterSelect}
            value={filterMod}
            onChange={e => { setFilterMod(e.target.value); setPage(1); }}
          >
            {MODULOS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          {hasFilters && (
            <button className={styles.clearBtn} onClick={clearFilters}>
              <RotateCcw size={13} /> Limpiar
            </button>
          )}

          <span className={styles.resultCount}>
            {filtered.length} de {MOCK.length} eventos
          </span>
        </div>

        {/* Tabla */}
        <div className={styles.tableWrap}>
          {pageData.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><Search size={22} /></div>
              <p className={styles.emptyTitle}>Sin resultados</p>
              <p className={styles.emptyText}>No hay eventos que coincidan con los filtros aplicados.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th onClick={() => toggleSort('fecha_evento')}>
                    Fecha / Hora (BO) <SortIcon field="fecha_evento" />
                  </th>
                  <th onClick={() => toggleSort('usuario_nombre')}>
                    Usuario <SortIcon field="usuario_nombre" />
                  </th>
                  <th onClick={() => toggleSort('modulo')}>
                    Módulo <SortIcon field="modulo" />
                  </th>
                  <th onClick={() => toggleSort('accion')}>
                    Acción <SortIcon field="accion" />
                  </th>
                  <th>Descripción</th>
                  <th>IP Origen</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map(ev => (
                  <tr key={ev.id_bitacora}>
                    {/* Timestamp en Bolivia */}
                    <td className={styles.tdTimestamp}>
                      <span className={styles.tsDate}>{fmtDate(ev.fecha_evento)}</span>
                      <span className={styles.tsTime}>{fmtTimeFull(ev.fecha_evento)}</span>
                      <span className={styles.tsRelative}>{fmtRelative(ev.fecha_evento)}</span>
                    </td>

                    {/* Usuario */}
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>
                          {getInitials(ev.usuario_nombre)}
                        </div>
                        <div>
                          <span className={styles.userName}>{ev.usuario_nombre}</span>
                          {ev.usuario_username && (
                            <span className={styles.userRole}>@{ev.usuario_username}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Módulo */}
                    <td>
                      <div className={styles.moduloCell}>
                        <span className={styles.moduloName}>{ev.modulo}</span>
                        {ev.tabla_afectada && (
                          <span className={styles.tablaName}>{ev.tabla_afectada}</span>
                        )}
                      </div>
                    </td>

                    {/* Acción */}
                    <td>
                      <span className={`${styles.badge} ${styles[`badge${ev.accion}`]}`}>
                        {ACCION_LABEL[ev.accion]}
                      </span>
                    </td>

                    {/* Descripción */}
                    <td className={styles.descCell} title={ev.descripcion ?? ''}>
                      {ev.descripcion ?? '—'}
                    </td>

                    {/* IP */}
                    <td className={styles.ipCell}>{ev.ip_origen ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {filtered.length > PAGE_SIZE && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
            </span>
            <div className={styles.pageButtons}>
              <button
                className={styles.pageBtn}
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<Array<number | '…'>>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…'
                    ? <span key={`e${i}`} className={styles.pageBtn} style={{ cursor: 'default', border: 'none' }}>…</span>
                    : <button
                        key={p}
                        className={`${styles.pageBtn} ${page === p ? styles.active : ''}`}
                        onClick={() => setPage(p as number)}
                      >
                        {p}
                      </button>
                )}

              <button
                className={styles.pageBtn}
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
                aria-label="Página siguiente"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
