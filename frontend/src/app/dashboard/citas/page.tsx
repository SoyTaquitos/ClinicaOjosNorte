'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { useDashboardUser } from '@/contexts/DashboardUserContext';
import { canViewClinicalModule, canWriteCitaAction, canWriteModule } from '@/lib/authorization';
import styles from '../clinic.module.css';

interface PageRes<T> { count: number; results: T[]; }
interface PacienteRow { id_paciente: number; nombres: string; apellidos: string; }
interface EspecialistaRow { id_especialista: number; nombre_usuario: string; especialidad: string; }
interface CitaRow { id_cita: number; id_paciente: number; id_especialista: number; fecha_hora_inicio: string; fecha_hora_fin: string; motivo: string; estado: string; }

const MIN_MOTIVO_LEN = 8;
const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function apiErr(e: unknown): string {
  const d = (e as { response?: { data?: Record<string, unknown> | string } }).response?.data;
  if (typeof d === 'string') return d;
  if (d && typeof d === 'object') {
    if (typeof d.detail === 'string') return d.detail;
    const vals = Object.values(d).flat();
    const v = vals.find((x) => typeof x === 'string');
    if (typeof v === 'string') return v;
  }
  return 'Error en solicitud.';
}

export default function CitasPage() {
  const { me, permissionCodes } = useDashboardUser();
  const [pacientes, setPacientes] = useState<PacienteRow[]>([]);
  const [especialistas, setEspecialistas] = useState<EspecialistaRow[]>([]);
  const [rows, setRows] = useState<CitaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [form, setForm] = useState({ id_paciente: '', id_especialista: '', fecha: '', hora: '', motivo: '' });

  // Modal States
  const [cancelModal, setCancelModal] = useState({ isOpen: false, citaId: null as number | null, motivo: '' });
  const [reschModal, setReschModal] = useState({ isOpen: false, citaId: null as number | null, fecha: '', hora: '', motivo: '' });
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [cancelTouched, setCancelTouched] = useState(false);
  const [reschTouched, setReschTouched] = useState(false);
  const canManageCitas = canWriteModule(me, 'citas', permissionCodes);
  const canCreateCitas = canWriteCitaAction(me, 'crear', permissionCodes);
  const canReprogramCitas = canWriteCitaAction(me, 'reprogramar', permissionCodes);
  const canCancelCitas = canWriteCitaAction(me, 'cancelar', permissionCodes);
  const canViewCitas = canViewClinicalModule(me, 'citas', permissionCodes);

  const cancelPanelRef = useRef<HTMLDivElement | null>(null);
  const reschPanelRef = useRef<HTMLDivElement | null>(null);
  const cancelMotivoRef = useRef<HTMLTextAreaElement | null>(null);
  const reschFechaRef = useRef<HTMLInputElement | null>(null);

  const cancelMotivoLen = cancelModal.motivo.trim().length;
  const cancelMotivoErr = cancelTouched && cancelMotivoLen < MIN_MOTIVO_LEN
    ? `El motivo debe tener al menos ${MIN_MOTIVO_LEN} caracteres.`
    : null;
  const reschMotivoLen = reschModal.motivo.trim().length;
  const reschFechaErr = reschTouched && !reschModal.fecha ? 'La fecha es obligatoria.' : null;
  const reschHoraErr = reschTouched && !reschModal.hora ? 'La hora es obligatoria.' : null;
  const reschMotivoErr = reschTouched && reschMotivoLen < MIN_MOTIVO_LEN
    ? `El motivo debe tener al menos ${MIN_MOTIVO_LEN} caracteres.`
    : null;

  const openCancelModal = (id: number) => {
    if (!canCancelCitas) return;
    setCancelTouched(false);
    setCancelModal({ isOpen: true, citaId: id, motivo: '' });
  };

  const closeCancelModal = useCallback(() => {
    if (submittingCancel) return;
    setCancelTouched(false);
    setCancelModal({ isOpen: false, citaId: null, motivo: '' });
  }, [submittingCancel]);

  const openReschModal = (id: number) => {
    if (!canReprogramCitas) return;
    setReschTouched(false);
    setReschModal({ isOpen: true, citaId: id, fecha: '', hora: '', motivo: '' });
  };

  const closeReschModal = useCallback(() => {
    if (submittingReschedule) return;
    setReschTouched(false);
    setReschModal({ isOpen: false, citaId: null, fecha: '', hora: '', motivo: '' });
  }, [submittingReschedule]);

  const trapFocus = (panel: HTMLDivElement, event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  useEffect(() => {
    if (cancelModal.isOpen) {
      cancelMotivoRef.current?.focus();
    }
  }, [cancelModal.isOpen]);

  useEffect(() => {
    if (reschModal.isOpen) {
      reschFechaRef.current?.focus();
    }
  }, [reschModal.isOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (cancelModal.isOpen) {
          event.preventDefault();
          closeCancelModal();
          return;
        }
        if (reschModal.isOpen) {
          event.preventDefault();
          closeReschModal();
        }
        return;
      }

      if (cancelModal.isOpen && cancelPanelRef.current) {
        trapFocus(cancelPanelRef.current, event);
        return;
      }

      if (reschModal.isOpen && reschPanelRef.current) {
        trapFocus(reschPanelRef.current, event);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cancelModal.isOpen, closeCancelModal, closeReschModal, reschModal.isOpen]);

  const load = useCallback(async () => {
    if (!canViewCitas) {
      setPacientes([]);
      setEspecialistas([]);
      setRows([]);
      setErr('No tienes permiso para ver el módulo de citas.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const [p, e, c] = await Promise.all([
        api.get<PageRes<PacienteRow>>('/api/pacientes?page=1'),
        api.get<PageRes<EspecialistaRow>>('/api/especialistas?page=1'),
        api.get<PageRes<CitaRow>>('/api/citas?page=1'),
      ]);
      setPacientes(p.data.results ?? []);
      setEspecialistas(e.data.results ?? []);
      setRows(c.data.results ?? []);
    } catch (error) {
      setErr(apiErr(error));
    } finally { setLoading(false); }
  }, [canViewCitas]);

  useEffect(() => { load(); }, [load]);

  async function crearCita() {
    if (!canCreateCitas) {
      setErr('No tienes permiso para programar citas.');
      return;
    }
    if (!form.id_paciente || !form.id_especialista || !form.fecha || !form.hora) return;
    setErr(null);
    try {
      const iso = new Date(`${form.fecha}T${form.hora}:00`).toISOString();
      await api.post('/api/citas', {
        id_paciente: Number(form.id_paciente),
        id_especialista: Number(form.id_especialista),
        fecha_hora_inicio: iso,
        motivo: form.motivo,
      });
      setOk('Cita programada.');
      setForm({ id_paciente: '', id_especialista: '', fecha: '', hora: '', motivo: '' });
      await load();
    } catch (error) {
      setErr(apiErr(error));
    }
  }

  async function confirmarCancelar() {
    if (!canCancelCitas) {
      setErr('No tienes permiso para cancelar citas.');
      return;
    }
    const motivo = cancelModal.motivo.trim();
    setCancelTouched(true);
    if (!cancelModal.citaId || motivo.length < MIN_MOTIVO_LEN || submittingCancel) return;
    setErr(null);
    setSubmittingCancel(true);
    try {
      await api.post(`/api/citas/${cancelModal.citaId}/cancelar`, { motivo_cancelacion: motivo });
      setOk('Cita cancelada exitosamente.');
      closeCancelModal();
      await load();
    } catch (error) {
      setErr(apiErr(error));
    } finally {
      setSubmittingCancel(false);
    }
  }

  async function confirmarReprogramar() {
    if (!canReprogramCitas) {
      setErr('No tienes permiso para reprogramar citas.');
      return;
    }
    const motivo = reschModal.motivo.trim();
    setReschTouched(true);
    if (!reschModal.citaId || !reschModal.fecha || !reschModal.hora || motivo.length < MIN_MOTIVO_LEN || submittingReschedule) return;
    setErr(null);
    setSubmittingReschedule(true);
    try {
      const dt = new Date(`${reschModal.fecha}T${reschModal.hora}:00`);
      if (Number.isNaN(dt.getTime())) {
        setErr('Fecha u hora invalida para reprogramar la cita.');
        return;
      }
      const iso = dt.toISOString();
      await api.post(`/api/citas/${reschModal.citaId}/reprogramar`, {
        nueva_fecha_hora_inicio: iso,
        motivo_reprogramacion: motivo,
      });
      setOk('Cita reprogramada exitosamente.');
      closeReschModal();
      await load();
    } catch (error) {
      setErr(apiErr(error));
    } finally {
      setSubmittingReschedule(false);
    }
  }

  const getPacienteNombre = (id: number) => {
    const p = pacientes.find(x => x.id_paciente === id);
    return p ? `${p.nombres} ${p.apellidos}` : id;
  };

  const getEspecialistaNombre = (id: number) => {
    const e = especialistas.find(x => x.id_especialista === id);
    return e ? `${e.nombre_usuario} (${e.especialidad})` : id;
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Citas</h1>
        <p className={styles.muted}>Programacion operativa con acciones de negocio: reprogramar y cancelar.</p>
      </div>
      <div className={styles.hero}>Las validaciones de disponibilidad y solapamiento viven en backend.</div>
      {err && <div className={styles.err}>{err}</div>}
      {ok && <div className={styles.ok}>{ok}</div>}
      {!canManageCitas && <div className={styles.err}>Tu rol es de solo lectura en Citas. Puedes consultar agenda y estados, pero no programar ni modificar citas.</div>}
      {canManageCitas && (!canCreateCitas || !canReprogramCitas || !canCancelCitas) && (
        <div className={styles.muted}>Permisos activos en Citas: {canCreateCitas ? 'crear ' : ''}{canReprogramCitas ? 'reprogramar ' : ''}{canCancelCitas ? 'cancelar' : ''}</div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.field}><label>Paciente</label><select value={form.id_paciente} onChange={(e) => setForm((p) => ({ ...p, id_paciente: e.target.value }))}><option value="">Selecciona</option>{pacientes.map((p) => <option key={p.id_paciente} value={p.id_paciente}>{p.apellidos}, {p.nombres}</option>)}</select></div>
        <div className={styles.field}><label>Especialista</label><select value={form.id_especialista} onChange={(e) => setForm((p) => ({ ...p, id_especialista: e.target.value }))}><option value="">Selecciona</option>{especialistas.map((e) => <option key={e.id_especialista} value={e.id_especialista}>{e.nombre_usuario} · {e.especialidad}</option>)}</select></div>
        <div className={styles.field}><label>Fecha / Hora</label><div style={{ display: 'flex', gap: '0.5rem' }}><input type="date" value={form.fecha} onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))} /><input type="time" value={form.hora} onChange={(e) => setForm((p) => ({ ...p, hora: e.target.value }))} /></div></div>
        <div className={styles.actions}><button type="button" className={styles.btnPrimary} onClick={crearCita} disabled={loading || !canCreateCitas}>Programar</button></div>
      </div>
      <div className={styles.field} style={{ marginBottom: '1rem' }}><label>Motivo</label><input value={form.motivo} onChange={(e) => setForm((p) => ({ ...p, motivo: e.target.value }))} /></div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>ID</th><th>Paciente</th><th>Especialista</th><th>Inicio</th><th>Estado</th><th>Motivo</th><th>Acciones</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={7}>Cargando...</td></tr>}
            {!loading && rows.map((r) => (
              <tr key={r.id_cita}>
                <td>{r.id_cita}</td>
                <td>{getPacienteNombre(r.id_paciente)}</td>
                <td>{getEspecialistaNombre(r.id_especialista)}</td>
                <td>{new Date(r.fecha_hora_inicio).toLocaleString('es-BO')}</td>
                <td>{r.estado}</td>
                <td>{r.motivo}</td>
                <td>
                  <div className={styles.tableActions}>
                    <button type="button" className={styles.btn} onClick={() => openReschModal(r.id_cita)} disabled={!canReprogramCitas}>Reprogramar</button>
                    <button type="button" className={styles.btnDanger} onClick={() => openCancelModal(r.id_cita)} disabled={!canCancelCitas}>Cancelar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cancel Modal */}
      {cancelModal.isOpen && (
        <div className={styles.modalBackdrop} onClick={closeCancelModal}>
          <div className={styles.modalPanel} role="dialog" aria-modal="true" aria-labelledby="cancel-modal-title" ref={cancelPanelRef} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle} id="cancel-modal-title">Cancelar Cita #{cancelModal.citaId}</h2>
            <div className={styles.field}>
              <label>Motivo de cancelación</label>
              <textarea ref={cancelMotivoRef} value={cancelModal.motivo} onChange={(e) => setCancelModal(prev => ({ ...prev, motivo: e.target.value }))} placeholder="Explique brevemente por qué se cancela la cita..." aria-invalid={Boolean(cancelMotivoErr)} aria-describedby="cancel-motivo-help" />
              <small id="cancel-motivo-help" className={cancelMotivoErr ? styles.fieldErr : styles.muted}>
                {cancelMotivoErr ?? `Minimo ${MIN_MOTIVO_LEN} caracteres.`}
              </small>
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.btn} onClick={closeCancelModal} disabled={submittingCancel}>Volver</button>
              <button type="button" className={styles.btnDanger} onClick={confirmarCancelar} disabled={cancelModal.motivo.trim().length < MIN_MOTIVO_LEN || submittingCancel}>{submittingCancel ? 'Cancelando...' : 'Confirmar Cancelación'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschModal.isOpen && (
        <div className={styles.modalBackdrop} onClick={closeReschModal}>
          <div className={styles.modalPanel} role="dialog" aria-modal="true" aria-labelledby="resch-modal-title" ref={reschPanelRef} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle} id="resch-modal-title">Reprogramar Cita #{reschModal.citaId}</h2>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>Nueva Fecha</label>
                <input ref={reschFechaRef} type="date" value={reschModal.fecha} onChange={(e) => setReschModal(prev => ({ ...prev, fecha: e.target.value }))} aria-invalid={Boolean(reschFechaErr)} aria-describedby="resch-fecha-help" />
                {reschFechaErr && <small id="resch-fecha-help" className={styles.fieldErr}>{reschFechaErr}</small>}
              </div>
              <div className={styles.field}>
                <label>Nueva Hora</label>
                <input type="time" value={reschModal.hora} onChange={(e) => setReschModal(prev => ({ ...prev, hora: e.target.value }))} aria-invalid={Boolean(reschHoraErr)} aria-describedby="resch-hora-help" />
                {reschHoraErr && <small id="resch-hora-help" className={styles.fieldErr}>{reschHoraErr}</small>}
              </div>
            </div>
            <div className={styles.field} style={{ marginTop: '1rem' }}>
              <label>Motivo de Reprogramación</label>
              <textarea value={reschModal.motivo} onChange={(e) => setReschModal(prev => ({ ...prev, motivo: e.target.value }))} placeholder="Explique el motivo..." aria-invalid={Boolean(reschMotivoErr)} aria-describedby="resch-motivo-help" />
              <small id="resch-motivo-help" className={reschMotivoErr ? styles.fieldErr : styles.muted}>
                {reschMotivoErr ?? `Minimo ${MIN_MOTIVO_LEN} caracteres.`}
              </small>
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.btn} onClick={closeReschModal} disabled={submittingReschedule}>Volver</button>
              <button type="button" className={styles.btnPrimary} onClick={confirmarReprogramar} disabled={!reschModal.fecha || !reschModal.hora || reschModal.motivo.trim().length < MIN_MOTIVO_LEN || submittingReschedule}>{submittingReschedule ? 'Reprogramando...' : 'Confirmar Reprogramación'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
