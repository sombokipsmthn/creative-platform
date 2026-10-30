'use client'

/**
 * Portfolio Analytics
 *
 * Lightweight wrapper around Vercel Analytics for portfolio-specific events.
 * All events are prefixed with 'portfolio_' for easy filtering in Vercel dashboard.
 */

interface PortfolioEvent {
  name: string
  attributes?: Record<string, string | number | boolean>
}

/**
 * Track a portfolio event using Vercel Analytics.
 * Events are automatically prefixed with 'portfolio_'.
 */
export function trackPortfolioEvent(event: PortfolioEvent) {
  if (typeof window === 'undefined') return

  try {
    if ((window as unknown as { va?: (event: string, name: string, attrs?: Record<string, unknown>) => void }).va) {
      (window as unknown as { va: (event: string, name: string, attrs?: Record<string, unknown>) => void }).va('track', `portfolio_${event.name}`, event.attributes)
    }
  } catch (error) {
    // Silently fail - analytics should never break the app
    console.debug('Analytics error:', error)
  }
}

/**
 * Track portfolio page view
 */
export function trackPortfolioView(handle: string, isCustomDomain: boolean = false) {
  trackPortfolioEvent({
    name: 'view',
    attributes: {
      handle,
      customDomain: isCustomDomain,
    },
  })
}

/**
 * Track when a visitor clicks a project to view details
 */
export function trackProjectClick(handle: string, projectId: string, projectName: string) {
  trackPortfolioEvent({
    name: 'project_click',
    attributes: {
      handle,
      projectId,
      projectName,
    },
  })
}

/**
 * Track when a visitor clicks the contact email link
 */
export function trackContactClick(handle: string) {
  trackPortfolioEvent({
    name: 'contact_click',
    attributes: {
      handle,
    },
  })
}

/**
 * Track when a visitor clicks the website link
 */
export function trackWebsiteClick(handle: string) {
  trackPortfolioEvent({
    name: 'website_click',
    attributes: {
      handle,
    },
  })
}

/**
 * Track when a visitor starts playing a video
 */
export function trackVideoPlay(handle: string, projectId: string, projectName: string) {
  trackPortfolioEvent({
    name: 'video_play',
    attributes: {
      handle,
      projectId,
      projectName,
    },
  })
}

/**
 * Track when a visitor views a gallery/collection
 */
export function trackGalleryView(handle: string, galleryId: string, galleryTitle: string) {
  trackPortfolioEvent({
    name: 'gallery_view',
    attributes: {
      handle,
      galleryId,
      galleryTitle,
    },
  })
}

/**
 * Track when a visitor copies the portfolio URL
 */
export function trackUrlCopy(handle: string) {
  trackPortfolioEvent({
    name: 'url_copy',
    attributes: {
      handle,
    },
  })
}

/**
 * Track when a visitor uses keyboard navigation
 */
export function trackKeyboardNavigation(handle: string, key: string) {
  trackPortfolioEvent({
    name: 'keyboard_navigation',
    attributes: {
      handle,
      key,
    },
  })
}

/**
 * Hook for tracking scroll depth on portfolio page
 */
export function useScrollDepthTracking(handle: string) {
  if (typeof window === 'undefined') return

  const trackedDepths = new Set<number>()

  const handleScroll = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = Math.round((scrollTop / docHeight) * 100)

    // Track at 25%, 50%, 75%, 100%
    const milestones = [25, 50, 75, 100]

    for (const milestone of milestones) {
      if (scrollPercent >= milestone && !trackedDepths.has(milestone)) {
        trackedDepths.add(milestone)
        trackPortfolioEvent({
          name: 'scroll_depth',
          attributes: {
            handle,
            depth: milestone,
          },
        })
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true })

  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
}