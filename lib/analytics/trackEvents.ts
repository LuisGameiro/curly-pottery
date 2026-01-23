import posthog from 'posthog-js';
import ReactGA from 'react-ga4';

/**
 * Global track function for both PostHog and GA4
 * @param {string} eventName - GA4 recommended names (e.g., 'view_item')
 * @param {object} properties - Metadata about the action
 */
export const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
  // 1. Send to PostHog
  posthog.capture(eventName, properties);

  // 2. Send to Google Analytics (GA4)
  ReactGA.event(eventName, properties);

  // Optional: log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${eventName}`, properties);
  }
};