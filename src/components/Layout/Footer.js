import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-auto">
      <Container>
        <div className="row py-3">
          <div className="col-md-6">
            <p className="mb-0">&copy; 2025 University Course Management System</p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0">S.S.K Dewanarayana</p>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
