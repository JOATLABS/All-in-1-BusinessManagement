import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

const DEFAULT_MESSAGE = 'You have unsaved changes. Do you want to leave this page and discard them?';

export const useUnsavedChangesPrompt = (isDirty: boolean, message = DEFAULT_MESSAGE) => {
  const blocker = useBlocker(isDirty);

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

  useEffect(() => {
    if (blocker.state !== 'blocked') {
      return;
    }

    const shouldLeave = window.confirm(message);

    if (shouldLeave) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker, message]);
};
