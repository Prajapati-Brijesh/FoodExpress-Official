import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Modal, Button } from 'react-bootstrap';

export default function QRScanner({ show, onHide }) {
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    if (show) {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 10,
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
      });

      scanner.render(onScanSuccess, onScanError);

      function onScanSuccess(result) {
        scanner.clear();
        setScanResult(result);
        // If it's a URL, open it
        if (result.startsWith('http')) {
          window.location.href = result;
        }
      }

      function onScanError(err) {
        // console.warn(err);
      }

      return () => {
        scanner.clear();
      };
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg" contentClassName="bg-dark text-white border-secondary rounded-5">
      <Modal.Header closeButton closeVariant="white" className="border-0">
        <Modal.Title className="fw-bold">Scan QR Code</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 text-center">
        {!scanResult ? (
          <>
            <div id="reader" style={{ width: '100%', borderRadius: '20px', overflow: 'hidden' }}></div>
            <p className="mt-3 text-secondary">Position the QR code inside the box to scan</p>
          </>
        ) : (
          <div className="py-5">
            <i className="fa-solid fa-circle-check text-success display-1 mb-3"></i>
            <h4 className="fw-bold">Scan Successful!</h4>
            <p className="text-secondary">{scanResult}</p>
            <Button variant="outline-light" className="rounded-pill px-4 mt-3" onClick={() => setScanResult(null)}>
              Scan Again
            </Button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
