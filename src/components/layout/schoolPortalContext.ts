import { createContext, useContext } from 'react';
import type { SchoolBundle, SchoolPortalSession } from '../../lib/supabase';

export interface SchoolPortalContextValue {
  bundle: SchoolBundle;
  session: SchoolPortalSession;
  refreshBundle: () => Promise<void>;
}

export const SchoolPortalContext = createContext<SchoolPortalContextValue | null>(null);

export function useSchoolPortal(): SchoolPortalContextValue {
  const ctx = useContext(SchoolPortalContext);
  if (!ctx) {
    throw new Error('useSchoolPortal must be used inside SchoolPortalLayout');
  }
  return ctx;
}

