import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col, Table, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { courseAPI, studentAPI, registrationAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const RegistrationForm = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [registrationResult, setRegistrationResult] = useState(null);

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

    // Check if registration already exists
    const existingRegistration = registrations.find(reg => 
      reg.student?.id === parseInt(newRegistration.studentId) && 
      reg.course?.id === parseInt(newRegistration.courseId)
    );

    if (existingRegistration) {
      setError('This student is already registered for this course.');
      return;
    }

    try {
      setError(null);
      
      const registrationData = {
        student: { id: parseInt(newRegistration.studentId) },
        course: { id: parseInt(newRegistration.courseId) }
      };

      const response = await registrationAPI.create(registrationData);
      
      // Get student and course details for the result
      const selectedStudent = students.find(s => s.id === parseInt(newRegistration.studentId));
      const selectedCourse = courses.find(c => c.id === parseInt(newRegistration.courseId));
      
      // Set detailed registration result
      setRegistrationResult({
        student: selectedStudent,
        course: selectedCourse,
        registrationDate: new Date().toLocaleDateString(),
        id: response.data?.id || Date.now()
      });
      
      // Add to recent registrations
      const newRecentRegistration = {
        id: response.data?.id || Date.now(),
        student: selectedStudent,
        course: selectedCourse,
        timestamp: new Date(),
        status: 'SUCCESS'
      };
      
      setRecentRegistrations(prev => [newRecentRegistration, ...prev.slice(0, 4)]);
      
      setSuccess(true);
      setNewRegistration({ studentId: '', courseId: '' });
      fetchData(); // Refresh the data
      
      setTimeout(() => {
        setSuccess(false);
        setRegistrationResult(null);
      }, 5000);
      
    } catch (err) {
      console.error('Error creating registration:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to create registration. Please try again.';
      setError(errorMessage);
      
      // Add failed registration to recent attempts
      const selectedStudent = students.find(s => s.id === parseInt(newRegistration.studentId));
      const selectedCourse = courses.find(c => c.id === parseInt(newRegistration.courseId));
      
      const failedRegistration = {
        id: Date.now(),
        student: selectedStudent,
        course: selectedCourse,
        timestamp: new Date(),
        status: 'FAILED',
        error: errorMessage
      };
      
      setRecentRegistrations(prev => [failedRegistration, ...prev.slice(0, 4)]);
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

  const getSelectedStudentInfo = () => {
    if (!newRegistration.studentId) return null;
    return students.find(s => s.id === parseInt(newRegistration.studentId));
  };

  const getSelectedCourseInfo = () => {
    if (!newRegistration.courseId) return null;
    return courses.find(c => c.id === parseInt(newRegistration.courseId));
  };

  if (loading) return <LoadingSpinner message="Loading registration data..." />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Registration Management</h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      
      {success && registrationResult && (
        <Alert variant="success" className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <FaCheckCircle className="me-2" />
            <strong>Registration Successful!</strong>
          </div>
          <div className="mt-2">
            <strong>Student:</strong> {registrationResult.student?.firstName} {registrationResult.student?.lastName} 
            ({registrationResult.student?.studentId})<br/>
            <strong>Course:</strong> {registrationResult.course?.code} - {registrationResult.course?.title}<br/>
            <strong>Registration Date:</strong> {registrationResult.registrationDate}
          </div>
        </Alert>
      )}

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
                  {getSelectedStudentInfo() && (
                    <Form.Text className="text-muted">
                      Selected: {getSelectedStudentInfo().firstName} {getSelectedStudentInfo().lastName}
                      {getSelectedStudentInfo().email && ` (${getSelectedStudentInfo().email})`}
                    </Form.Text>
                  )}
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
                  {getSelectedCourseInfo() && (
                    <Form.Text className="text-muted">
                      Selected: {getSelectedCourseInfo().code} - {getSelectedCourseInfo().title}
                      {getSelectedCourseInfo().credits && ` (${getSelectedCourseInfo().credits} credits)`}
                    </Form.Text>
                  )}
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100"
                  disabled={!students.length || !courses.length}
                >
                  <FaPlus className="me-2" />
                  Register Student
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Recent Registration Attempts */}
          {recentRegistrations.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">
                  <FaInfoCircle className="me-2" />
                  Recent Registration Activity
                </h6>
              </Card.Header>
              <Card.Body>
                {recentRegistrations.map((reg, index) => (
                  <div key={reg.id} className={`mb-2 p-2 rounded ${
                    reg.status === 'SUCCESS' ? 'bg-light-success border-success' : 'bg-light-danger border-danger'
                  }`} style={{
                    backgroundColor: reg.status === 'SUCCESS' ? '#d1f2eb' : '#fadbd8',
                    border: `1px solid ${reg.status === 'SUCCESS' ? '#28a745' : '#dc3545'}`
                  }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <strong>{reg.student?.firstName} {reg.student?.lastName}</strong>
                        <br />
                        <small className="text-muted">
                          {reg.course?.code} - {reg.course?.title}
                        </small>
                        <br />
                        <small className="text-muted">
                          {reg.timestamp.toLocaleTimeString()}
                        </small>
                      </div>
                      <Badge bg={reg.status === 'SUCCESS' ? 'success' : 'danger'}>
                        {reg.status}
                      </Badge>
                    </div>
                    {reg.status === 'FAILED' && reg.error && (
                      <small className="text-danger d-block mt-1">
                        Error: {reg.error}
                      </small>
                    )}
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}

          {/* Registration Statistics */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Registration Statistics</h6>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col xs={4}>
                  <div className="stat-item">
                    <h5 className="mb-0 text-primary">{students ? students.length : 0}</h5>
                    <small className="text-muted">Total Students</small>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="stat-item">
                    <h5 className="mb-0 text-success">{courses ? courses.length : 0}</h5>
                    <small className="text-muted">Available Courses</small>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="stat-item">
                    <h5 className="mb-0 text-info">{registrations ? registrations.length : 0}</h5>
                    <small className="text-muted">Active Registrations</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Current Registrations</h5>
              <small className="text-muted">
                {registrations ? registrations.length : 0} total registrations
              </small>
            </Card.Header>
            <Card.Body>
              {!registrations || registrations.length === 0 ? (
                <Alert variant="info">
                  <FaInfoCircle className="me-2" />
                  No registrations found. Add your first registration using the form on the left.
                </Alert>
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
                    {registrations.map((registration) => {
                      const isRecent = recentRegistrations.some(recent => 
                        recent.student?.id === registration.student?.id && 
                        recent.course?.id === registration.course?.id &&
                        recent.status === 'SUCCESS'
                      );
                      
                      return (
                        <tr key={registration.id} className={isRecent ? 'table-success' : ''}>
                          <td>
                            {registration.student?.firstName} {registration.student?.lastName}
                            <br />
                            <small className="text-muted">{registration.student?.studentId}</small>
                            {isRecent && (
                              <Badge bg="success" className="ms-2">
                                <small>Just Added</small>
                              </Badge>
                            )}
                          </td>
                          <td>
                            {registration.course?.code} - {registration.course?.title}
                            {registration.course?.credits && (
                              <br />
                              <small className="text-muted">{registration.course?.credits} credits</small>
                            )}
                          </td>
                          <td>
                            {registration.registrationDate ? 
                              new Date(registration.registrationDate).toLocaleDateString() : 
                              'N/A'
                            }
                          </td>
                          <td>
                            <Badge bg={
                              registration.status === 'ACTIVE' ? 'success' :
                              registration.status === 'COMPLETED' ? 'primary' :
                              'warning'
                            }>
                              {registration.status || 'ACTIVE'}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(registration.id)}
                              title="Delete Registration"
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          {/* Registration Summary */}
          {registrations && registrations.length > 0 && (
            <Card className="mt-3">
              <Card.Header>
                <h6 className="mb-0">Registration Summary</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <small className="text-muted">
                      <strong>Most Registered Courses:</strong><br/>
                      {(() => {
                        const courseCounts = {};
                        registrations.forEach(reg => {
                          const courseKey = `${reg.course?.code} - ${reg.course?.title}`;
                          courseCounts[courseKey] = (courseCounts[courseKey] || 0) + 1;
                        });
                        const sortedCourses = Object.entries(courseCounts)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3);
                        return sortedCourses.length > 0 
                          ? sortedCourses.map(([course, count]) => `${course} (${count})`).join(', ')
                          : 'No data available';
                      })()}
                    </small>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted">
                      <strong>Registration Status Breakdown:</strong><br/>
                      {(() => {
                        const statusCounts = {};
                        registrations.forEach(reg => {
                          const status = reg.status || 'ACTIVE';
                          statusCounts[status] = (statusCounts[status] || 0) + 1;
                        });
                        return Object.entries(statusCounts)
                          .map(([status, count]) => `${status}: ${count}`)
                          .join(', ');
                      })()}
                    </small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default RegistrationForm;
