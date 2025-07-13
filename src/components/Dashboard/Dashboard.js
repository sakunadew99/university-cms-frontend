import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert } from 'react-bootstrap';
import { FaBook, FaUsers, FaClipboardList, FaChartLine } from 'react-icons/fa';
import { courseAPI, studentAPI, registrationAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRegistrations: 0,
    availableCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [coursesResponse, studentsResponse, registrationsResponse, availableCoursesResponse] = 
        await Promise.all([
          courseAPI.getAll().catch(() => ({ data: [] })),
          studentAPI.getAll().catch(() => ({ data: [] })),
          registrationAPI.getAll().catch(() => ({ data: [] })),
          courseAPI.getAvailable().catch(() => ({ data: [] }))
        ]);

      // Ensure we have arrays, even if API returns unexpected data
      const coursesData = Array.isArray(coursesResponse.data) ? coursesResponse.data : [];
      const studentsData = Array.isArray(studentsResponse.data) ? studentsResponse.data : [];
      const registrationsData = Array.isArray(registrationsResponse.data) ? registrationsResponse.data : [];
      const availableCoursesData = Array.isArray(availableCoursesResponse.data) ? availableCoursesResponse.data : [];

      setStats({
        totalCourses: coursesData.length,
        totalStudents: studentsData.length,
        totalRegistrations: registrationsData.length,
        availableCourses: availableCoursesData.length
      });
      
      console.log('Dashboard data loaded:', {
        courses: coursesData.length,
        students: studentsData.length,
        registrations: registrationsData.length,
        available: availableCoursesData.length
      });
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data. Please check if the backend server is running on http://localhost:8080');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const statCards = [
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: FaBook,
      color: 'primary',
      bgColor: 'bg-primary'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: FaUsers,
      color: 'success',
      bgColor: 'bg-success'
    },
    {
      title: 'Active Registrations',
      value: stats.totalRegistrations,
      icon: FaClipboardList,
      color: 'warning',
      bgColor: 'bg-warning'
    },
    {
      title: 'Available Courses',
      value: stats.availableCourses,
      icon: FaChartLine,
      color: 'info',
      bgColor: 'bg-info'
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Col key={index} xs={12} sm={6} lg={3}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex align-items-center">
                  <div className={`rounded-circle p-3 me-3 ${card.bgColor} text-white`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="mb-0">{card.value}</h3>
                    <p className="text-muted mb-0">{card.title}</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <a href="/courses/new" className="btn btn-outline-primary">
                  Add New Course
                </a>
                <a href="/students/new" className="btn btn-outline-success">
                  Add New Student
                </a>
                <a href="/registrations" className="btn btn-outline-warning">
                  Manage Registrations
                </a>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">System Overview</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Course Capacity Usage</span>
                  <span>
                    {stats.totalCourses > 0 
                      ? Math.round((stats.totalRegistrations / (stats.totalCourses * 30)) * 100)
                      : 0
                    }%
                  </span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${Math.min(
                        stats.totalCourses > 0 
                          ? (stats.totalRegistrations / (stats.totalCourses * 30)) * 100 
                          : 0, 
                        100
                      )}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Available Courses</span>
                  <span>{stats.availableCourses} of {stats.totalCourses}</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-success" 
                    style={{ 
                      width: `${stats.totalCourses > 0 
                        ? (stats.availableCourses / stats.totalCourses) * 100 
                        : 0
                      }%` 
                    }}
                  ></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Debug Information */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Debug Information</h6>
            </Card.Header>
            <Card.Body>
              <small className="text-muted">
                <strong>System Status:</strong><br/>
                Courses: {stats.totalCourses} loaded<br/>
                Students: {stats.totalStudents} loaded<br/>
                Registrations: {stats.totalRegistrations} loaded<br/>
                Available Courses: {stats.availableCourses} loaded<br/>
                Backend Status: {error ? '❌ Error' : '✅ Connected'}
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;