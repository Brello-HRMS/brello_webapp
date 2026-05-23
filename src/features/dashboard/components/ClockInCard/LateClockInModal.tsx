import React, { useState } from 'react';
import { Clock, MapPin, AlertCircle, Lock, LogIn } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import { Button, Dialog } from '../../../../components/common';

import styles from './LateClockInModal.module.scss';

import type { PreCheckResponse } from '../../../../api/attendance';

// Fix default marker icons broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LateClockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  preCheckData: PreCheckResponse;
}

const REASON_OPTIONS = [
  'Traffic/Transport Issues',
  'Personal Work',
  'Health/Medical Reason',
  'Official Work at Other Location',
  'Other',
];

export const LateClockInModal: React.FC<LateClockInModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  preCheckData,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [otherReason, setOtherReason] = useState<string>('');

  if (!isOpen) return null;

  const isLate = preCheckData.is_late;
  const isRemote = preCheckData.is_remote;

  // Format the time strings nicely
  const formatTimeStr = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  };

  const shiftStartStr = preCheckData.shift_start
    ? formatTimeStr(`1970-01-01T${preCheckData.shift_start}`)
    : 'N/A';
  const currentTimeStr = formatTimeStr(preCheckData.current_time);

  const lateHours = Math.floor(preCheckData.late_minutes / 60);
  const lateMins = preCheckData.late_minutes % 60;
  const lateByStr = `${lateHours}h ${String(lateMins).padStart(2, '0')}m`;

  const handleSubmit = () => {
    const finalReason = selectedReason === 'Other' ? otherReason : selectedReason;
    if (!finalReason.trim()) return;
    onSubmit(finalReason);
  };

  const isSubmitDisabled = !selectedReason || (selectedReason === 'Other' && !otherReason.trim());

  const actions = (
    <>
      <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        style={{ flex: 1 }}
        disabled={isSubmitDisabled}
      >
        <LogIn size={16} />
        Clock In Anyway
      </Button>
    </>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={
        isLate && !isRemote
          ? 'Late Clock-In'
          : isRemote && !isLate
            ? 'Remote Clock-In'
            : 'Late & Remote Clock-In'
      }
      position="right"
      maxWidth="480px"
      actions={actions}
    >
      <div className={styles.modalBody}>
        {isLate && (
          <div className={styles.alertBanner}>
            <Clock size={20} />
            <div className={styles.alertContent}>
              <p>You are clocking in late</p>
              <span>Your shift starts at {shiftStartStr}</span>
            </div>
          </div>
        )}

        {isLate && (
          <div className={styles.timeInfoBox}>
            <div className={styles.timeCol}>
              <span className={styles.label}>Shift Start Time</span>
              <span className={styles.value}>{shiftStartStr}</span>
            </div>
            <div className={styles.timeCol}>
              <span className={styles.label}>Current Time</span>
              <span className={`${styles.value} ${styles.valueDanger}`}>{currentTimeStr}</span>
            </div>
            <div className={styles.lateBy}>
              <span className={styles.label}>Late by</span>
              <span>{lateByStr}</span>
            </div>
          </div>
        )}

        {isRemote && (
          <div className={styles.locationBox}>
            <div className={styles.locHeader}>
              <MapPin size={16} />
              Current Location
            </div>
            <div className={styles.mapWrapper}>
              <MapContainer
                center={[
                  preCheckData.office_latitude ?? 20.5937,
                  preCheckData.office_longitude ?? 78.9629,
                ]}
                zoom={preCheckData.office_latitude ? 15 : 5}
                className={styles.mapContainer}
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                key={`map-${preCheckData.office_latitude}-${preCheckData.office_longitude}`}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {preCheckData.office_latitude && preCheckData.office_longitude && (
                  <Marker
                    position={[preCheckData.office_latitude, preCheckData.office_longitude]}
                  />
                )}
              </MapContainer>
            </div>
            <span className={styles.locStatus}>
              <AlertCircle size={14} /> Outside Usual Location
            </span>
            <p className={styles.address}>
              {preCheckData.office_name
                ? `${preCheckData.office_name} (Distance: ${preCheckData.distance_meters}m)`
                : 'Unknown Office Location'}
            </p>
            <span className={styles.accuracy}>Accuracy: Verified</span>
          </div>
        )}

        <div className={styles.reasonSection}>
          <h4>
            Reason for{' '}
            {isLate && isRemote
              ? 'Late/ Different Location'
              : isLate
                ? 'Late Clock-In'
                : 'Different Location'}
            <span>*</span>
          </h4>
          <div className={styles.radioGroup}>
            {REASON_OPTIONS.map((opt) => (
              <label key={opt}>
                <input
                  type="radio"
                  name="reason"
                  value={opt}
                  checked={selectedReason === opt}
                  onChange={(e) => setSelectedReason(e.target.value)}
                />
                {opt}
              </label>
            ))}
          </div>

          {selectedReason === 'Other' && (
            <textarea
              placeholder="Please provide your reason..."
              rows={3}
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
            />
          )}
        </div>

        <div className={styles.managerNotice}>
          <Lock size={14} />
          Your reason will be shared with your reporting manager for approval.
        </div>
      </div>
    </Dialog>
  );
};
