import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Modal, Button, Spinner } from 'react-bootstrap';

export default function QRScanner({ show, onHide }) {
  const [scanResult, setScanResult] = useState(null);
  const [isScannerStarted, setIsScannerStarted] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (show) {
      // Small delay to ensure the DOM element #reader is ready
      const timer = setTimeout(() => startScanner(), 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }
  }, [show]);

  const startScanner = async () => {
    try {
      setError(null);
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0 
      };

      await html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Noise
        }
      );
      setIsScannerStarted(true);
    } catch (err) {
      console.error("Scanner Error:", err);
      setError("Camera access denied or error. Please check permissions.");
      setIsScannerStarted(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScannerStarted(false);
      } catch (err) {
        console.error("Stop Error:", err);
      }
    }
  };

  const onScanSuccess = (result) => {
    setScanResult(result);
    stopScanner();
    if (result.startsWith('http')) {
      setTimeout(() => {
        window.location.href = result;
      }, 1000);
    }
  };

  const handleClose = () => {
    stopScanner();
    setScanResult(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" contentClassName="bg-dark text-white border-secondary rounded-5 shadow-lg overflow-hidden">
      <Modal.Header closeButton closeVariant="white" className="border-0 px-4 pt-4 pb-0">
        <Modal.Title className="fw-bold">QR Scanner</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0 position-relative" style={{ minHeight: '350px', background: '#000' }}>
        
        <div id="reader" style={{ width: '100%', minHeight: '350px' }}></div>

        {!isScannerStarted && !error && !scanResult && (
          <div className="position-absolute top-50 start-50 translate-middle text-center w-100">
            <Spinner animation="border" variant="warning" className="mb-3" />
            <p className="text-secondary">Initializing Camera...</p>
          </div>
        )}

        {error && (
          <div className="p-5 text-center position-absolute top-50 start-50 translate-middle w-100">
            <i className="fa-solid fa-triangle-exclamation text-warning display-4 mb-3"></i>
            <h5 className="fw-bold">{error}</h5>
            <Button variant="warning" className="rounded-pill px-4 mt-3" onClick={startScanner}>
              Try Again
            </Button>
          </div>
        )}

        {scanResult && (
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark d-flex flex-column align-items-center justify-content-center p-4 text-center" style={{ zIndex: 10 }}>
            <div className="bg-success bg-opacity-20 rounded-circle p-4 mb-3">
              <i className="fa-solid fa-check text-success display-1"></i>
            </div>
            <h4 className="fw-bold mb-2">Scan Successful!</h4>
            <p className="text-secondary mb-4 text-break small">{scanResult}</p>
            <div className="d-flex gap-2">
              <Button variant="outline-light" className="rounded-pill px-4" onClick={() => { setScanResult(null); startScanner(); }}>
                Again
              </Button>
              <Button variant="warning" className="rounded-pill px-4" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0 bg-dark p-3 justify-content-center">
         <p className="text-secondary small mb-0">
           <i className="fa-solid fa-lightbulb text-warning me-2"></i>
           Point camera at a QR code to scan.
         </p>
      </Modal.Footer>
    </Modal>
  );
}
