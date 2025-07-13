import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col, Table } from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { courseAPI, studentAPI, registrationAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const RegistrationForm = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [newRegistration, setNewRegistration] = useState({
    studentId: '',
    courseId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [studentsResponse, coursesResponse, registrationsResponse] = 
        await Promise.all([
          studentAPI.getAll(),
          courseAPI.getAll(),
          registrationAPI.getAll()
        ]);

      // Ensure we have arrays, even if API returns unexpected data
      const studentsData = Array.isArray(studentsResponse.data) ? studentsResponse.data : [];
      const coursesData = Array.isArray(coursesResponse.data) ? coursesResponse.data : [];
      const registrationsData = Array.isArray(registrationsResponse.data) ? registrationsResponse.data : [];

      setStudents(studentsData);
      setCourses(coursesData);
      setRegistrations(registrationsData);
      
      console.log('Students loaded:', studentsData);
      console.log('Courses loaded:', coursesData);
      console.log('Registrations loaded:', registrationsData);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please check if the backend server is running on http://localhost:8080');
      
      // Set empty arrays as fallback
      setStudents([]);
      setCourses([]);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRegistration(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newRegistration.studentId || !newRegistration.courseId) {
      setError('Please select both student and course.');
      return;
    }

    try {
      setError(null);
      
      const registrationData = {
        student: { id: parseInt(newRegistration.studentId) },
        course: { id: parseInt(newRegistration.courseId) }
      };

      await registrationAPI.create(registrationData);
      setSuccess(true);
      setNewRegistration({ studentId: '', courseId: '' });
      fetchData(); // Refresh the data
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating registration:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to create registration. Please try again.';
      setError(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      try {
        await registrationAPI.delete(id);
        setRegistrations(registrations.filter(reg => reg.id !== id));
        setError(null);
      } catch (err) {
        console.error('Error deleting registration:', err);
        setError('Failed to delete registration. Please try again.');
      }
    }
  };

  if (loading) return <LoadingSpinner message="Loading registration data..." />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Registration Management</h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Registration created successfully!</Alert>}

      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">New Registration</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Student *</Form.Label>
                  <Form.Select
                    name="studentId"
                    value={newRegistration.studentId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Choose a student...</option>
                    {students && students.length > 0 ? (
                      students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.studentId} - {student.firstName} {student.lastName}
                        </option>
                      ))
                    ) : (
                      <option disabled>No students available</option>
                    )}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Select Course *</Form.Label>
                  <Form.Select
                    name="courseId"
                    value={newRegistration.courseId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Choose a course...</option>
                    {courses && courses.length > 0 ? (
                      courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.code} - {course.title}
                        </option>
                      ))
                    ) : (
                      <option disabled>No courses available</option>
                    )}
                  </Form.Select>
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100"
                  disabled={!students.length || !courses.length}
                >
                  <FaPlus className="me-2" />
                  Create Registration
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Debug Information */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Debug Info</h6>
            </Card.Header>
            <Card.Body>
              <small className="text-muted">
                Students: {students ? students.length : 0}<br/>
                Courses: {courses ? courses.length : 0}<br/>
                Registrations: {registrations ? registrations.length : 0}
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Current Registrations</h5>
            </Card.Header>
            <Card.Body>
              {!registrations || registrations.length === 0 ? (
                <Alert variant="info">No registrations found.</Alert>
              ) : (
                <Table striped bordered hover responsive>
                  <thead className="table-dark">
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Registration Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((registration) => (
                      <tr key={registration.id}>
                        <td>
                          {registration.student?.firstName} {registration.student?.lastName}
                          <br />
                          <small className="text-muted">{registration.student?.studentId}</small>
                        </td>
                        <td>
                          {registration.course?.code} - {registration.course?.title}
                        </td>
                        <td>
                          {registration.registrationDate ? 
                            new Date(registration.registrationDate).toLocaleDateString() : 
                            'N/A'
                          }
                        </td>
                        <td>
                          <span className={`badge ${
                            registration.status === 'ACTIVE' ? 'bg-success' :
                            registration.status === 'COMPLETED' ? 'bg-primary' :
                            'bg-warning'
                          }`}>
                            {registration.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(registration.id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="mt-3">
        <small className="text-muted">
          Total registrations: {registrations ? registrations.length : 0}
        </small>
      </div>
    </div>
  );
};

export default RegistrationForm;