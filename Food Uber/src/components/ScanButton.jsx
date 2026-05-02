import React, { useState } from 'react';
import QRScanner from './QRScanner';

export default function ScanButton({ className }) {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <>
      <div 
        className={`nb-icon-btn ${className}`} 
        onClick={() => setShowScanner(true)}
        title="Scan QR Code"
        style={{ cursor: 'pointer' }}
      >
        <i className="fa-solid fa-expand"></i>
      </div>

      <QRScanner show={showScanner} onHide={() => setShowScanner(false)} />
    </>
  );
}
