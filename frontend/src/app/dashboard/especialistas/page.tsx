"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { useDashboardUser } from "@/contexts/DashboardUserContext";
import { canViewClinicalModule, canWriteModule } from "@/lib/authorization";
import styles from "../clinic.module.css";

interface UserLite {
  id: number;
  nombre_completo?: string;
  username?: string;
  tipo_usuario?: string;
}
interface EspecialistaRow {
  id_especialista: number;
  id_usuario: number;
  nombre_usuario: string;
  especialidad: string;
  registro_profesional: string;
  activo: boolean;
}
interface HorarioRow {
  id_horario: number;
  id_especialista: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  duracion_slot_min: number;
  activo: boolean;
}
interface PageRes<T> {
  count: number;
  results: T[];
}

const dias = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
];

function apiErr(e: unknown): string {
  const d = (e as { response?: { data?: Record<string, unknown> | string } })
    .response?.data;
  if (typeof d === "string") return d;
  if (d && typeof d === "object") {
    const msg = (d.detail || d.error) as string | undefined;
    if (msg) return msg;
  }
  return "Error de solicitud.";
}

export default function EspecialistasPage() {
  const { me, permissionCodes } = useDashboardUser();
  const [users, setUsers] = useState<UserLite[]>([]);
  const [rows, setRows] = useState<EspecialistaRow[]>([]);
  const [horarios, setHorarios] = useState<HorarioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [form, setForm] = useState({
    id_usuario: "",
    especialidad: "",
    registro_profesional: "",
    activo: true,
  });
  const [saving, setSaving] = useState(false);

  const [hForm, setHForm] = useState({
    id_especialista: "",
    dia_semana: "0",
    hora_inicio: "08:00",
    hora_fin: "12:00",
    duracion_slot_min: "30",
    activo: true,
  });
  const [savingH, setSavingH] = useState(false);
  const canManageEspecialistas = canWriteModule(
    me,
    "especialistas",
    permissionCodes,
  );
  const canViewEspecialistas = canViewClinicalModule(
    me,
    "especialistas",
    permissionCodes,
  );

  const load = useCallback(async () => {
    if (!canViewEspecialistas) {
      setUsers([]);
      setRows([]);
      setHorarios([]);
      setErr("No tienes permiso para ver Especialistas y Horarios.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const [u, e, h] = await Promise.all([
        api.get<PageRes<UserLite>>("/api/users?page=1"),
        api.get<PageRes<EspecialistaRow>>("/api/especialistas?page=1"),
        api.get<PageRes<HorarioRow>>("/api/horarios-especialista?page=1"),
      ]);
      setUsers(u.data.results ?? []);
      setRows(e.data.results ?? []);
      setHorarios(h.data.results ?? []);
    } catch (error) {
      setErr(apiErr(error));
    } finally {
      setLoading(false);
    }
  }, [canViewEspecialistas]);

  useEffect(() => {
    load();
  }, [load]);

  async function addEspecialista() {
    if (!canManageEspecialistas) {
      setErr("No tienes permiso para crear especialistas.");
      return;
    }
    if (!form.id_usuario) return;
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      await api.post("/api/especialistas", {
        id_usuario: Number(form.id_usuario),
        especialidad: form.especialidad.trim(),
        registro_profesional: form.registro_profesional.trim(),
        activo: form.activo,
      });
      setOk("Especialista creado.");
      setForm({
        id_usuario: "",
        especialidad: "",
        registro_profesional: "",
        activo: true,
      });
      await load();
    } catch (error) {
      setErr(apiErr(error));
    } finally {
      setSaving(false);
    }
  }

  async function removeEspecialista(id: number) {
    if (!canManageEspecialistas) {
      setErr("No tienes permiso para eliminar especialistas.");
      return;
    }
    if (!window.confirm("Eliminar especialista?")) return;
    setErr(null);
    try {
      await api.delete(`/api/especialistas/${id}`);
      setOk("Especialista eliminado.");
      await load();
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      if (status === 409) {
        const row = rows.find((r) => r.id_especialista === id);
        const shouldDeactivate = window.confirm(
          "No se puede eliminar porque tiene historial clínico asociado. ¿Quieres desactivarlo ahora?",
        );
        if (row && shouldDeactivate) {
          await deactivateEspecialista(row);
          return;
        }
      }
      setErr(apiErr(error));
    }
  }

  async function deactivateEspecialista(row: EspecialistaRow) {
    if (!canManageEspecialistas) {
      setErr("No tienes permiso para desactivar especialistas.");
      return;
    }
    if (!row.activo) {
      setOk("El especialista ya está inactivo.");
      return;
    }
    setErr(null);
    setOk(null);
    try {
      await api.patch(`/api/especialistas/${row.id_especialista}`, {
        activo: false,
      });
      setOk("Especialista desactivado.");
      await load();
    } catch (error) {
      setErr(apiErr(error));
    }
  }

  async function addHorario() {
    if (!canManageEspecialistas) {
      setErr("No tienes permiso para crear horarios.");
      return;
    }
    if (!hForm.id_especialista) return;
    setSavingH(true);
    setErr(null);
    try {
      await api.post("/api/horarios-especialista", {
        id_especialista: Number(hForm.id_especialista),
        dia_semana: Number(hForm.dia_semana),
        hora_inicio: hForm.hora_inicio,
        hora_fin: hForm.hora_fin,
        duracion_slot_min: Number(hForm.duracion_slot_min),
        activo: hForm.activo,
      });
      setOk("Horario creado.");
      setHForm({
        id_especialista: "",
        dia_semana: "0",
        hora_inicio: "08:00",
        hora_fin: "12:00",
        duracion_slot_min: "30",
        activo: true,
      });
      await load();
    } catch (error) {
      setErr(apiErr(error));
    } finally {
      setSavingH(false);
    }
  }

  async function removeHorario(id: number) {
    if (!canManageEspecialistas) {
      setErr("No tienes permiso para eliminar horarios.");
      return;
    }
    if (!window.confirm("Eliminar horario?")) return;
    setErr(null);
    try {
      await api.delete(`/api/horarios-especialista/${id}`);
      setOk("Horario eliminado.");
      await load();
    } catch (error) {
      setErr(apiErr(error));
    }
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Especialistas y horarios</h1>
        <p className={styles.muted}>
          Gestion de perfiles profesionales y disponibilidad base para citas.
        </p>
      </div>

      <div className={styles.hero}>
        Primero registra el especialista y luego configura sus bloques de
        horario semanales.
      </div>
      {err && <div className={styles.err}>{err}</div>}
      {ok && <div className={styles.ok}>{ok}</div>}
      {!canManageEspecialistas && (
        <div className={styles.err}>
          Tu rol es de solo lectura en Especialistas y Horarios. Puedes
          consultar datos, pero no crear ni eliminar.
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.field}>
          <label htmlFor="u">Usuario</label>
          <select
            id="u"
            value={form.id_usuario}
            onChange={(e) =>
              setForm((p) => ({ ...p, id_usuario: e.target.value }))
            }
          >
            <option value="">Selecciona usuario</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre_completo || u.username || `Usuario ${u.id}`}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="esp">Especialidad</label>
          <input
            id="esp"
            value={form.especialidad}
            onChange={(e) =>
              setForm((p) => ({ ...p, especialidad: e.target.value }))
            }
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="reg">Registro profesional</label>
          <input
            id="reg"
            value={form.registro_profesional}
            onChange={(e) =>
              setForm((p) => ({ ...p, registro_profesional: e.target.value }))
            }
          />
        </div>
        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            type="button"
            onClick={addEspecialista}
            disabled={saving || loading || !canManageEspecialistas}
          >
            Crear especialista
          </button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Especialidad</th>
              <th>Registro</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6}>Cargando...</td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.id_especialista}>
                  <td>{r.id_especialista}</td>
                  <td>{r.nombre_usuario || r.id_usuario}</td>
                  <td>{r.especialidad}</td>
                  <td>{r.registro_profesional}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${r.activo ? styles.badgeActive : styles.badgeInactive}`}
                    >
                      {r.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.tableActions}>
                      <button
                        className={styles.btn}
                        type="button"
                        onClick={() => deactivateEspecialista(r)}
                        disabled={!canManageEspecialistas || !r.activo}
                        title={r.activo ? "Desactivar especialista" : "Especialista ya inactivo"}
                      >
                        Desactivar
                      </button>
                      <button
                        className={styles.btnDanger}
                        type="button"
                        onClick={() => removeEspecialista(r.id_especialista)}
                        disabled={!canManageEspecialistas}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div style={{ height: "1rem" }} />

      <div className={styles.toolbar}>
        <div className={styles.field}>
          <label htmlFor="he">Especialista</label>
          <select
            id="he"
            value={hForm.id_especialista}
            onChange={(e) =>
              setHForm((p) => ({ ...p, id_especialista: e.target.value }))
            }
          >
            <option value="">Selecciona especialista</option>
            {rows.map((r) => (
              <option key={r.id_especialista} value={r.id_especialista}>
                {r.nombre_usuario} · {r.especialidad}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="dia">Dia semana</label>
          <select
            id="dia"
            value={hForm.dia_semana}
            onChange={(e) =>
              setHForm((p) => ({ ...p, dia_semana: e.target.value }))
            }
          >
            {dias.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="ini">Inicio / Fin</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              id="ini"
              type="time"
              value={hForm.hora_inicio}
              onChange={(e) =>
                setHForm((p) => ({ ...p, hora_inicio: e.target.value }))
              }
            />
            <input
              type="time"
              value={hForm.hora_fin}
              onChange={(e) =>
                setHForm((p) => ({ ...p, hora_fin: e.target.value }))
              }
            />
          </div>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            type="button"
            onClick={addHorario}
            disabled={savingH || loading || !canManageEspecialistas}
          >
            Crear horario
          </button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Especialista</th>
              <th>Dia</th>
              <th>Bloque</th>
              <th>Duracion</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6}>Cargando...</td>
              </tr>
            )}
            {!loading &&
              horarios.map((h) => (
                <tr key={h.id_horario}>
                  <td>{h.id_horario}</td>
                  <td>{h.id_especialista}</td>
                  <td>{dias[h.dia_semana] || h.dia_semana}</td>
                  <td>
                    {h.hora_inicio} - {h.hora_fin}
                  </td>
                  <td>{h.duracion_slot_min} min</td>
                  <td>
                    <button
                      className={styles.btnDanger}
                      type="button"
                      onClick={() => removeHorario(h.id_horario)}
                      disabled={!canManageEspecialistas}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
