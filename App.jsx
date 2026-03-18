import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import Ledger from './components/Ledger';
import StatementOfAccount from './components/StatementOfAccount';
import AgingReport from './components/AgingReport';
import TuitionFees from './components/TuitionFees';
import { StudentProvider } from './context/StudentContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard onSelectStudent={(student) => {
          setSelectedStudent(student);
          setActiveTab('studentList');
        }} />;
      case 'studentList':
        return <StudentList
            onEdit={(student) => {
              setSelectedStudent(student);
              setActiveTab('studentForm');
            }}
            onViewLedger={(student) => {
              setSelectedStudent(student);
              setActiveTab('ledger');
            }}
            onViewSOA={(student) => {
              setSelectedStudent(student);
              setActiveTab('statement');
            }}
        />;
      case 'studentForm':
        return <StudentForm
            student={selectedStudent}
            onSave={() => {
              setSelectedStudent(null);
              setActiveTab('studentList');
            }}
            onCancel={() => {
              setSelectedStudent(null);
              setActiveTab('studentList');
            }}
        />;
      case 'tuitionFees':
        return <TuitionFees />;
      case 'ledger':
        return <Ledger
            student={selectedStudent}
            onBack={() => setActiveTab('studentList')}
        />;
      case 'statement':
        return <StatementOfAccount
            student={selectedStudent}
            onBack={() => setActiveTab('studentList')}
        />;
      case 'aging':
        return <AgingReport
            onBack={() => setActiveTab('dashboard')}
        />;
      default:
        return <Dashboard />;
    }
  };

  return (
      <StudentProvider>
        <div className="app-container">
          <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container-fluid">
              <span className="navbar-brand">📚 Student Information System</span>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ms-auto">
                  <li className="nav-item">
                    <button
                        className={`nav-link btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                      Dashboard
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                        className={`nav-link btn ${activeTab === 'studentList' ? 'active' : ''}`}
                        onClick={() => setActiveTab('studentList')}
                    >
                      Students
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                        className={`nav-link btn ${activeTab === 'tuitionFees' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tuitionFees')}
                    >
                      Tuition Fees
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                        className={`nav-link btn ${activeTab === 'aging' ? 'active' : ''}`}
                        onClick={() => setActiveTab('aging')}
                    >
                      Aging Report
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          <div className="container-fluid mt-4">
            {renderContent()}
          </div>
        </div>
      </StudentProvider>
  );
}

export default App;