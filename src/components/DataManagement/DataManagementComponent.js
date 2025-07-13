import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Row, Col, Table, Modal, Form, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaDatabase, FaDownload, FaUpload, FaBug } from 'react-icons/fa';
import { courseAPI, studentAPI, registrationAPI } from '../../services/api';

const DataManagementComponent = () => {
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    registrations: 0,
    studentsData: [],
    coursesData: [],
    registrationsData: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkData, setBulkData] = useState({
    students: '',
    courses: '',
    registrations: ''
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setMessage('Loading data...');
      
      console.log('🔍 Loading all data...');
      
      // Fetch data with detailed logging
      const studentsResponse = await studentAPI.getAll();
      const coursesResponse = await courseAPI.getAll();
      const registrationsResponse = await registrationAPI.getAll();
      
      console.log('📊 Raw API Responses:');
      console.log('Students Response:', studentsResponse);
      console.log('Courses Response:', coursesResponse);
      console.log('Registrations Response:', registrationsResponse);
      
      // Extract data safely
      const studentsData = Array.isArray(studentsResponse.data) ? studentsResponse.data : [];
      const coursesData = Array.isArray(coursesResponse.data) ? coursesResponse.data : [];
      const registrationsData = Array.isArray(registrationsResponse.data) ? registrationsResponse.data : [];
      
      console.log('✅ Processed Data:');
      console.log('Students:', studentsData.length, studentsData);
      console.log('Courses:', coursesData.length, coursesData);
      console.log('Registrations:', registrationsData.length, registrationsData);
      
      // Set debug info
      setDebugInfo({
        studentsResponse: {
          status: studentsResponse.status,
          dataType: typeof studentsResponse.data,
          isArray: Array.isArray(studentsResponse.data),
          length: studentsResponse.data?.length,
          firstItem: studentsResponse.data?.[0]
        },
        coursesResponse: {
          status: coursesResponse.status,
          dataType: typeof coursesResponse.data,
          isArray: Array.isArray(coursesResponse.data),
          length: coursesResponse.data?.length,
          firstItem: coursesResponse.data?.[0]
        },
        registrationsResponse: {
          status: registrationsResponse.status,
          dataType: typeof registrationsResponse.data,
          isArray: Array.isArray(registrationsResponse.data),
          length: registrationsResponse.data?.length,
          firstItem: registrationsResponse.data?.[0]
        }
      });

      setStats({
        students: studentsData.length,
        courses: coursesData.length,
        registrations: registrationsData.length,
        studentsData: studentsData,
        coursesData: coursesData,
        registrationsData: registrationsData
      });
      
      setMessage('✅ Data loaded successfully!');
      
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      setMessage(`❌ Error loading data: ${error.message}`);
      setDebugInfo({
        error: error.message,
        stack: error.stack,
        response: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPICalls = async () => {
    try {
      setMessage('Testing direct API calls...');
      
      // Test direct fetch calls
      const baseURL = 'http://localhost:8080/api';
      
      console.log('🧪 Testing direct API calls...');
      
      const studentsTest = await fetch(`${baseURL}/students`);
      const studentsJson = await studentsTest.json();
      
      const coursesTest = await fetch(`${baseURL}/courses`);
      const coursesJson = await coursesTest.json();
      
      const registrationsTest = await fetch(`${baseURL}/registrations`);
      const registrationsJson = await registrationsTest.json();
      
      console.log('🧪 Direct API Results:');
      console.log('Students Direct:', studentsJson);
      console.log('Courses Direct:', coursesJson);
      console.log('Registrations Direct:', registrationsJson);
      
      setDebugInfo({
        ...debugInfo,
        directAPI: {
          students: {
            count: Array.isArray(studentsJson) ? studentsJson.length : 'Not array',
            data: studentsJson
          },
          courses: {
            count: Array.isArray(coursesJson) ? coursesJson.length : 'Not array',
            data: coursesJson
          },
          registrations: {
            count: Array.isArray(registrationsJson) ? registrationsJson.length : 'Not array',
            data: registrationsJson
          }
        }
      });
      
      setMessage('✅ Direct API test completed - check console and debug info');
      setShowDebug(true);
      
    } catch (error) {
      console.error('❌ Direct API test failed:', error);
      setMessage(`❌ Direct API test failed: ${error.message}`);
    }
  };

  const clearAllData = async () => {
    if (!window.confirm('⚠️ WARNING: This will delete ALL data. Are you sure?')) {
      return;
    }

    try {
      setLoading(true);
      setMessage('Clearing all data...');

      // Delete in correct order
      for (const reg of stats.registrationsData) {
        await registrationAPI.delete(reg.id);
      }

      for (const student of stats.studentsData) {
        await studentAPI.delete(student.id);
      }

      for (const course of stats.coursesData) {
        await courseAPI.delete(course.id);
      }

      setMessage('✅ All data cleared successfully!');
      loadStats();
    } catch (error) {
      setMessage(`❌ Error clearing data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addSampleData = async () => {
    try {
      setLoading(true);
      setMessage('Adding sample data...');

      // Add sample courses
      const course1 = await courseAPI.create({
        code: 'TEST101',
        title: 'Test Course 1',
        description: 'Sample course for testing',
        creditHours: 3,
        maxStudents: 30
      });

      const course2 = await courseAPI.create({
        code: 'TEST102',
        title: 'Test Course 2',
        description: 'Another sample course',
        creditHours: 4,
        maxStudents: 25
      });

      // Add sample students
      const student1 = await studentAPI.create({
        studentId: 'TEST001',
        firstName: 'Test',
        lastName: 'Student1',
        email: 'test1@university.edu',
        major: 'Computer Science',
        enrollmentYear: 2024
      });

      const student2 = await studentAPI.create({
        studentId: 'TEST002',
        firstName: 'Test',
        lastName: 'Student2',
        email: 'test2@university.edu',
        major: 'Mathematics',
        enrollmentYear: 2024
      });

      // Add sample registration
      await registrationAPI.create({
        student: { id: student1.data.id },
        course: { id: course1.data.id }
      });

      setMessage('✅ Sample data added successfully!');
      loadStats();
    } catch (error) {
      setMessage(`❌ Error adding sample data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const dataExport = {
      students: stats.studentsData,
      courses: stats.coursesData,
      registrations: stats.registrationsData,
      exportDate: new Date().toISOString(),
      stats: {
        studentsCount: stats.students,
        coursesCount: stats.courses,
        registrationsCount: stats.registrations
      }
    };

    const dataStr = JSON.stringify(dataExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `university-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    setMessage('✅ Data exported successfully!');
  };

  return (
    <div>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">🗄️ Data Management Center</h5>
          <div>
            <Button 
              variant="outline-info" 
              size="sm" 
              onClick={testDirectAPICalls}
              className="me-2"
            >
              <FaBug className="me-1" />
              Test APIs
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={() => setShowDebug(!showDebug)}
            >
              Debug Info
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {message && (
            <Alert variant={message.includes('✅') ? 'success' : message.includes('❌') ? 'danger' : 'info'} className="mb-3">
              {message}
            </Alert>
          )}

          {/* Current Stats */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className={`${stats.students > 1000 ? 'text-danger' : 'text-primary'}`}>
                    {stats.students || 0}
                  </h3>
                  <p className="mb-0">Students</p>
                  {stats.students > 1000 && (
                    <Badge bg="danger">Suspicious count!</Badge>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className={`${stats.courses > 1000 ? 'text-danger' : 'text-success'}`}>
                    {stats.courses || 0}
                  </h3>
                  <p className="mb-0">Courses</p>
                  {stats.courses > 1000 && (
                    <Badge bg="danger">Suspicious count!</Badge>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-warning">{stats.registrations || 0}</h3>
                  <p className="mb-0">Registrations</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Debug Information */}
          {showDebug && (
            <Card className="mb-4 border-warning">
              <Card.Header>
                <h6 className="mb-0">🐛 Debug Information</h6>
              </Card.Header>
              <Card.Body>
                <pre className="bg-light p-3" style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </Card.Body>
            </Card>
          )}

          {/* Action Buttons */}
          <Row>
            <Col md={6}>
              <h6>Quick Actions</h6>
              <div className="d-grid gap-2">
                <Button 
                  variant="success" 
                  onClick={addSampleData}
                  disabled={loading}
                >
                  <FaPlus className="me-2" />
                  Add Sample Data
                </Button>
                
                <Button 
                  variant="primary" 
                  onClick={exportData}
                  disabled={loading}
                >
                  <FaDownload className="me-2" />
                  Export All Data
                </Button>
              </div>
            </Col>
            
            <Col md={6}>
              <h6>Dangerous Actions</h6>
              <div className="d-grid gap-2">
                <Button 
                  variant="danger" 
                  onClick={clearAllData}
                  disabled={loading}
                >
                  <FaTrash className="me-2" />
                  Clear All Data
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={loadStats}
                  disabled={loading}
                >
                  <FaDatabase className="me-2" />
                  Refresh Stats
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DataManagementComponent;