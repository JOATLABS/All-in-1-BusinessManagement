import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type OverlayKey = 'about' | 'events' | 'reserve' | 'tickets' | 'contact' | 'legal' | null;

interface OverlayContextValue {
  current: OverlayKey;
  openOverlay: (key: Exclude<OverlayKey, null>) => void;
  closeOverlay: () => void;
}

const OverlayContext = createContext<OverlayContextValue | undefined>(undefined);

interface OverlayProviderProps {
  children: ReactNode;
}

export const OverlayContextProvider = ({ children }: OverlayProviderProps) => {
  const [current, setCurrent] = useState<OverlayKey>(null);

  const value = useMemo(
    () => ({
      current,
      openOverlay: (key: Exclude<OverlayKey, null>) => setCurrent(key),
      closeOverlay: () => setCurrent(null)
    }),
    [current]
  );

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useOverlay = () => {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('useOverlay must be used within an OverlayContextProvider');
  }

  return context;
};
