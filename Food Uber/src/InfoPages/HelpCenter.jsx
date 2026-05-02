import React, { useEffect } from 'react';
import { Container, Accordion } from 'react-bootstrap';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer';

export default function HelpCenter() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-wrapper" style={{ background: "transparent" }}>
      <Navbar />
      <div className="pt-5 pb-5" style={{ minHeight: "70vh", marginTop: "80px" }}>
        <Container>
          <div className="text-center mb-5" data-aos="fade-down">
            <h1 className="fw-bold display-4 text-white">Help Center</h1>
            <p className="text-secondary lead mx-auto" style={{ maxWidth: "600px" }}>
              How can we help you today? Find answers to our most frequently asked questions.
            </p>
          </div>

          <div className="p-4 p-md-5 rounded-4 shadow-sm mx-auto" style={{ maxWidth: "800px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.05)" }} data-aos="fade-up">
            <Accordion defaultActiveKey="0" data-bs-theme="dark">
              <Accordion.Item eventKey="0" className="bg-dark text-white border-secondary mb-3 rounded shadow-sm">
                <Accordion.Header>How long does delivery usually take?</Accordion.Header>
                <Accordion.Body className="text-secondary">
                  Our average delivery time is between 30 to 45 minutes, depending on your location and the restaurant's preparation time. You can track your order in real-time under the "Dashboard" section.
                </Accordion.Body>
              </Accordion.Item>
              
              <Accordion.Item eventKey="1" className="bg-dark text-white border-secondary mb-3 rounded shadow-sm">
                <Accordion.Header>What are the available payment methods?</Accordion.Header>
                <Accordion.Body className="text-secondary">
                  We accept all major Credit and Debit Cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD) for eligible locations.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="2" className="bg-dark text-white border-secondary mb-3 rounded shadow-sm">
                <Accordion.Header>Can I cancel my order?</Accordion.Header>
                <Accordion.Body className="text-secondary">
                  You can cancel your order within 5 minutes of placing it without any cancellation fee. Once the restaurant has started preparing your food, cancellations may incur a nominal cancellation charge.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="3" className="bg-dark text-white border-secondary mb-3 rounded shadow-sm">
                <Accordion.Header>What if I receive a wrong or damaged order?</Accordion.Header>
                <Accordion.Body className="text-secondary">
                  We apologize for the inconvenience! In the rare event this happens, please reach out via our Contact page within 24 hours with a picture of the delivered item, and we will process a replacement or refund immediately.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            <div className="text-center mt-5">
              <h5 className="fw-bold text-white mb-3">Still have questions?</h5>
              <a href="/contact" className="btn btn-outline-light rounded-pill px-4 py-2 fw-bold shadow-sm">Contact Support</a>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
}
