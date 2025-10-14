import { useEffect } from 'react';

const DEFAULT_MESSAGE = 'You have unsaved changes. Do you want to leave this page and discard them?';

export const useUnsavedChangesPrompt = (isDirty: boolean, message = DEFAULT_MESSAGE) => {
  // Browser warning when trying to close tab/navigate away
  useEffect(() => {
    if (!isDirty) {
      return undefined;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, message]);
};
