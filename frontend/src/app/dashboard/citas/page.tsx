'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import styles from '../clinic.module.css';

interface PageRes<T> { count: number; results: T[]; }
interface PacienteRow { id_paciente: number; nombres: string; apellidos: string; }
interface EspecialistaRow { id_especialista: number; nombre_usuario: string; especialidad: string; }
interface CitaRow { id_cita: number; id_paciente: number; id_especialista: number; fecha_hora_inicio: string; fecha_hora_fin: string; motivo: string; estado: string; }

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
  const [pacientes, setPacientes] = useState<PacienteRow[]>([]);
  const [especialistas, setEspecialistas] = useState<EspecialistaRow[]>([]);
  const [rows, setRows] = useState<CitaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [form, setForm] = useState({ id_paciente: '', id_especialista: '', fecha: '', hora: '', motivo: '' });

  const load = useCallback(async () => {
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
  }, []);

  useEffect(() => { load(); }, [load]);

  async function crearCita() {
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

  async function cancelar(id: number) {
    const motivo = window.prompt('Motivo de cancelacion')?.trim();
    if (!motivo) return;
    setErr(null);
    try {
      await api.post(`/api/citas/${id}/cancelar`, { motivo_cancelacion: motivo });
      setOk('Cita cancelada.');
      await load();
    } catch (error) { setErr(apiErr(error)); }
  }

  async function reprogramar(id: number) {
    const fecha = window.prompt('Nueva fecha (YYYY-MM-DD)');
    const hora = window.prompt('Nueva hora (HH:mm)');
    const motivo = window.prompt('Motivo de reprogramacion');
    if (!fecha || !hora || !motivo) return;
    try {
      const iso = new Date(`${fecha}T${hora}:00`).toISOString();
      await api.post(`/api/citas/${id}/reprogramar`, {
        nueva_fecha_hora_inicio: iso,
        motivo_reprogramacion: motivo,
      });
      setOk('Cita reprogramada.');
      await load();
    } catch (error) { setErr(apiErr(error)); }
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Citas</h1>
        <p className={styles.muted}>Programacion operativa con acciones de negocio: reprogramar y cancelar.</p>
      </div>
      <div className={styles.hero}>Las validaciones de disponibilidad y solapamiento viven en backend.</div>
      {err && <div className={styles.err}>{err}</div>}
      {ok && <div className={styles.ok}>{ok}</div>}

      <div className={styles.toolbar}>
        <div className={styles.field}><label>Paciente</label><select value={form.id_paciente} onChange={(e) => setForm((p) => ({ ...p, id_paciente: e.target.value }))}><option value="">Selecciona</option>{pacientes.map((p) => <option key={p.id_paciente} value={p.id_paciente}>{p.apellidos}, {p.nombres}</option>)}</select></div>
        <div className={styles.field}><label>Especialista</label><select value={form.id_especialista} onChange={(e) => setForm((p) => ({ ...p, id_especialista: e.target.value }))}><option value="">Selecciona</option>{especialistas.map((e) => <option key={e.id_especialista} value={e.id_especialista}>{e.nombre_usuario} · {e.especialidad}</option>)}</select></div>
        <div className={styles.field}><label>Fecha / Hora</label><div style={{ display: 'flex', gap: '0.5rem' }}><input type="date" value={form.fecha} onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))} /><input type="time" value={form.hora} onChange={(e) => setForm((p) => ({ ...p, hora: e.target.value }))} /></div></div>
        <div className={styles.actions}><button type="button" className={styles.btnPrimary} onClick={crearCita} disabled={loading}>Programar</button></div>
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
                <td>{r.id_paciente}</td>
                <td>{r.id_especialista}</td>
                <td>{new Date(r.fecha_hora_inicio).toLocaleString('es-BO')}</td>
                <td>{r.estado}</td>
                <td>{r.motivo}</td>
                <td>
                  <div className={styles.tableActions}>
                    <button type="button" className={styles.btn} onClick={() => reprogramar(r.id_cita)}>Reprogramar</button>
                    <button type="button" className={styles.btnDanger} onClick={() => cancelar(r.id_cita)}>Cancelar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
