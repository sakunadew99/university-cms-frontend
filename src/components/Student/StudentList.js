import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Alert, InputGroup, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await studentAPI.getAll();
      
      // Ensure we have an array, even if API returns unexpected data
      const studentsData = Array.isArray(response.data) ? response.data : [];
      
      setStudents(studentsData);
      console.log('Students loaded:', studentsData);
      
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students. Please check if the backend server is running on http://localhost:8080');
      
      // Set empty array as fallback
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    // Ensure students is always an array
    const studentsArray = Array.isArray(students) ? students : [];
    
    if (!searchTerm) {
      setFilteredStudents(studentsArray);
    } else {
      const filtered = studentsArray.filter(student =>
        (student.firstName && student.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.lastName && student.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredStudents(filtered);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentAPI.delete(id);
        const updatedStudents = students.filter(student => student.id !== id);
        setStudents(updatedStudents);
        setError(null);
      } catch (err) {
        console.error('Error deleting student:', err);
        setError('Failed to delete student. Please try again.');
      }
    }
  };

  if (loading) return <LoadingSpinner message="Loading students..." />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Student Management</h2>
        <Link to="/students/new" className="btn btn-primary">
          <FaPlus className="me-2" />
          Add New Student
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
              placeholder="Search students by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Header>
        <Card.Body>
          {!Array.isArray(filteredStudents) || filteredStudents.length === 0 ? (
            <Alert variant="info">
              {searchTerm ? 'No students found matching your search.' : 'No students available.'}
              <br />
              <small className="text-muted">
                {!Array.isArray(students) ? 'Error: Students data is not properly loaded.' : 
                 `Total students loaded: ${students.length}`}
              </small>
            </Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Major</th>
                  <th>Enrollment Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.studentId || 'N/A'}</strong>
                    </td>
                    <td>
                      {(student.firstName || '') + ' ' + (student.lastName || '')}
                    </td>
                    <td>{student.email || 'N/A'}</td>
                    <td>
                      <span className="badge bg-info">{student.major || 'Undeclared'}</span>
                    </td>
                    <td>
                      <span className="badge bg-success">{student.enrollmentYear || 'N/A'}</span>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <Link
                          to={`/students/edit/${student.id}`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          <FaEdit />
                        </Link>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
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
          Total students: {Array.isArray(filteredStudents) ? filteredStudents.length : 0}
        </small>
      </div>

      {/* Debug Information */}
      <Card className="mt-3">
        <Card.Header>
          <h6 className="mb-0">Debug Info</h6>
        </Card.Header>
        <Card.Body>
          <small className="text-muted">
            Students loaded: {Array.isArray(students) ? students.length : 'Invalid data'}<br/>
            Filtered students: {Array.isArray(filteredStudents) ? filteredStudents.length : 'Invalid data'}<br/>
            Search term: "{searchTerm}"
          </small>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StudentList;