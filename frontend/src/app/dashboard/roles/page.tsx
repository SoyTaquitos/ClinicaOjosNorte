'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import styles from '../iam.module.css';

interface RolRow {
  id_rol: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

function apiErr(e: unknown): string {
  const ax = e as {
    response?: { data?: Record<string, string[] | string> | string };
  };
  const d = ax.response?.data;
  if (typeof d === 'string') return d;
  if (d && typeof d === 'object') {
    const vals = Object.values(d).flat();
    const first = vals.find((x) => typeof x === 'string') as string | undefined;
    if (first) return first;
  }
  return 'Error al procesar la solicitud.';
}

const emptyForm = {
  nombre: '',
  descripcion: '',
  activo: true,
};

export default function RolesPage() {
  const [rows, setRows] = useState<RolRow[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const pageSize = 20;

  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editPk, setEditPk] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const loadRoles = useCallback(async (p: number) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await api.get<{ count: number; results: RolRow[] }>(`/api/roles?page=${p}`);
      setRows(res.data.results);
      setCount(res.data.count);
    } catch (e) {
      setErr(
        (e as { response?: { status?: number } }).response?.status === 403
          ? 'Solo administradores pueden gestionar roles.'
          : 'No se pudo cargar el listado.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles(page);
  }, [page, loadRoles]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormErr(null);
    setFieldErr({});
    setEditPk(null);
    setModal('create');
  };

  const openEdit = (r: RolRow) => {
    setForm({
      nombre: r.nombre,
      descripcion: r.descripcion ?? '',
      activo: r.activo,
    });
    setFormErr(null);
    setFieldErr({});
    setEditPk(r.id_rol);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditPk(null);
    setSaving(false);
  };

  const submit = async () => {
    setFormErr(null);
    setFieldErr({});
    setSaving(true);
    try {
      const body = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || undefined,
        activo: form.activo,
      };
      if (modal === 'create') {
        await api.post('/api/roles', body);
      } else if (modal === 'edit' && editPk != null) {
        await api.patch(`/api/roles/${editPk}`, body);
      }
      closeModal();
      await loadRoles(page);
    } catch (e) {
      const msg = apiErr(e);
      setFormErr(msg);
      const d = (e as { response?: { data?: Record<string, string[]> } }).response?.data;
      if (d && typeof d === 'object' && !Array.isArray(d)) {
        const fe: Record<string, string> = {};
        for (const [k, v] of Object.entries(d)) {
          if (Array.isArray(v) && v[0]) fe[k] = String(v[0]);
          else if (typeof v === 'string') fe[k] = v;
        }
        setFieldErr(fe);
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r: RolRow) => {
    if (
      !window.confirm(
        `¿Eliminar rol "${r.nombre}"? Solo si no está en uso crítico.`
      )
    ) {
      return;
    }
    setErr(null);
    try {
      await api.delete(`/api/roles/${r.id_rol}`);
      await loadRoles(page);
    } catch (e) {
      setErr(apiErr(e));
    }
  };

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Roles</h1>
        <p className={styles.muted}>Conjuntos de acceso pensados para cada tipo de responsabilidad.</p>
      </div>

      <div className={styles.toolbar}>
        <span />
        <button type="button" className={styles.btnPrimary} onClick={openCreate}>
          Nuevo rol
        </button>
      </div>

      {err && <div className={styles.err}>{err}</div>}

      {loading ? (
        <p className={styles.loading}>Cargando…</p>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Activo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id_rol}>
                    <td>{r.nombre}</td>
                    <td>{r.descripcion ?? '—'}</td>
                    <td>{r.activo ? 'Sí' : 'No'}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <button
                          type="button"
                          className={`${styles.btnSm} ${styles.btn}`}
                          onClick={() => openEdit(r)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={`${styles.btnSm} ${styles.btnDanger}`}
                          onClick={() => remove(r)}
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

          <div className={styles.pager}>
            <span>
              Página {page} de {totalPages} ({count} roles)
            </span>
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {modal && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={(ev) => {
            if (ev.target === ev.currentTarget) closeModal();
          }}
        >
          <div className={styles.modalPanel} role="dialog" aria-modal="true">
            <h2 className={styles.modalTitle}>
              {modal === 'create' ? 'Nuevo rol' : 'Editar rol'}
            </h2>
            {formErr && <div className={styles.err}>{formErr}</div>}
            <div className={styles.formRow}>
              <label htmlFor="r-nom">Nombre</label>
              <input
                id="r-nom"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              />
              {fieldErr.nombre && <p className={styles.fieldErr}>{fieldErr.nombre}</p>}
            </div>
            <div className={styles.formRow}>
              <label htmlFor="r-desc">Descripción</label>
              <textarea
                id="r-desc"
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formCheck}>
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
                />
                Activo
              </label>
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.btnGhost} onClick={closeModal} disabled={saving}>
                Cancelar
              </button>
              <button type="button" className={styles.btnPrimary} onClick={submit} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
