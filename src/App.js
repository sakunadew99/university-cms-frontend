import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import CourseList from './components/Course/CourseList';
import CourseForm from './components/Course/CourseForm';
import StudentList from './components/Student/StudentList';
import StudentForm from './components/Student/StudentForm';
import RegistrationForm from './components/Registration/RegistrationForm';
import Dashboard from './components/Dashboard/Dashboard';
import DataManagementComponent from './components/DataManagement/DataManagementComponent';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Header />
        <div className="d-flex flex-grow-1">
          <Sidebar />
          <main className="flex-grow-1 p-4">
            <Container fluid>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/courses" element={<CourseList />} />
                <Route path="/courses/new" element={<CourseForm />} />
                <Route path="/courses/edit/:id" element={<CourseForm />} />
                <Route path="/students" element={<StudentList />} />
                <Route path="/students/new" element={<StudentForm />} />
                <Route path="/students/edit/:id" element={<StudentForm />} />
                <Route path="/registrations" element={<RegistrationForm />} />
                <Route path="/data-management" element={<DataManagementComponent />} />
              </Routes>
            </Container>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;