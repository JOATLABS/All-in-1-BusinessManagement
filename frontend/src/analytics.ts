// Google Analytics setup
type GtagPrimitive = string | number | boolean | Date | undefined | null;
type GtagObject = Record<string, unknown>;
type GtagArguments = [string, ...(GtagPrimitive | GtagObject)[]];

declare global {
  interface Window {
    dataLayer: Array<GtagArguments>;
    gtag: (...args: GtagArguments) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Only load Google Analytics if measurement ID is configured
if (GA_MEASUREMENT_ID) {
  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer ?? ([] as GtagArguments[]);
  window.gtag = (...args: GtagArguments) => {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);
}

// Export helper functions for tracking custom events
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>
) => {
  if (GA_MEASUREMENT_ID && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

export const trackPageView = (pagePath: string) => {
  if (GA_MEASUREMENT_ID && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pagePath,
    });
  }
};
