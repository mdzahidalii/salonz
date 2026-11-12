let googleMapsPromise = null;
let authFailed = false;

export function hasGoogleMapsAuthFailed() {
  return authFailed;
}

export function loadGoogleMapsScript(explicitKey) {
  const apiKey = explicitKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key not configured'));
  }

  if (authFailed) {
    return Promise.reject(new Error('Google Maps authentication failed'));
  }

  if (typeof window !== 'undefined' && window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const previousAuthFailure = window.gm_authFailure;
    window.gm_authFailure = () => {
      authFailed = true;
      if (typeof previousAuthFailure === 'function') {
        previousAuthFailure();
      }
      reject(new Error('Google Maps API authorization failed (check Cloud Console billing/referrers)'));
    };

    window.__auraInitGoogleMap = () => {
      if (!authFailed && window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps failed to initialize'));
      }
    };

    const existingScript = document.getElementById('aura-google-maps-sdk');
    if (existingScript) {
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps script')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'aura-google-maps-sdk';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&callback=__auraInitGoogleMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      googleMapsPromise = null;
      reject(new Error('Network error loading Google Maps JS API'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

