import React from 'react';
import { Nav, Card } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaBook, FaUsers, FaClipboardList } from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/courses', label: 'Courses', icon: FaBook },
    { path: '/students', label: 'Students', icon: FaUsers },
    { path: '/registrations', label: 'Registrations', icon: FaClipboardList }
  ];

  return (
    <div className="sidebar bg-light" style={{ minWidth: '250px', height: '100vh' }}>
      <Card className="border-0 rounded-0">
        <Card.Body className="p-0">
          <Nav className="flex-column">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Nav.Link
                  key={item.path}
                  as={Link}
                  to={item.path}
                  className={`d-flex align-items-center px-3 py-3 border-bottom ${
                    isActive ? 'bg-primary text-white' : 'text-dark'
                  }`}
                  style={{ textDecoration: 'none' }}
                >
                  <Icon className="me-3" />
                  {item.label}
                </Nav.Link>
              );
            })}
          </Nav>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Sidebar;