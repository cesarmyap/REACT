import React, { useState } from 'react';
import { formatCurrency } from '../utils/calculations';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const FeeReports = ({ students, feeStructures, paymentHistory, getStudentBalance }) => {
    const [reportType, setReportType] = useState('summary');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    // Generate collection summary by grade
    const getCollectionSummaryByGrade = () => {
        const summary = {};

        students.forEach(student => {
            if (student.status !== 'active') return;

            const grade = student.grade;
            if (!summary[grade]) {
                summary[grade] = {
                    totalStudents: 0,
                    totalFees: 0,
                    collected: 0,
                    outstanding: 0
                };
            }

            const fees = feeStructures[grade];
            const balance = getStudentBalance(student.id);

            summary[grade].totalStudents++;
            summary[grade].totalFees += fees.total;
            summary[grade].outstanding += balance;
            summary[grade].collected += (fees.total - balance);
        });

        return summary;
    };

    // Get payment method breakdown
    const getPaymentMethodBreakdown = () => {
        const breakdown = {};

        paymentHistory.forEach(payment => {
            if (!breakdown[payment.paymentMethod]) {
                breakdown[payment.paymentMethod] = {
                    count: 0,
                    total: 0
                };
            }
            breakdown[payment.paymentMethod].count++;
            breakdown[payment.paymentMethod].total += payment.amount;
        });

        return breakdown;
    };

    // Get monthly collection trend
    const getMonthlyTrend = () => {
        const trend = {};

        paymentHistory.forEach(payment => {
            const month = payment.date.substring(0, 7); // YYYY-MM
            if (!trend[month]) {
                trend[month] = {
                    month,
                    total: 0,
                    count: 0
                };
            }
            trend[month].total += payment.amount;
            trend[month].count++;
        });

        return Object.values(trend).sort((a, b) => a.month.localeCompare(b.month));
    };

    // Generate PDF Report
    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Tuition Fee Report', 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Period: ${dateRange.start} to ${dateRange.end}`, 14, 36);

        if (reportType === 'summary') {
            const summary = getCollectionSummaryByGrade();

            doc.setFontSize(14);
            doc.text('Collection Summary by Grade', 14, 48);

            const tableColumn = ["Grade", "Students", "Total Fees", "Collected", "Outstanding", "Collection Rate"];
            const tableRows = [];

            Object.entries(summary).forEach(([grade, data]) => {
                const rate = (data.collected / data.totalFees * 100).toFixed(1);
                tableRows.push([
                    `Grade ${grade}`,
                    data.totalStudents,
                    formatCurrency(data.totalFees),
                    formatCurrency(data.collected),
                    formatCurrency(data.outstanding),
                    `${rate}%`
                ]);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 55,
                theme: 'striped',
                styles: { fontSize: 9 }
            });
        }

        doc.save('fee-report.pdf');
    };

    const summaryByGrade = getCollectionSummaryByGrade();
    const paymentBreakdown = getPaymentMethodBreakdown();
    const monthlyTrend = getMonthlyTrend();

    return (
        <div className="fee-reports">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5>Fee Reports & Analytics</h5>
                <div>
                    <button className="btn btn-primary me-2" onClick={generatePDF}>
                        📄 Export PDF
                    </button>
                    <button className="btn btn-success">
                        📊 Export Excel
                    </button>
                </div>
            </div>

            {/* Report Controls */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-3">
                            <label className="form-label">Report Type</label>
                            <select
                                className="form-select"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <option value="summary">Summary Report</option>
                                <option value="detailed">Detailed Report</option>
                                <option value="trend">Trend Analysis</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <h6>Total Collections</h6>
                            <h3>{formatCurrency(paymentHistory.reduce((sum, p) => sum + p.amount, 0))}</h3>
                            <small>{paymentHistory.length} transactions</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <h6>Average Payment</h6>
                            <h3>{formatCurrency(
                                paymentHistory.reduce((sum, p) => sum + p.amount, 0) / paymentHistory.length || 0
                            )}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info text-white">
                        <div className="card-body">
                            <h6>Active Students</h6>
                            <h3>{students.filter(s => s.status === 'active').length}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-white">
                        <div className="card-body">
                            <h6>Collection Rate</h6>
                            <h3>
                                {((paymentHistory.reduce((sum, p) => sum + p.amount, 0) /
                                    students.reduce((sum, s) => {
                                        if (s.status === 'active') {
                                            return sum + (feeStructures[s.grade]?.total || 0);
                                        }
                                        return sum;
                                    }, 0)) * 100).toFixed(1)}%
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6>Collection by Grade</h6>
                        </div>
                        <div className="card-body">
                            <table className="table table-sm">
                                <thead>
                                <tr>
                                    <th>Grade</th>
                                    <th>Students</th>
                                    <th>Total Fees</th>
                                    <th>Collected</th>
                                    <th>Outstanding</th>
                                    <th>Rate</th>
                                </tr>
                                </thead>
                                <tbody>
                                {Object.entries(summaryByGrade).map(([grade, data]) => (
                                    <tr key={grade}>
                                        <td>Grade {grade}</td>
                                        <td>{data.totalStudents}</td>
                                        <td>{formatCurrency(data.totalFees)}</td>
                                        <td className="text-success">{formatCurrency(data.collected)}</td>
                                        <td className="text-danger">{formatCurrency(data.outstanding)}</td>
                                        <td>
                                            <div className="progress" style={{ height: '15px' }}>
                                                <div
                                                    className="progress-bar bg-success"
                                                    style={{ width: `${(data.collected / data.totalFees * 100)}%` }}
                                                >
                                                    {(data.collected / data.totalFees * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6>Payment Methods</h6>
                        </div>
                        <div className="card-body">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>Method</th>
                                    <th>Count</th>
                                    <th>Total</th>
                                    <th>Average</th>
                                </tr>
                                </thead>
                                <tbody>
                                {Object.entries(paymentBreakdown).map(([method, data]) => (
                                    <tr key={method}>
                                        <td>{method}</td>
                                        <td>{data.count}</td>
                                        <td>{formatCurrency(data.total)}</td>
                                        <td>{formatCurrency(data.total / data.count)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Trend */}
            <div className="card">
                <div className="card-header">
                    <h6>Monthly Collection Trend</h6>
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Month</th>
                            <th>Transactions</th>
                            <th>Total Collected</th>
                            <th>Average per Transaction</th>
                            <th>Trend</th>
                        </tr>
                        </thead>
                        <tbody>
                        {monthlyTrend.map((month, index) => (
                            <tr key={month.month}>
                                <td>{month.month}</td>
                                <td>{month.count}</td>
                                <td>{formatCurrency(month.total)}</td>
                                <td>{formatCurrency(month.total / month.count)}</td>
                                <td>
                                    {index > 0 && (
                                        <span className={month.total > monthlyTrend[index-1].total ? 'text-success' : 'text-danger'}>
                        {((month.total - monthlyTrend[index-1].total) / monthlyTrend[index-1].total * 100).toFixed(1)}%
                      </span>
                                    )}
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

export default FeeReports;