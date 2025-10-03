import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type OverlayKey = 'about' | 'events' | 'reserve' | 'tickets' | 'contact' | 'legal' | null;

interface OverlayContextValue {
  current: OverlayKey;
  openOverlay: (key: Exclude<OverlayKey, null>) => void;
  closeOverlay: () => void;
}

const OverlayContext = createContext<OverlayContextValue | undefined>(undefined);

export const OverlayContextProvider = ({ children }: { children: ReactNode }) => {
  const [current, setCurrent] = useState<OverlayKey>(null);

  const openOverlay = useCallback((key: Exclude<OverlayKey, null>) => {
    setCurrent(key);
  }, []);

  const closeOverlay = useCallback(() => {
    setCurrent(null);
  }, []);

  return (
    <OverlayContext.Provider value={{ current, openOverlay, closeOverlay }}>
      {children}
    </OverlayContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useOverlay = () => {
  const ctx = useContext(OverlayContext);
  if (!ctx) {
    throw new Error('useOverlay must be used within an OverlayContextProvider');
  }
  return ctx;
};
