// src/components/PolygonMap.jsx
'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef } from 'react';

export default function PolygonMap({ onPolygonClick, selectedPurok, isZoomed, onExitZoom }) {
  const [geoData, setGeoData] = useState(null);
  const mapRef = useRef(null);
  const geoJsonLayerRef = useRef(null);

  // Mock mapping between GeoJSON properties and our purok names
  const propertyToPurokMapping = {
    // These would need to match your actual GeoJSON properties
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
    'Purok 11': 'Purok 11, Lower Jasaan',
  };

  // fetch GeoJSON once the component mounts
  useEffect(() => {
    fetch('/geo/Untitled project.geojson')
      .then((res) => res.json())
      .then(setGeoData)
      .catch(console.error);
  }, []);

  // Function to get purok name from feature properties
  const getPurokName = (properties) => {
    const props = properties || {};
    
    // Try different possible property names
    const rawName = props.Name || props.PUROK || props.Barangay || props.purok || props.name || props.id;
    
    // If we have a mapping, use it; otherwise use the raw name
    if (rawName && propertyToPurokMapping[rawName]) {
      return propertyToPurokMapping[rawName];
    }
    
    // Fallback: try to match partial names
    for (const [key, value] of Object.entries(propertyToPurokMapping)) {
      if (rawName && rawName.toString().toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return rawName || "Unnamed Purok";
  };

  // Default polygon style
  const getPolygonStyle = (feature) => {
    const purokName = getPurokName(feature.properties);
    const isSelected = purokName === selectedPurok && isZoomed;

    return {
      color: isSelected ? '#f59e0b' : '#ffffff',
      weight: isSelected ? 4 : 2,
      fillColor: isSelected ? '#f59e0b' : '#22d3ee',
      fillOpacity: isSelected ? 0.7 : 0.35,
    };
  };

  // Handle feature interactions
  const onEachFeature = (feature, layer) => {
    const purokName = getPurokName(feature.properties);

    // Popup
    layer.bindPopup(`<strong>${purokName}</strong>`);

    // Events
    layer.on({
      click: (e) => {
        e.originalEvent.stopPropagation();
        
        if (onPolygonClick) {
          onPolygonClick(purokName);
        }

        // Zoom to the clicked polygon
        const map = mapRef.current;
        if (map && layer.getBounds) {
          const bounds = layer.getBounds();
          map.fitBounds(bounds, {
            padding: [20, 20],
            maxZoom: 18
          });
        }
      },
      mouseover: (e) => {
        const currentStyle = getPolygonStyle(feature);
        const purokName = getPurokName(feature.properties);
        const isSelected = purokName === selectedPurok && isZoomed;
        
        if (!isSelected) {
          layer.setStyle({
            color: '#fbbf24',
            weight: 3,
            fillOpacity: 0.5,
          });
        }
      },
      mouseout: (e) => {
        const currentStyle = getPolygonStyle(feature);
        layer.setStyle(currentStyle);
      },
    });
  };

  // Update styles when selection changes
  useEffect(() => {
    if (geoJsonLayerRef.current && geoData) {
      geoJsonLayerRef.current.eachLayer((layer) => {
        if (layer.feature) {
          const style = getPolygonStyle(layer.feature);
          layer.setStyle(style);
        }
      });
    }
  }, [selectedPurok, isZoomed]);

  // Handle exit zoom - reset map view
  const handleMapClick = () => {
    if (isZoomed && onExitZoom) {
      const map = mapRef.current;
      if (map) {
        map.setView([8.650788, 124.750792], 15);
        onExitZoom();
      }
    }
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[8.650788, 124.750792]}
        zoom={15}
        style={{ height: '600px', width: '100%' }}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        zoomControl={false}
        ref={mapRef}
        onClick={handleMapClick}
      >
        {/* Satellite base layer (Esri World Imagery) */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        {/* draw polygons once loaded */}
        {geoData && (
          <GeoJSON
          key={`geojson-${selectedPurok}-${isZoomed}`}   // ⬅️ This is the cause
          data={geoData}
          style={getPolygonStyle}
          onEachFeature={onEachFeature}
          ref={geoJsonLayerRef}
          />        
        )}
      </MapContainer>

      {/* Exit Zoom Button - positioned over the map */}
      {isZoomed && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            const map = mapRef.current;
            if (map) {
              map.setView([8.650788, 124.750792], 15);
            }
            onExitZoom();
          }}
          className="absolute top-4 right-4 z-[1000] bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
          title="Exit Zoom Mode"
        >
          <i className="fas fa-times text-sm"></i>
        </button>
      )}

      {/* Selected Purok Indicator */}
      {isZoomed && selectedPurok && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-black/80 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <i className="fas fa-map-pin text-orange-400"></i>
            <span className="font-medium">Focused: {selectedPurok}</span>
          </div>
        </div>
      )}
    </div>
  );

}
