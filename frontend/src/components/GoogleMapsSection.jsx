import React, { useState, useEffect, useRef } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
  Check,
  ExternalLink,
  Compass,
  RotateCcw
} from 'lucide-react';
import { loadGoogleMapsScript, hasGoogleMapsAuthFailed } from '../utils/loadGoogleMaps';

const LUXURY_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#f7f3ed' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4a2e1b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#faf7f2' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8b5e3c' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8b5e3c' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#e9e4d8' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }]
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6d5848' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#e8dec8' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#dce6e8' }]
  }
];

export default function GoogleMapsSection() {
  const { salonInfo, showToast } = useSalon();
  const [copied, setCopied] = useState(false);
  const [sdkStatus, setSdkStatus] = useState('loading'); // loading, ready, fallback
  const [originInput, setOriginInput] = useState('');
  const [routeSummary, setRouteSummary] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  const mapContainerRef = useRef(null);
  const originInputRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const salonLat = Number(salonInfo?.coordinates?.lat) || 17.4319;
  const salonLng = Number(salonInfo?.coordinates?.lng) || 78.4073;

  const copyAddress = () => {
    navigator.clipboard.writeText(salonInfo.address);
    setCopied(true);
    showToast('Address copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${salonLat},${salonLng}`;

  // Initialize interactive Google Maps SDK
  useEffect(() => {
    let isMounted = true;

    const prevFailure = window.gm_authFailure;
    window.gm_authFailure = () => {
      if (typeof prevFailure === 'function') prevFailure();
      if (isMounted) setSdkStatus('fallback');
    };

    const initMapUI = async () => {
      try {
        const maps = await loadGoogleMapsScript(salonInfo?.googleMapsApiKey);
        if (!isMounted || hasGoogleMapsAuthFailed() || !mapContainerRef.current) return;

        const center = { lat: salonLat, lng: salonLng };

        if (!mapInstanceRef.current) {
          const map = new maps.Map(mapContainerRef.current, {
            center,
            zoom: 15,
            styles: LUXURY_MAP_STYLES,
            mapTypeControl: false,
            streetViewControl: true,
            fullscreenControl: true
          });

          const marker = new maps.Marker({
            position: center,
            map,
            title: salonInfo?.name || 'AURA Salon & Aesthetic Sanctuary',
            animation: maps.Animation.DROP
          });

          const infoWindow = new maps.InfoWindow({
            content: `
              <div style="font-family: sans-serif; padding: 6px; max-width: 240px; color: #2D241E;">
                <strong style="font-size: 14px; color: #4A2E1B; display: block; margin-bottom: 4px;">
                  ${salonInfo?.name || 'AURA Salon & Atelier'}
                </strong>
                <p style="font-size: 11px; margin: 0 0 6px; color: #5C4D42;">
                  ${salonInfo?.address || ''}
                </p>
                <a href="${getDirectionsUrl}" target="_blank" rel="noopener noreferrer"
                   style="font-size: 11px; color: #8B5E3C; font-weight: 600; text-decoration: none;">
                  Open Directions in Google Maps &rarr;
                </a>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          const directionsRenderer = new maps.DirectionsRenderer({
            map,
            polylineOptions: {
              strokeColor: '#4A2E1B',
              strokeWeight: 5
            }
          });

          mapInstanceRef.current = map;
          markerRef.current = marker;
          infoWindowRef.current = infoWindow;
          directionsRendererRef.current = directionsRenderer;

          // Wire Places Autocomplete for directions origin search
          if (originInputRef.current && maps.places?.Autocomplete) {
            const autocomplete = new maps.places.Autocomplete(originInputRef.current, {
              fields: ['formatted_address', 'geometry', 'name']
            });
            autocomplete.addListener('place_changed', () => {
              const place = autocomplete.getPlace();
              if (place?.geometry?.location) {
                setOriginInput(place.formatted_address || place.name || '');
                calculateDirections(place.geometry.location);
              }
            });
          }
        } else {
          // Update salon location if coordinates changed in Owner Settings
          mapInstanceRef.current.setCenter(center);
          if (markerRef.current) {
            markerRef.current.setPosition(center);
          }
        }

        if (isMounted) setSdkStatus('ready');
      } catch {
        if (isMounted) setSdkStatus('fallback');
      }
    };

    initMapUI();

    return () => {
      isMounted = false;
    };
  }, [salonLat, salonLng, salonInfo?.address, salonInfo?.name, salonInfo?.googleMapsApiKey]);

  const calculateDirections = (originLocation) => {
    if (!window.google?.maps || !directionsRendererRef.current) return;
    setCalculatingRoute(true);

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: originLocation,
        destination: { lat: salonLat, lng: salonLng },
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        setCalculatingRoute(false);
        if (status === 'OK' && result) {
          directionsRendererRef.current.setDirections(result);
          const leg = result.routes?.[0]?.legs?.[0];
          if (leg) {
            setRouteSummary({
              distance: leg.distance?.text,
              duration: leg.duration?.text
            });
          }
        } else {
          showToast('Could not calculate route from that address. Try opening in Google Maps.', 'info');
        }
      }
    );
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }
    setCalculatingRoute(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setOriginInput('My Current Location');
        calculateDirections(userLatLng);
      },
      () => {
        setCalculatingRoute(false);
        showToast('Unable to access your location. Please type your starting address.', 'info');
      }
    );
  };

  const handleResetMap = () => {
    setOriginInput('');
    setRouteSummary(null);
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] });
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: salonLat, lng: salonLng });
      mapInstanceRef.current.setZoom(15);
    }
  };

  return (
    <section id="location-section" className="py-20 bg-[#FAF7F2] border-t border-[#EBE1D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-[#8B5E3C] font-semibold">
            Visit Our Atelier
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#4A2E1B] mt-2 font-medium">
            Find Us in the Sanctuary
          </h2>
          <p className="text-stone-600 text-sm mt-3 leading-relaxed">
            Conveniently nestled in Jubilee Hills with private valet parking and a serene botanical courtyard.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Location Details & Timing Card */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-2xl p-8 border border-[#E8DEC8] shadow-sm">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F4EDE4] text-[#8B5E3C] flex items-center justify-center shrink-0 mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#4A2E1B] font-semibold">Salon Address</h3>
                  <p className="text-sm text-stone-600 mt-1 leading-relaxed">{salonInfo.address}</p>
                  <button
                    onClick={copyAddress}
                    className="inline-flex items-center gap-1.5 text-xs text-[#8B5E3C] hover:text-[#4A2E1B] font-medium mt-2 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
                    {copied ? 'Copied' : 'Copy address'}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F4EDE4] text-[#8B5E3C] flex items-center justify-center shrink-0 mt-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#4A2E1B] font-semibold">Working Hours</h3>
                  <div className="text-sm text-stone-600 mt-1 space-y-1">
                    <p>
                      <span className="font-medium text-stone-800">Monday &ndash; Friday:</span>{' '}
                      {salonInfo.workingHours?.weekdays || '09:30 AM - 08:30 PM'}
                    </p>
                    <p>
                      <span className="font-medium text-stone-800">Saturday &ndash; Sunday:</span>{' '}
                      {salonInfo.workingHours?.weekends || '09:00 AM - 09:00 PM'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F4EDE4] text-[#8B5E3C] flex items-center justify-center shrink-0 mt-1">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#4A2E1B] font-semibold">Contact Concierge</h3>
                  <p className="text-sm text-stone-600 mt-1">{salonInfo.phone}</p>
                  <p className="text-sm text-stone-600">{salonInfo.email}</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-stone-100 flex flex-col sm:flex-row gap-3">
              <a
                href={getDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#4A2E1B] text-white hover:bg-[#382112] px-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-2 transition shadow-xs"
              >
                <Navigation className="w-4 h-4 text-[#D4A373]" />
                Get Directions
              </a>
              <a
                href={salonInfo.googleMapsUrl || `https://maps.google.com/?q=${salonLat},${salonLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F4EDE4] text-[#4A2E1B] hover:bg-[#EAE0D3] px-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Maps
              </a>
            </div>
          </div>

          {/* Interactive Google Map Container */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-3 border border-[#E8DEC8] shadow-sm overflow-hidden flex flex-col min-h-[420px] space-y-2.5">
            {/* Interactive Directions Bar when JS SDK is active */}
            {sdkStatus === 'ready' && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE0D3]">
                <div className="relative flex-1">
                  <Compass className="w-4 h-4 text-[#8B5E3C] absolute left-3 top-2.5" />
                  <input
                    ref={originInputRef}
                    type="text"
                    value={originInput}
                    onChange={(e) => setOriginInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && originInput.trim()) {
                        e.preventDefault();
                        calculateDirections(originInput);
                      }
                    }}
                    placeholder="Check travel time from your address..."
                    className="w-full bg-white border border-[#D5C2B1] rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={calculatingRoute}
                    className="bg-[#4A2E1B] hover:bg-[#382112] text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition shrink-0"
                  >
                    <Navigation className="w-3 h-3 text-[#D4A373]" />
                    {calculatingRoute ? 'Routing...' : 'My Location'}
                  </button>
                  {routeSummary && (
                    <button
                      type="button"
                      onClick={handleResetMap}
                      title="Reset route preview"
                      className="bg-white border border-[#D5C2B1] text-stone-600 hover:text-[#4A2E1B] p-1.5 rounded-lg transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="relative w-full flex-1 min-h-[360px] rounded-xl overflow-hidden bg-stone-100">
              {sdkStatus !== 'fallback' ? (
                <div ref={mapContainerRef} className="w-full h-full min-h-[360px]" />
              ) : (
                <iframe
                  title="Salon Location Google Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '360px' }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${salonLat},${salonLng}&hl=en&z=15&output=embed`}
                />
              )}

              {/* Floating map badge / Route ETA */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-lg shadow-md border border-stone-200 flex items-center gap-2 text-xs pointer-events-none">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                {routeSummary ? (
                  <span className="font-semibold text-[#4A2E1B]">
                    {routeSummary.distance} &bull; {routeSummary.duration} drive
                  </span>
                ) : (
                  <span className="font-semibold text-[#4A2E1B]">AURA Atelier Open Now</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
