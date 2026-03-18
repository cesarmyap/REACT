import React, { useState, useEffect } from 'react';
import { useStudents } from '../context/StudentContext';

const StudentForm = ({ student, onSave, onCancel }) => {
    const { addStudent, updateStudent } = useStudents();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        grade: '',
        status: 'active'
    });

    useEffect(() => {
        if (student) {
            setFormData({
                firstName: student.firstName,
                lastName: student.lastName,
                grade: student.grade,
                status: student.status
            });
        }
    }, [student]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (student) {
            updateStudent(student.id, formData);
        } else {
            addStudent(formData);
        }

        onSave();
    };

    return (
        <div className="student-form">
            <h2 className="mb-4">{student ? 'Edit Student' : 'Add New Student'}</h2>

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Grade Level</label>
                                <select
                                    className="form-select"
                                    name="grade"
                                    value={formData.grade}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Grade</option>
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
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="graduated">Graduated</option>
                                    <option value="transferred">Transferred</option>
                                </select>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-secondary" onClick={onCancel}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {student ? 'Update Student' : 'Add Student'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentForm;