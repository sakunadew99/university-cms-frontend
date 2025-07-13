import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { studentAPI } from '../../services/api';

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [student, setStudent] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    major: '',
    enrollmentYear: new Date().getFullYear()
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const majors = [
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Data Science',
    'Cybersecurity',
    'Mathematics',
    'Engineering'
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchStudent();
    }
  }, [id, isEditMode]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getById(id);
      setStudent(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch student details.');
      console.error('Error fetching student:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const studentData = {
        ...student,
        enrollmentYear: parseInt(student.enrollmentYear)
      };

      if (isEditMode) {
        await studentAPI.update(id, studentData);
        setSuccess(true);
        setTimeout(() => navigate('/students'), 2000);
      } else {
        await studentAPI.create(studentData);
        setSuccess(true);
        setTimeout(() => navigate('/students'), 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        `Failed to ${isEditMode ? 'update' : 'create'} student. Please try again.`
      );
      console.error('Error saving student:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEditMode ? 'Edit Student' : 'Add New Student'}</h2>
        <Button variant="outline-secondary" onClick={() => navigate('/students')}>
          <FaArrowLeft className="me-2" />
          Back to Students
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && (
        <Alert variant="success">
          Student {isEditMode ? 'updated' : 'created'} successfully! Redirecting...
        </Alert>
      )}

      <Card>
        <Card.Header>
          <h5 className="mb-0">Student Information</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Student ID *</Form.Label>
                  <Form.Control
                    type="text"
                    name="studentId"
                    value={student.studentId}
                    onChange={handleChange}
                    required
                    maxLength={20}
                    placeholder="e.g., STU001"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Enrollment Year *</Form.Label>
                  <Form.Control
                    type="number"
                    name="enrollmentYear"
                    value={student.enrollmentYear}
                    onChange={handleChange}
                    required
                    min={2000}
                    max={2030}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={student.firstName}
                    onChange={handleChange}
                    required
                    maxLength={50}
                    placeholder="First Name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={student.lastName}
                    onChange={handleChange}
                    required
                    maxLength={50}
                    placeholder="Last Name"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={student.email}
                onChange={handleChange}
                required
                placeholder="student@university.edu"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={student.phone}
                    onChange={handleChange}
                    maxLength={15}
                    placeholder="+1234567890"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Major</Form.Label>
                  <Form.Select
                    name="major"
                    value={student.major}
                    onChange={handleChange}
                  >
                    <option value="">Select Major</option>
                    {majors.map(major => (
                      <option key={major} value={major}>{major}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    {isEditMode ? 'Update Student' : 'Create Student'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate('/students')}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StudentForm;