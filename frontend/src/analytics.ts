// Google Analytics setup
type GtagConfig = Record<string, string | number | boolean | undefined>;
type GtagEventParameters = Record<string, string | number | boolean | undefined>;
type GtagArguments = [string, ...(string | number | boolean | Date | GtagConfig | GtagEventParameters)[]];

declare global {
  interface Window {
    dataLayer: GtagArguments[];
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
  const dataLayer = window.dataLayer ?? [];
  window.dataLayer = dataLayer;
  window.gtag = (...args: GtagArguments) => {
    dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);
}

// Export helper functions for tracking custom events
export const trackEvent = (
  eventName: string,
  eventParams?: GtagEventParameters
) => {
  if (GA_MEASUREMENT_ID && window.gtag) {
    window.gtag('event', eventName, eventParams ?? {});
  }
};

export const trackPageView = (pagePath: string) => {
  if (GA_MEASUREMENT_ID && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pagePath
    });
  }
};
