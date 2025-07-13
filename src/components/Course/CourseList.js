import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Alert, Spinner, InputGroup, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { courseAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await courseAPI.getAll();
      
      // Ensure we have an array, even if API returns unexpected data
      const coursesData = Array.isArray(response.data) ? response.data : [];
      
      setCourses(coursesData);
      console.log('Courses loaded:', coursesData);
      
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses. Please check if the backend server is running on http://localhost:8080');
      
      // Set empty array as fallback
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    // Ensure courses is always an array
    const coursesArray = Array.isArray(courses) ? courses : [];
    
    if (!searchTerm) {
      setFilteredCourses(coursesArray);
    } else {
      const filtered = coursesArray.filter(course =>
        (course.title && course.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.code && course.code.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCourses(filtered);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseAPI.delete(id);
        const updatedCourses = courses.filter(course => course.id !== id);
        setCourses(updatedCourses);
        setError(null);
      } catch (err) {
        console.error('Error deleting course:', err);
        setError('Failed to delete course. Please try again.');
      }
    }
  };

  if (loading) return <LoadingSpinner message="Loading courses..." />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Course Management</h2>
        <Link to="/courses/new" className="btn btn-primary">
          <FaPlus className="me-2" />
          Add New Course
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      <Card>
        <Card.Header>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search courses by title or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Header>
        <Card.Body>
          {!Array.isArray(filteredCourses) || filteredCourses.length === 0 ? (
            <Alert variant="info">
              {searchTerm ? 'No courses found matching your search.' : 'No courses available.'}
              <br />
              <small className="text-muted">
                {!Array.isArray(courses) ? 'Error: Courses data is not properly loaded.' : 
                 `Total courses loaded: ${courses.length}`}
              </small>
            </Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Course Code</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Credit Hours</th>
                  <th>Max Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <strong>{course.code || 'N/A'}</strong>
                    </td>
                    <td>{course.title || 'N/A'}</td>
                    <td>
                      {course.description && course.description.length > 50
                        ? `${course.description.substring(0, 50)}...`
                        : course.description || 'No description'}
                    </td>
                    <td>
                      <span className="badge bg-info">{course.creditHours || 0}</span>
                    </td>
                    <td>
                      <span className="badge bg-success">{course.maxStudents || 0}</span>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <Link
                          to={`/courses/edit/${course.id}`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          <FaEdit />
                        </Link>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(course.id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <div className="mt-3">
        <small className="text-muted">
          Total courses: {Array.isArray(filteredCourses) ? filteredCourses.length : 0}
        </small>
      </div>

      {/* Debug Information */}
      <Card className="mt-3">
        <Card.Header>
          <h6 className="mb-0">Debug Info</h6>
        </Card.Header>
        <Card.Body>
          <small className="text-muted">
            Courses loaded: {Array.isArray(courses) ? courses.length : 'Invalid data'}<br/>
            Filtered courses: {Array.isArray(filteredCourses) ? filteredCourses.length : 'Invalid data'}<br/>
            Search term: "{searchTerm}"
          </small>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CourseList;