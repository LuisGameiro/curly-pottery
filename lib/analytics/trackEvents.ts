import posthog from 'posthog-js'
import ReactGA from 'react-ga4'

/**
 * Global track function for both PostHog and GA4
 * @param {string} eventName - GA4 recommended names (e.g., 'view_item')
 * @param {object} properties - Metadata about the action
 */
export function trackEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
) {
  posthog.capture(eventName, properties)

  ReactGA.event(eventName, properties)

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${eventName}`, properties)
  }
}
