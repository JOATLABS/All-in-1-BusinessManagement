import { createContext, useContext, type ReactNode } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';
import type { SiteContent } from '../types/content';

interface SiteContentContextValue {
  content: SiteContent;
  isReady: boolean;
  refresh: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export const SiteContentProvider = ({ children }: { children: ReactNode }) => {
  const { content, isReady, refresh } = useSiteContent();

  return (
    <SiteContentContext.Provider value={{ content, isReady, refresh }}>
      {children}
    </SiteContentContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSiteContentContext = () => {
  const context = useContext(SiteContentContext);

  if (!context) {
    throw new Error('useSiteContentContext must be used within a SiteContentProvider');
  }

  return context;
};
