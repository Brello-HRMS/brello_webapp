import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { LocateFixed } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import { Input } from '../../ui/Input/Input';

import styles from './LocationPickerMap.module.scss';

// Fix default marker icons broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface GeoLocation {
  office_name?: string;
  latitude: number;
  longitude: number;
  radius_meters?: number;
}

interface LocationPickerMapProps {
  value?: GeoLocation;
  onChange: (loc: GeoLocation) => void;
  showRadius?: boolean;
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // India center
const DEFAULT_ZOOM = 5;
const DEFAULT_RADIUS = 10;

const ClickHandler: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({
  onMapClick,
}) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const RecenterMap: React.FC<{ lat: number; lng: number; trigger: number }> = ({
  lat,
  lng,
  trigger,
}) => {
  const map = useMap();
  const prevTrigger = useRef(0);
  useEffect(() => {
    if (trigger > 0 && trigger !== prevTrigger.current) {
      prevTrigger.current = trigger;
      map.flyTo([lat, lng], 16, { animate: true, duration: 1 });
    }
  }, [trigger, lat, lng, map]);
  return null;
};

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  value,
  onChange,
  showRadius = true,
}) => {
  const [officeName, setOfficeName] = useState(value?.office_name ?? '');
  const [lat, setLat] = useState(value?.latitude ?? 0);
  const [lng, setLng] = useState(value?.longitude ?? 0);
  const [radius, setRadius] = useState(value?.radius_meters ?? DEFAULT_RADIUS);
  const [isLocating, setIsLocating] = useState(false);
  const [flyTrigger, setFlyTrigger] = useState(0);

  useEffect(() => {
    if (value) {
      setOfficeName(value.office_name ?? '');
      setLat(value.latitude);
      setLng(value.longitude);
      setRadius(value.radius_meters ?? DEFAULT_RADIUS);
    }
  }, [value]);

  const hasPin = lat !== 0 || lng !== 0;
  const center: [number, number] = hasPin ? [lat, lng] : DEFAULT_CENTER;
  const zoom = hasPin ? 14 : DEFAULT_ZOOM;

  const emit = (overrides: Partial<GeoLocation> = {}) => {
    onChange({
      office_name: officeName,
      latitude: lat,
      longitude: lng,
      radius_meters: radius,
      ...overrides,
    });
  };

  const handleMapClick = (clickLat: number, clickLng: number) => {
    const roundedLat = parseFloat(clickLat.toFixed(6));
    const roundedLng = parseFloat(clickLng.toFixed(6));
    setLat(roundedLat);
    setLng(roundedLng);
    emit({ latitude: roundedLat, longitude: roundedLng });
  };

  const handleOfficeNameChange = (v: string) => {
    setOfficeName(v);
    emit({ office_name: v });
  };

  const handleLatChange = (v: number) => {
    setLat(v);
    emit({ latitude: v });
  };

  const handleLngChange = (v: number) => {
    setLng(v);
    emit({ longitude: v });
  };

  const handleRadiusChange = (v: number) => {
    setRadius(v);
    emit({ radius_meters: v });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const roundedLat = parseFloat(pos.coords.latitude.toFixed(6));
        const roundedLng = parseFloat(pos.coords.longitude.toFixed(6));
        setLat(roundedLat);
        setLng(roundedLng);
        setFlyTrigger((t) => t + 1);
        emit({ latitude: roundedLat, longitude: roundedLng });
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div>
      <div className={styles.officeRow}>
        <Input
          label="Office / Location Name"
          placeholder="e.g., Head Office, Mumbai Branch"
          value={officeName}
          onChange={(e) => handleOfficeNameChange(e.target.value)}
        />
      </div>

      <div className={styles.locationBar}>
        <div style={{ flex: 1, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Click on the map or use your current location
        </div>
        <button
          type="button"
          className={styles.useLocationBtn}
          onClick={handleUseMyLocation}
          disabled={isLocating}
        >
          <LocateFixed size={14} />
          {isLocating ? 'Locating…' : 'Use My Location'}
        </button>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        className={styles.mapContainer}
        key={`map-${center[0]}-${center[1]}-${zoom}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onMapClick={handleMapClick} />
        <RecenterMap lat={lat} lng={lng} trigger={flyTrigger} />
        {hasPin && <Marker position={[lat, lng]} />}
      </MapContainer>

      <div className={styles.coords}>
        <Input
          label="Latitude"
          type="number"
          value={lat || ''}
          onChange={(e) => handleLatChange(parseFloat(e.target.value) || 0)}
          placeholder="e.g. 28.6139"
        />
        <Input
          label="Longitude"
          type="number"
          value={lng || ''}
          onChange={(e) => handleLngChange(parseFloat(e.target.value) || 0)}
          placeholder="e.g. 77.2090"
        />
      </div>

      {showRadius && (
        <div className={styles.radiusRow}>
          <Input
            label="Radius (meters)"
            type="number"
            value={radius}
            onChange={(e) => handleRadiusChange(parseInt(e.target.value, 10) || DEFAULT_RADIUS)}
            placeholder="e.g. 100"
          />
        </div>
      )}
    </div>
  );
};

export default LocationPickerMap;
