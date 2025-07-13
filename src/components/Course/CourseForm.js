import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { courseAPI } from '../../services/api';

const CourseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [course, setCourse] = useState({
    code: '',
    title: '',
    description: '',
    creditHours: '',
    maxStudents: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchCourse();
    }
  }, [id, isEditMode]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getById(id);
      setCourse(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch course details.');
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse(prev => ({
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
      const courseData = {
        ...course,
        creditHours: parseInt(course.creditHours),
        maxStudents: parseInt(course.maxStudents)
      };

      if (isEditMode) {
        await courseAPI.update(id, courseData);
        setSuccess(true);
        setTimeout(() => navigate('/courses'), 2000);
      } else {
        await courseAPI.create(courseData);
        setSuccess(true);
        setTimeout(() => navigate('/courses'), 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        `Failed to ${isEditMode ? 'update' : 'create'} course. Please try again.`
      );
      console.error('Error saving course:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEditMode ? 'Edit Course' : 'Add New Course'}</h2>
        <Button variant="outline-secondary" onClick={() => navigate('/courses')}>
          <FaArrowLeft className="me-2" />
          Back to Courses
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && (
        <Alert variant="success">
          Course {isEditMode ? 'updated' : 'created'} successfully! Redirecting...
        </Alert>
      )}

      <Card>
        <Card.Header>
          <h5 className="mb-0">Course Information</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={course.code}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    placeholder="e.g., CS101"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Credit Hours *</Form.Label>
                  <Form.Control
                    type="number"
                    name="creditHours"
                    value={course.creditHours}
                    onChange={handleChange}
                    required
                    min={1}
                    max={6}
                    placeholder="e.g., 3"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Course Title *</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={course.title}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="e.g., Introduction to Programming"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={course.description}
                onChange={handleChange}
                maxLength={500}
                placeholder="Course description..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Maximum Students *</Form.Label>
              <Form.Control
                type="number"
                name="maxStudents"
                value={course.maxStudents}
                onChange={handleChange}
                required
                min={1}
                max={100}
                placeholder="e.g., 30"
              />
            </Form.Group>

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
                    {isEditMode ? 'Update Course' : 'Create Course'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate('/courses')}
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

export default CourseForm;