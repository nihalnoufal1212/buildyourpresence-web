import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Business } from '@/lib/types';

interface BusinessContextValue {
  business: Business | null;
  setBusiness: (b: Business | null) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

const BusinessContext = createContext<BusinessContextValue | undefined>(
  undefined
);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  return (
    <BusinessContext.Provider
      value={{ business, setBusiness, loading, setLoading }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider');
  return ctx;
}
