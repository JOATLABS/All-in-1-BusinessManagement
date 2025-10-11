// Google Analytics setup
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
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
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);
}

// Export helper functions for tracking custom events
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
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
