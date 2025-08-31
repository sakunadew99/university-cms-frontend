import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col, Table, Modal } from 'react-bootstrap';
import { FaPlus, FaTrash, FaEdit, FaSave } from 'react-icons/fa';
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
    courseId: '',
    result: '' // NEW FIELD
  });

  // For editing result
  const [editModal, setEditModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [editResult, setEditResult] = useState('');

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

      const studentsData = Array.isArray(studentsResponse.data) ? studentsResponse.data : [];
      const coursesData = Array.isArray(coursesResponse.data) ? coursesResponse.data : [];
      const registrationsData = Array.isArray(registrationsResponse.data) ? registrationsResponse.data : [];

      setStudents(studentsData);
      setCourses(coursesData);
      setRegistrations(registrationsData);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please check if the backend server is running on http://localhost:8080');
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
        course: { id: parseInt(newRegistration.courseId) },
        result: newRegistration.result || null
      };

      await registrationAPI.create(registrationData);
      setSuccess(true);
      setNewRegistration({ studentId: '', courseId: '', result: '' });
      fetchData();

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

  // --- Edit Result Functions ---
  const openEditModal = (registration) => {
    setSelectedRegistration(registration);
    setEditResult(registration.result || '');
    setEditModal(true);
  };

  const handleUpdateResult = async () => {
    try {
      const updatedData = { ...selectedRegistration, result: editResult };
      await registrationAPI.update(selectedRegistration.id, updatedData);

      setRegistrations(registrations.map(r =>
        r.id === selectedRegistration.id ? { ...r, result: editResult } : r
      ));

      setEditModal(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating result:', err);
      setError('Failed to update result.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading registration data..." />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Registration Management</h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Operation completed successfully!</Alert>}

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
                    {students.length > 0 ? (
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
                    {courses.length > 0 ? (
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

                <Form.Group className="mb-3">
                  <Form.Label>Result (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter marks/grade"
                    name="result"
                    value={newRegistration.result}
                    onChange={handleInputChange}
                  />
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
                      <th>Result</th>
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
                          {registration.result || <span className="text-muted">N/A</span>}
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
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => openEditModal(registration)}
                          >
                            <FaEdit />
                          </Button>
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

      {/* Edit Result Modal */}
      <Modal show={editModal} onHide={() => setEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Result</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Result</Form.Label>
            <Form.Control
              type="text"
              value={editResult}
              onChange={(e) => setEditResult(e.target.value)}
              placeholder="Enter new result (e.g., 85 or A)"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateResult}>
            <FaSave className="me-2" /> Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default RegistrationForm;
