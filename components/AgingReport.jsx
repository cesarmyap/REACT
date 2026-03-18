import React from 'react';
import { useStudents } from '../context/StudentContext';
import { generateAgingReportPDF } from '../utils/pdfGenerator';

const AgingReport = ({ onBack }) => {
    const { getAgingReport } = useStudents();
    const agingData = getAgingReport();

    const agingPeriods = [
        { key: '1-30', label: '1-30 Days', color: 'success' },
        { key: '31-60', label: '31-60 Days', color: 'info' },
        { key: '61-90', label: '61-90 Days', color: 'warning' },
        { key: '91-120', label: '91-120 Days', color: 'danger' },
        { key: '120+', label: 'Over 120 Days', color: 'dark' }
    ];

    const totalAging = agingPeriods.reduce((acc, period) => {
        return acc + agingData[period.key].reduce((sum, s) => sum + s.balance, 0);
    }, 0);

    const handlePrintPDF = () => {
        generateAgingReportPDF(agingData);
    };

    return (
        <div className="aging-report">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Accounts Receivable Aging Report</h2>
                <div>
                    <button className="btn btn-primary me-2" onClick={handlePrintPDF}>
                        📄 Export PDF
                    </button>
                    <button className="btn btn-secondary" onClick={onBack}>
                        ← Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card bg-light">
                        <div className="card-body">
                            <h6>Total Receivables</h6>
                            <h3>${totalAging.toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {agingPeriods.map(period => {
                const students = agingData[period.key];
                if (students.length === 0) return null;

                const periodTotal = students.reduce((acc, s) => acc + s.balance, 0);

                return (
                    <div className="card mb-4" key={period.key}>
                        <div className={`card-header bg-${period.color} text-white`}>
                            <div className="d-flex justify-content-between">
                                <h5>{period.label}</h5>
                                <span>Total: ${periodTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="card-body">
                            <table className="table table-sm">
                                <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Grade</th>
                                    <th>Days Overdue</th>
                                    <th>Balance</th>
                                    <th>% of Period</th>
                                </tr>
                                </thead>
                                <tbody>
                                {students.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.id}</td>
                                        <td>{student.firstName} {student.lastName}</td>
                                        <td>{student.grade}</td>
                                        <td>{student.days || 'N/A'}</td>
                                        <td>${student.balance.toFixed(2)}</td>
                                        <td>
                                            {((student.balance / periodTotal) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AgingReport;