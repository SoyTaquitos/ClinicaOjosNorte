'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import api from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import type { MeProfile } from '@/lib/meProfile';

type DashboardUserValue = {
  me: MeProfile | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const DashboardUserContext = createContext<DashboardUserValue | null>(null);

export function DashboardUserProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getAccessToken()) {
      setMe(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get<MeProfile>('/api/auth/me');
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ me, loading, refresh }), [me, loading, refresh]);

  return (
    <DashboardUserContext.Provider value={value}>{children}</DashboardUserContext.Provider>
  );
}

export function useDashboardUser(): DashboardUserValue {
  const ctx = useContext(DashboardUserContext);
  if (!ctx) {
    throw new Error('useDashboardUser debe usarse dentro de DashboardUserProvider');
  }
  return ctx;
}
