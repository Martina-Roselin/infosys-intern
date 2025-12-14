import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '../lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, Navigation, Briefcase } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// --- 1. CUSTOM ICONS SETUP ---

// User Location (Standard Blue Pin)
const userIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Provider Icon (Custom Circular Avatar with Briefcase)
const providerIconMarkup = renderToStaticMarkup(
  <div style={{ 
      backgroundColor: 'white', 
      border: '2px solid #ea580c', // Orange-600
      borderRadius: '50%', 
      width: '40px', 
      height: '40px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      position: 'relative'
  }}>
    <Briefcase size={20} color="#ea580c" />
    {/* Little triangle at bottom to make it look like a pin */}
    <div style={{
        position: 'absolute',
        bottom: '-5px',
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
        width: '10px',
        height: '10px',
        backgroundColor: 'white',
        borderRight: '2px solid #ea580c',
        borderBottom: '2px solid #ea580c',
    }}></div>
  </div>
);

const providerIcon = L.divIcon({
  html: providerIconMarkup,
  className: 'custom-marker', // Class to remove default square background
  iconSize: [40, 45],
  iconAnchor: [20, 45],
  popupAnchor: [0, -45]
});

// --- 2. TYPES & HELPERS ---

interface Provider {
  id: number;
  name: string;
  serviceType: string;
  latitude: number;
  longitude: number;
  serviceCost: number;
}

// Helper component to move the map when center changes
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 14); // Zoom level 14 is good for city view
  return null;
}

// --- 3. MAIN COMPONENT ---

export default function MapSearch() {
  const navigate = useNavigate();
  const locationState = useLocation();
  
  // Get state passed from UserDashboard
  const { serviceType, locationText } = locationState.state || { serviceType: '', locationText: '' };

  const [centerLocation, setCenterLocation] = useState<[number, number] | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Initializing map...");

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    let lat = 13.0827; // Default Fallback (Chennai)
    let lng = 80.2707;

    try {
      if (locationText) {
        // CASE A: User typed a specific location (e.g. "T. Nagar")
        setStatusMessage(`Locating "${locationText}"...`);
        
        // Use OpenStreetMap Nominatim to get coordinates for the text
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${locationText}`);
        const geoData = await geoResponse.json();

        if (geoData && geoData.length > 0) {
          lat = parseFloat(geoData[0].lat);
          lng = parseFloat(geoData[0].lon);
        } else {
          alert(`Could not find location: "${locationText}". Using default.`);
        }
        setCenterLocation([lat, lng]);
        fetchNearby(lat, lng, serviceType);

      } else {
        // CASE B: No location typed, use Live GPS
        setStatusMessage("Getting your live location...");
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              lat = position.coords.latitude;
              lng = position.coords.longitude;
              setCenterLocation([lat, lng]);
              fetchNearby(lat, lng, serviceType);
            },
            () => {
              console.error("GPS denied. Using default.");
              setCenterLocation([lat, lng]);
              fetchNearby(lat, lng, serviceType);
            }
          );
        } else {
          setCenterLocation([lat, lng]);
          fetchNearby(lat, lng, serviceType);
        }
      }
    } catch (error) {
      console.error("Map initialization error:", error);
      setLoading(false);
    }
  };

  const fetchNearby = async (lat: number, lng: number, type: string) => {
    setStatusMessage(`Finding nearest ${type || 'providers'}...`);
    try {
      // Call Backend API with 15km radius
      const data = await api.searchNearbyProviders(lat, lng, 15, type);
      setProviders(data as Provider[]);
    } catch (error) {
      console.error("Failed to fetch providers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !centerLocation) {
    return (
      <div className="flex h-screen items-center justify-center flex-col bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
        <p className="text-xl font-semibold text-gray-600">{statusMessage}</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative">
      
      {/* --- Floating Header --- */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-start pointer-events-none">
        <button 
          onClick={() => navigate('/user/dashboard')} 
          className="pointer-events-auto bg-white px-4 py-2 rounded-full shadow-lg font-bold text-gray-700 hover:bg-gray-50 border border-gray-200 flex items-center transition-transform hover:scale-105"
        >
          ← Back
        </button>

        <div className="pointer-events-auto bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-xl border border-gray-100 text-center">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Searching For</p>
          <p className="text-lg font-bold text-gray-800">
            {serviceType || 'All Services'} 
            <span className="font-normal text-gray-500"> near </span>
            {locationText || 'Me'}
          </p>
        </div>
        
        <div className="w-[88px]"></div> {/* Spacer for layout balance */}
      </div>

      <MapContainer center={centerLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={centerLocation} />
        
        {/* --- Modern Map Tiles (CartoDB Voyager) --- */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* User Marker */}
        <Marker position={centerLocation} icon={userIcon}>
          <Popup className="custom-popup">
            <div className="text-center p-2">
              <div className="bg-blue-100 text-blue-800 p-2 rounded-full inline-block mb-2">
                <Navigation size={20} />
              </div>
              <p className="font-bold text-gray-700">You are here</p>
            </div>
          </Popup>
        </Marker>

        {/* Provider Markers */}
        {providers.map((provider) => (
          provider.latitude && provider.longitude ? (
            <Marker 
              key={provider.id} 
              position={[provider.latitude, provider.longitude]}
              icon={providerIcon} // Using our custom Briefcase Icon
            >
              <Popup className="custom-popup">
                <div className="min-w-[200px] p-1">
                  
                  {/* Header: Name & Service Type */}
                  <div className="flex justify-between items-start mb-2">
                     <div>
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">{provider.name}</h3>
                        <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full font-semibold mt-1">
                          {provider.serviceType}
                        </span>
                     </div>
                     <div className="bg-green-50 text-green-700 px-2 py-1 rounded-lg font-bold text-sm">
                        ${provider.serviceCost}
                     </div>
                  </div>

                  {/* Rating (Dummy Data for Visuals) */}
                  <div className="flex items-center space-x-1 mb-3">
                     <Star className="w-4 h-4 text-yellow-400 fill-current" />
                     <span className="text-sm font-medium text-gray-600">4.8 (12 reviews)</span>
                  </div>
                  
                  {/* Action Button */}
                  <button 
                    className="w-full bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors shadow-md"
                    onClick={() => navigate(`/user/provider/${provider.id}`)} 
                  >
                    View Details & Book
                  </button>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
}