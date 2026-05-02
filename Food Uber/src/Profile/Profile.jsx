import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [pastOrders, setPastOrders] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch past orders from localStorage
    const orders = JSON.parse(localStorage.getItem('past_orders') || '[]');
    setPastOrders(orders.reverse()); // Show latest first

    // Fetch user info from delivery_info
    const info = JSON.parse(localStorage.getItem('delivery_info') || '{}');
    setUserInfo(info);
  }, []);

  const handleReorder = (orderItems) => {
    navigate('/Menu');
  };

  return (
    <>
      <Navbar />
      <div className="profile-page-container" style={{ minHeight: '80vh', backgroundColor: 'var(--bg-color, #121212)', color: 'var(--text-color, #ffffff)', paddingTop: '40px', paddingBottom: '40px' }}>
        <Container>
          <Row>
            {/* Sidebar / User Info */}
            <Col lg={4} className="mb-4">
              <Card className="border-0 shadow-sm rounded-4 text-white" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <Card.Body className="text-center p-4">
                  <div className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="fa-solid fa-user fs-1 text-white"></i>
                  </div>
                  <h4 className="fw-bold">{userInfo.name || 'Guest User'}</h4>
                  <p className="text-secondary mb-1"><i className="fa-solid fa-phone me-2"></i>{userInfo.phone || 'Not provided'}</p>
                  <p className="text-secondary"><i className="fa-solid fa-location-dot me-2"></i>{userInfo.address || 'No saved address'}</p>
                  <Button variant="outline-light" className="w-100 rounded-pill mt-2">Edit Profile</Button>
                </Card.Body>
              </Card>
            </Col>

            {/* Main Content / Order History */}
            <Col lg={8}>
              <h3 className="fw-bold mb-4 border-bottom pb-2 border-secondary">
                <i className="fa-solid fa-clock-rotate-left me-2 text-primary"></i> Order History
              </h3>
              
              {pastOrders.length === 0 ? (
                <div className="text-center py-5 text-secondary">
                  <i className="fa-solid fa-box-open fa-3x mb-3"></i>
                  <h5>No past orders found.</h5>
                  <Button variant="primary" className="rounded-pill mt-3" onClick={() => navigate('/Menu')}>Start Ordering</Button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {pastOrders.map((order, index) => (
                    <Card key={index} className="border-0 shadow-sm rounded-4 text-white" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Card.Header className="bg-transparent border-secondary d-flex justify-content-between align-items-center py-3">
                        <div>
                          <span className="text-secondary fs-6">Order #{order.id}</span>
                          <h6 className="mb-0 fw-bold mt-1">{order.date}</h6>
                        </div>
                        <Badge bg="success" className="px-3 py-2 rounded-pill">Delivered</Badge>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          {order.items.map((item, i) => (
                            <Badge key={i} bg="secondary" className="px-3 py-2 rounded-pill fw-normal">
                              {item.name}
                            </Badge>
                          ))}
                        </div>
                        <div className="d-flex justify-content-between align-items-center border-top border-secondary pt-3 mt-3">
                          <h5 className="mb-0 fw-bold text-success">Total: ₹{order.total}</h5>
                          <Button variant="outline-primary" className="rounded-pill px-4" onClick={() => handleReorder(order.items)}>
                            <i className="fa-solid fa-rotate-right me-2"></i>Re-order
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </>
  );
}
