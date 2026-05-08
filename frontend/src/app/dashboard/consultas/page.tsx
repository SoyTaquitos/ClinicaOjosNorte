'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import { useDashboardUser } from '@/contexts/DashboardUserContext';
import { canViewClinicalModule, canWriteModule } from '@/lib/authorization';
import styles from '../clinic.module.css';

interface PageRes<T> { count: number; results: T[]; }
interface CitaRow { id_cita: number; id_paciente: number; id_especialista: number; estado: string; }
interface ConsultaRow { id_consulta: number; id_cita: number; id_paciente: number; id_especialista: number; diagnostico: string; fecha_creacion: string; }

function apiErr(e: unknown): string {
  const d = (e as { response?: { data?: Record<string, unknown> | string } }).response?.data;
  if (typeof d === 'string') return d;
  if (d && typeof d === 'object') {
    const vals = Object.values(d).flat();
    const first = vals.find((v) => typeof v === 'string');
    if (typeof first === 'string') return first;
  }
  return 'No se pudo completar la accion.';
}

export default function ConsultasPage() {
  const { me, permissionCodes } = useDashboardUser();
  const [citas, setCitas] = useState<CitaRow[]>([]);
  const [rows, setRows] = useState<ConsultaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [form, setForm] = useState({
    id_cita: '', id_paciente: '', id_especialista: '', motivo_consulta: '', anamnesis: '', hallazgos: '', diagnostico: '', plan_tratamiento: '',
  });
  const canManageConsultas = canWriteModule(me, 'consultas', permissionCodes);
  const canViewConsultas = canViewClinicalModule(me, 'consultas', permissionCodes);

  const load = useCallback(async () => {
    if (!canViewConsultas) {
      setCitas([]);
      setRows([]);
      setErr('No tienes permiso para ver el módulo de consultas.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const [c, q] = await Promise.all([
        api.get<PageRes<CitaRow>>('/api/citas?page=1'),
        api.get<PageRes<ConsultaRow>>('/api/consultas-medicas?page=1'),
      ]);
      setCitas(c.data.results ?? []);
      setRows(q.data.results ?? []);
    } catch (error) {
      setErr(apiErr(error));
    } finally { setLoading(false); }
  }, [canViewConsultas]);

  useEffect(() => { load(); }, [load]);

  function onPickCita(id: string) {
    setForm((p) => ({ ...p, id_cita: id }));
    const c = citas.find((x) => String(x.id_cita) === id);
    if (c) {
      setForm((p) => ({ ...p, id_cita: id, id_paciente: String(c.id_paciente), id_especialista: String(c.id_especialista) }));
    }
  }

  async function createConsulta() {
    if (!canManageConsultas) {
      setErr('No tienes permiso para registrar consultas.');
      return;
    }
    if (!form.id_cita || !form.id_paciente || !form.id_especialista) return;
    setErr(null);
    setOk(null);
    try {
      await api.post('/api/consultas-medicas', {
        id_cita: Number(form.id_cita),
        id_paciente: Number(form.id_paciente),
        id_especialista: Number(form.id_especialista),
        motivo_consulta: form.motivo_consulta,
        anamnesis: form.anamnesis,
        hallazgos: form.hallazgos,
        diagnostico: form.diagnostico,
        plan_tratamiento: form.plan_tratamiento,
      });
      setOk('Consulta registrada y cita marcada como ATENDIDA.');
      setForm({ id_cita: '', id_paciente: '', id_especialista: '', motivo_consulta: '', anamnesis: '', hallazgos: '', diagnostico: '', plan_tratamiento: '' });
      await load();
    } catch (error) {
      setErr(apiErr(error));
    }
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Consultas medicas</h1>
        <p className={styles.muted}>Registro de atencion clinica vinculado a cita y consistencia paciente-especialista.</p>
      </div>
      {err && <div className={styles.err}>{err}</div>}
      {ok && <div className={styles.ok}>{ok}</div>}
      {!canManageConsultas && <div className={styles.err}>Tu rol es de solo lectura en Consultas. Puedes revisar historial, pero no registrar nuevas consultas.</div>}

      <div className={styles.toolbar}>
        <div className={styles.field}>
          <label>Cita</label>
          <select value={form.id_cita} onChange={(e) => onPickCita(e.target.value)}>
            <option value="">Selecciona cita</option>
            {citas.map((c) => <option key={c.id_cita} value={c.id_cita}>Cita {c.id_cita} · Paciente {c.id_paciente} · Estado {c.estado}</option>)}
          </select>
        </div>
        <div className={styles.field}><label>Paciente ID</label><input value={form.id_paciente} onChange={(e) => setForm((p) => ({ ...p, id_paciente: e.target.value }))} /></div>
        <div className={styles.field}><label>Especialista ID</label><input value={form.id_especialista} onChange={(e) => setForm((p) => ({ ...p, id_especialista: e.target.value }))} /></div>
        <div className={styles.actions}><button type="button" className={styles.btnPrimary} onClick={createConsulta} disabled={loading || !canManageConsultas}>Registrar consulta</button></div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}><label>Motivo consulta</label><textarea value={form.motivo_consulta} onChange={(e) => setForm((p) => ({ ...p, motivo_consulta: e.target.value }))} /></div>
        <div className={styles.field}><label>Anamnesis</label><textarea value={form.anamnesis} onChange={(e) => setForm((p) => ({ ...p, anamnesis: e.target.value }))} /></div>
        <div className={styles.field}><label>Hallazgos</label><textarea value={form.hallazgos} onChange={(e) => setForm((p) => ({ ...p, hallazgos: e.target.value }))} /></div>
        <div className={styles.field}><label>Diagnostico / Plan</label><textarea value={`${form.diagnostico}\n${form.plan_tratamiento}`} onChange={(e) => {
          const [diag, ...plan] = e.target.value.split('\n');
          setForm((p) => ({ ...p, diagnostico: diag || '', plan_tratamiento: plan.join('\n') }));
        }} /></div>
      </div>

      <div className={styles.tableWrap} style={{ marginTop: '1rem' }}>
        <table className={styles.table}>
          <thead><tr><th>ID</th><th>Cita</th><th>Paciente</th><th>Especialista</th><th>Diagnostico</th><th>Fecha</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6}>Cargando...</td></tr>}
            {!loading && rows.map((r) => (
              <tr key={r.id_consulta}>
                <td>{r.id_consulta}</td>
                <td>{r.id_cita}</td>
                <td>{r.id_paciente}</td>
                <td>{r.id_especialista}</td>
                <td>{r.diagnostico || '-'}</td>
                <td>{new Date(r.fecha_creacion).toLocaleString('es-BO')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
