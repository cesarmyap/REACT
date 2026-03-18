import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';

const StudentList = ({ onEdit, onViewLedger, onViewSOA }) => {
    const { students, deleteStudent, getStudentBalance } = useStudents();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGrade, setFilterGrade] = useState('');

    const filteredStudents = students.filter(student => {
        const matchesSearch = `${student.firstName} ${student.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesGrade = !filterGrade || student.grade === filterGrade;
        return matchesSearch && matchesGrade;
    });

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            deleteStudent(id);
        }
    };

    return (
        <div className="student-list">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Student Management</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => onEdit(null)}
                >
                    ➕ Add New Student
                </button>
            </div>

            <div className="row mb-4">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={filterGrade}
                        onChange={(e) => setFilterGrade(e.target.value)}
                    >
                        <option value="">All Grades</option>
                        <option value="K">Kindergarten</option>
                        <option value="1">Grade 1</option>
                        <option value="2">Grade 2</option>
                        <option value="3">Grade 3</option>
                        <option value="4">Grade 4</option>
                        <option value="5">Grade 5</option>
                        <option value="6">Grade 6</option>
                        <option value="7">Grade 7</option>
                        <option value="8">Grade 8</option>
                        <option value="9">Grade 9</option>
                        <option value="10">Grade 10</option>
                        <option value="11">Grade 11</option>
                        <option value="12">Grade 12</option>
                    </select>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <table className="table table-hover">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Grade</th>
                            <th>Enrolled Date</th>
                            <th>Status</th>
                            <th>Balance</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredStudents.map(student => (
                            <tr key={student.id}>
                                <td>{student.id}</td>
                                <td>{student.firstName} {student.lastName}</td>
                                <td>{student.grade}</td>
                                <td>{student.dateEnrolled}</td>
                                <td>
                    <span className={`badge bg-${student.status === 'active' ? 'success' : 'secondary'}`}>
                      {student.status}
                    </span>
                                </td>
                                <td>${getStudentBalance(student.id).toFixed(2)}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-outline-primary me-1"
                                        onClick={() => onViewLedger(student)}
                                        title="View Ledger"
                                    >
                                        📒
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-success me-1"
                                        onClick={() => onViewSOA(student)}
                                        title="Statement of Account"
                                    >
                                        📄
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-warning me-1"
                                        onClick={() => onEdit(student)}
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(student.id)}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentList;