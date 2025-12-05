// src/components/PinMarkMap.jsx
'use client';

import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../services/api';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for farmers
const createFarmerIcon = (isSelected = false) => {
  const color = isSelected ? '#f59e0b' : '#10b981';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${isSelected ? '36px' : '30px'};
        height: ${isSelected ? '36px' : '30px'};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
      ">
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
          color: white;
          font-size: ${isSelected ? '16px' : '14px'};
          font-weight: bold;
        ">🌾</div>
      </div>
    `,
    iconSize: isSelected ? [36, 48] : [30, 42],
    iconAnchor: isSelected ? [18, 48] : [15, 42],
    popupAnchor: [0, isSelected ? -48 : -42],
  });
};

// Component to handle map zoom
function MapZoomHandler({ selectedMarkerId, markers }) {
  const map = useMap();

  useEffect(() => {
    if (selectedMarkerId) {
      const marker = markers.find(m => m.id === selectedMarkerId);
      if (marker && marker.position) {
        map.flyTo(marker.position, 17, {
          duration: 1.5,
          easeLinearity: 0.5
        });
      }
    }
  }, [selectedMarkerId, markers, map]);

  return null;
}

export default function PinMarkMap({ onMarkerClick, selectedFarmerId }) {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geoData, setGeoData] = useState(null);
  const mapRef = useRef(null);

  const propertyToPurokMapping = {
    'Purok 1': 'Purok 1, Lower Jasaan',
    'Purok 2': 'Purok 2, Lower Jasaan',
    'Purok 3': 'Purok 3, Lower Jasaan',
    'Purok 4': 'Purok 4, Lower Jasaan',
    'Purok 5': 'Purok 5, Upper Jasaan',
    'Purok 6': 'Purok 6, Upper Jasaan',
    'Purok 7': 'Purok 7, Upper Jasaan',
    'Purok 8': 'Purok 8, Upper Jasaan',
    'Purok 9': 'Purok 9, Upper Jasaan',
    'Purok 10': 'Purok 10, Lower Jasaan',
    'Purok 11': 'Purok 11, Upper Jasaan',
  };

  // Load GeoJSON data
  useEffect(() => {
    fetch('/geo/Untitled project.geojson')
      .then((res) => res.json())
      .then(setGeoData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (geoData) {
      fetchFarmersData();
    }
  }, [geoData]);

  const getPurokName = (properties) => {
    const props = properties || {};
    const rawName = props.Name || props.PUROK || props.Barangay || props.purok || props.name || props.id;
    
    if (rawName && propertyToPurokMapping[rawName]) {
      return propertyToPurokMapping[rawName];
    }

    for (const [key, value] of Object.entries(propertyToPurokMapping)) {
      if (rawName && rawName.toString().toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return rawName || "Unnamed Purok";
  };

  const getPurokCenter = (purokKey) => {
    if (!geoData || !geoData.features) return null;

    for (const feature of geoData.features) {
      const featurePurokName = getPurokName(feature.properties);
      if (featurePurokName === purokKey && feature.geometry && feature.geometry.coordinates) {
        const coords = feature.geometry.coordinates[0];
        
        const lats = coords.map(c => c[1]);
        const lngs = coords.map(c => c[0]);
        
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

        // Add some randomness within the purok bounds
        const latRange = Math.max(...lats) - Math.min(...lats);
        const lngRange = Math.max(...lngs) - Math.min(...lngs);
        
        return {
          lat: centerLat,
          lng: centerLng,
          latRange: latRange,
          lngRange: lngRange
        };
      }
    }
    return null;
  };

  const generateRandomPosition = (center, index, total) => {
    if (!center) return null;

    // Generate random offset within 40% of the purok bounds
    const maxLatOffset = center.latRange * 0.4;
    const maxLngOffset = center.lngRange * 0.4;

    // Use index-based seed for consistent positioning
    const angle = (index / total) * 2 * Math.PI;
    const distance = Math.random() * 0.7 + 0.3; // 30% to 100% of max offset

    const latOffset = Math.sin(angle) * maxLatOffset * distance;
    const lngOffset = Math.cos(angle) * maxLngOffset * distance;

    return [
      center.lat + latOffset,
      center.lng + lngOffset
    ];
  };

  const fetchFarmersData = async () => {
    try {
      setLoading(true);

      // Fetch only farmers (not fisherfolk)
      const { data: registrants, error: regError } = await supabase
        .from('registrants')
        .select(`
          id,
          reference_no,
          registry,
          surname,
          first_name,
          middle_name,
          mobile_number,
          created_at,
          addresses (
            barangay,
            purok,
            street,
            municipality_city,
            province
          ),
          crops (
            name
          ),
          farm_parcels (
            total_farm_area_ha
          )
        `)
        .eq('registry', 'farmer')
        .is('deleted_at', null);

      if (regError) {
        console.error('Supabase error:', regError);
        throw regError;
      }

      console.log('✅ Fetched farmers:', registrants);

      const farmersWithPositions = [];

      registrants?.forEach((registrant, index) => {
        const address = registrant.addresses?.[0];
        if (!address || !address.purok || !address.barangay) {
          console.warn('⚠️ Skipping farmer without address:', registrant);
          return;
        }

        const purok = address.purok;
        const barangay = address.barangay;
        const purokKey = `${purok}, ${barangay}`;

        // Get center of purok from GeoJSON
        const purokCenter = getPurokCenter(purokKey);
        
        if (!purokCenter) {
          console.warn('⚠️ Could not find purok center for:', purokKey);
          return;
        }

        // Generate random position within purok
        const position = generateRandomPosition(purokCenter, index, registrants.length);

        if (!position) return;

        const crops = registrant.crops?.map(c => c.name) || [];
        const farmSize = registrant.farm_parcels?.[0]?.total_farm_area_ha
          ? `${registrant.farm_parcels[0].total_farm_area_ha} ha`
          : 'N/A';

        farmersWithPositions.push({
          id: registrant.reference_no || registrant.id,
          name: `${registrant.first_name} ${registrant.middle_name || ''} ${registrant.surname}`.trim(),
          position: position,
          purok: purok,
          barangay: barangay,
          purokKey: purokKey,
          crops: crops.length > 0 ? crops : ['N/A'],
          size: farmSize,
          contact: registrant.mobile_number || 'N/A',
          dateRegistered: new Date(registrant.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          status: 'Active',
          fullData: registrant
        });
      });

      console.log(`✅ Generated ${farmersWithPositions.length} farmer markers`);
      setMarkers(farmersWithPositions);

    } catch (err) {
      console.error('❌ Error fetching farmers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (marker) => {
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView([8.650788, 124.750792], 15, { animate: true });
    }
  };

  return (
    <div className="relative h-full w-full">
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }

        .farm-marker-tooltip {
          background-color: rgba(0, 0, 0, 0.85) !important;
          border: 2px solid #10b981 !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          padding: 6px 10px !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
          pointer-events: none !important;
        }

        .leaflet-popup-content-wrapper {
          background-color: #1e1e1e !important;
          color: white !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
        }

        .leaflet-popup-content {
          margin: 12px !important;
          font-size: 13px !important;
        }

        .leaflet-popup-tip {
          background-color: #1e1e1e !important;
        }
      `}</style>

      <MapContainer
        center={[8.650788, 124.750792]}
        zoom={15}
        style={{ height: '600px', width: '100%' }}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        zoomControl={true}
        ref={mapRef}
      >
        {/* Satellite base layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        />

        {/* Zoom handler */}
        <MapZoomHandler selectedMarkerId={selectedFarmerId} markers={markers} />

        {/* Render all farmer markers */}
        {markers.map((marker) => {
          const isSelected = marker.id === selectedFarmerId;
          const icon = createFarmerIcon(isSelected);

          return (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={icon}
              eventHandlers={{
                click: () => handleMarkerClick(marker)
              }}
            >
              <Tooltip 
                direction="top" 
                offset={[0, -42]}
                className="farm-marker-tooltip"
                opacity={0.95}
              >
                <div className="text-center">
                  <div className="font-bold">{marker.name}</div>
                  <div className="text-xs text-gray-300 mt-1">{marker.purokKey}</div>
                </div>
              </Tooltip>
              <Popup maxWidth={300}>
                <div className="space-y-2">
                  <div className="font-bold text-base border-b border-gray-600 pb-2 flex items-center gap-2">
                    <span className="text-xl">🌾</span>
                    <span>{marker.name}</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">RSBSA No:</span>
                      <span className="font-mono text-green-400">{marker.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-green-400 font-semibold">Farmer</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Purok:</span>
                      <span>{marker.purok}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Barangay:</span>
                      <span>{marker.barangay}</span>
                    </div>
                    {marker.size !== 'N/A' && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Farm Size:</span>
                        <span className="text-green-400 font-semibold">{marker.size}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contact:</span>
                      <span>{marker.contact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Registered:</span>
                      <span>{marker.dateRegistered}</span>
                    </div>
                    {marker.crops && marker.crops.length > 0 && marker.crops[0] !== 'N/A' && (
                      <div className="pt-2 border-t border-gray-700">
                        <div className="text-gray-400 mb-1">Crops:</div>
                        <div className="flex flex-wrap gap-1">
                          {marker.crops.slice(0, 4).map((crop, idx) => (
                            <span key={idx} className="bg-green-900/50 text-green-300 px-2 py-0.5 rounded text-xs">
                              {crop}
                            </span>
                          ))}
                          {marker.crops.length > 4 && (
                            <span className="text-gray-400 text-xs">+{marker.crops.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <div className="bg-[#1e1e1e] px-6 py-4 rounded-lg shadow-xl">
            <i className="fas fa-spinner fa-spin text-2xl text-green-500 mr-3"></i>
            <span className="text-white">Loading farm locations...</span>
          </div>
        </div>
      )}

      {/* Reset View Button */}
      {selectedFarmerId && (
        <button
          onClick={handleResetView}
          className="absolute top-4 right-4 z-[1000] bg-green-600 hover:bg-green-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
          title="Reset Map View"
        >
          <i className="fas fa-compress-arrows-alt text-sm"></i>
        </button>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-black/85 text-white px-4 py-3 rounded-lg shadow-lg border border-green-600/30">
        <div className="text-xs font-bold mb-2 text-green-400 flex items-center gap-2">
          <span>🌾</span>
          <span>Farm Locations</span>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: '#10b981', 
              borderRadius: '50%',
              border: '2px solid white'
            }}></div>
            <span>Farmer Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ 
              width: '14px', 
              height: '14px', 
              backgroundColor: '#f59e0b', 
              borderRadius: '50%',
              border: '2px solid white'
            }}></div>
            <span>Selected Farmer</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">
          Total Farmers: <span className="text-green-400 font-semibold">{markers.length}</span>
        </div>
      </div>

      {/* Selected Farmer Indicator */}
      {selectedFarmerId && (
        <div className="absolute top-4 left-4 z-[1000] bg-black/85 text-white px-4 py-2 rounded-lg shadow-lg border border-orange-600/30">
          <div className="flex items-center gap-2 text-sm">
            <i className="fas fa-map-marker-alt text-orange-400"></i>
            <span className="font-medium">
              Viewing: {markers.find(m => m.id === selectedFarmerId)?.name || 'Farmer'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}