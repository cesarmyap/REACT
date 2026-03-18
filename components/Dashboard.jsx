import React from 'react';
import { useStudents } from '../context/StudentContext';
import { generateStudentListPDF, generateAgingReportPDF } from '../utils/pdfGenerator';

const Dashboard = ({ onSelectStudent }) => {
    const { students, getStudentBalance, getAgingReport } = useStudents();

    const stats = {
        totalStudents: students.length,
        activeStudents: students.filter(s => s.status === 'active').length,
        totalBalance: students.reduce((acc, s) => acc + getStudentBalance(s.id), 0),
        averageBalance: (students.reduce((acc, s) => acc + getStudentBalance(s.id), 0) / students.length) || 0
    };

    const agingReport = getAgingReport();
    const agingSummary = Object.entries(agingReport).map(([period, stu]) => ({
        period,
        count: stu.length,
        total: stu.reduce((acc, s) => acc + s.balance, 0)
    }));

    const handlePrintPDF = () => {
        generateStudentListPDF(students.map(s => ({
            ...s,
            balance: getStudentBalance(s.id)
        })));
    };

    const handlePrintAgingPDF = () => {
        generateAgingReportPDF(agingReport);
    };

    return (
        <div className="dashboard">
            <h2 className="mb-4">Dashboard</h2>

            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card text-white bg-primary">
                        <div className="card-body">
                            <h5 className="card-title">Total Students</h5>
                            <h2>{stats.totalStudents}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-success">
                        <div className="card-body">
                            <h5 className="card-title">Active Students</h5>
                            <h2>{stats.activeStudents}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-warning">
                        <div className="card-body">
                            <h5 className="card-title">Total Receivables</h5>
                            <h2>${stats.totalBalance.toFixed(2)}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-info">
                        <div className="card-body">
                            <h5 className="card-title">Average Balance</h5>
                            <h2>${stats.averageBalance.toFixed(2)}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5>Recent Students</h5>
                            <button className="btn btn-sm btn-primary" onClick={handlePrintPDF}>
                                📄 Export PDF
                            </button>
                        </div>
                        <div className="card-body">
                            <table className="table table-hover">
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Grade</th>
                                    <th>Balance</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {students.slice(0, 5).map(student => (
                                    <tr key={student.id}>
                                        <td>{student.firstName} {student.lastName}</td>
                                        <td>{student.grade}</td>
                                        <td>${getStudentBalance(student.id).toFixed(2)}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => onSelectStudent(student)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5>Aging Summary</h5>
                            <button className="btn btn-sm btn-primary" onClick={handlePrintAgingPDF}>
                                📄 Export PDF
                            </button>
                        </div>
                        <div className="card-body">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>Days</th>
                                    <th>Count</th>
                                    <th>Amount</th>
                                    <th>%</th>
                                </tr>
                                </thead>
                                <tbody>
                                {agingSummary.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.period}</td>
                                        <td>{item.count}</td>
                                        <td>${item.total.toFixed(2)}</td>
                                        <td>
                                            {((item.total / stats.totalBalance) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;