import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingQR() {
  const [show, setShow] = useState(false);

  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShow(true)}
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          zIndex: 1000,
          background: 'var(--brand-primary)',
          color: '#fff',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(255, 107, 53, 0.4)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <i className="fa-solid fa-qrcode fs-3"></i>
      </motion.div>

      <Modal 
        show={show} 
        onHide={() => setShow(false)} 
        centered 
        contentClassName="bg-dark text-white rounded-5 border-secondary"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <Modal.Header closeButton closeVariant="white" className="border-0 pb-0">
          <Modal.Title className="fw-bold w-100 text-center mt-3">Scan to Mobile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-5">
          <div className="bg-white p-3 rounded-4 d-inline-block shadow-lg mb-4">
            <QRCodeSVG 
              value="https://foodexpress-official.onrender.com/" 
              size={220} 
              level="H"
              includeMargin={true}
            />
          </div>
          <h5 className="fw-bold mb-2">Switch to Mobile?</h5>
          <p className="text-secondary small">
            Scan this QR code with your phone camera to open **FoodExpress** instantly. Enjoy a faster, smoother ordering experience!
          </p>
          <button 
            className="btn-brand w-100 py-2 rounded-pill mt-3"
            onClick={() => setShow(false)}
          >
            Got it!
          </button>
        </Modal.Body>
      </Modal>
    </>
  );
}
