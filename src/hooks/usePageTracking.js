import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../firebaseConfig';

/**
 * Tracks page views on every route change for SPA navigation.
 * Register this once inside a component that lives inside <BrowserRouter>.
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    logEvent(analytics, 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location]);
}
