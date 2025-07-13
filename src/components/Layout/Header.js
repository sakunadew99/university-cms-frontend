import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaGraduationCap } from 'react-icons/fa';

const Header = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
      <Container fluid>
        <Navbar.Brand href="/" className="d-flex align-items-center">
          <FaGraduationCap className="me-2" size={24} />
          University CMS
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/">Dashboard</Nav.Link>
            <Nav.Link href="/courses">Courses</Nav.Link>
            <Nav.Link href="/students">Students</Nav.Link>
            <Nav.Link href="/registrations">Registrations</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;