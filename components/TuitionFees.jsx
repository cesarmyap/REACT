import React, { useState, useEffect } from 'react';
import { useStudents } from '../context/StudentContext';
import { formatCurrency } from '../utils/calculations';
import FeeStructureManager from './FeeStructureManager';
import FeeCollection from './FeeCollection';
import FeeReports from './FeeReports';

const TuitionFees = () => {
    const { students, getStudentBalance } = useStudents();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [feeStructures, setFeeStructures] = useState(() => {
        // Load from localStorage or use defaults
        const saved = localStorage.getItem('feeStructures');
        return saved ? JSON.parse(saved) : defaultFeeStructures;
    });
    const [collections, setCollections] = useState(() => {
        const saved = localStorage.getItem('collections');
        return saved ? JSON.parse(saved) : [];
    });
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Default fee structures by grade
    const defaultFeeStructures = {
        'K': { tuition: 3500, misc: 500, total: 4000 },
        '1': { tuition: 3800, misc: 550, total: 4350 },
        '2': { tuition: 3800, misc: 550, total: 4350 },
        '3': { tuition: 4000, misc: 600, total: 4600 },
        '4': { tuition: 4000, misc: 600, total: 4600 },
        '5': { tuition: 4200, misc: 650, total: 4850 },
        '6': { tuition: 4200, misc: 650, total: 4850 },
        '7': { tuition: 4500, misc: 700, total: 5200 },
        '8': { tuition: 4500, misc: 700, total: 5200 },
        '9': { tuition: 4800, misc: 750, total: 5550 },
        '10': { tuition: 4800, misc: 750, total: 5550 },
        '11': { tuition: 5200, misc: 800, total: 6000 },
        '12': { tuition: 5200, misc: 800, total: 6000 }
    };

    // Save to localStorage whenever fee structures change
    useEffect(() => {
        localStorage.setItem('feeStructures', JSON.stringify(feeStructures));
    }, [feeStructures]);

    // Save collections to localStorage
    useEffect(() => {
        localStorage.setItem('collections', JSON.stringify(collections));
    }, [collections]);

    // Load payment history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('paymentHistory');
        if (saved) {
            setPaymentHistory(JSON.parse(saved));
        }
    }, []);

    // Save payment history
    useEffect(() => {
        localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));
    }, [paymentHistory]);

    // Calculate fee summary
    const calculateFeeSummary = () => {
        let totalFees = 0;
        let totalCollected = 0;
        let totalOutstanding = 0;
        let studentsWithBalance = 0;

        students.forEach(student => {
            if (student.status === 'active') {
                const feeStructure = feeStructures[student.grade] || feeStructures['K'];
                const balance = getStudentBalance(student.id);

                totalFees += feeStructure.total;
                totalCollected += (feeStructure.total - balance);
                totalOutstanding += balance;

                if (balance > 0) studentsWithBalance++;
            }
        });

        return {
            totalFees,
            totalCollected,
            totalOutstanding,
            studentsWithBalance,
            collectionRate: totalFees > 0 ? (totalCollected / totalFees) * 100 : 0
        };
    };

    // Get students with fee details
    const getStudentsWithFeeDetails = () => {
        return students
            .filter(student => {
                const matchesSearch = `${student.firstName} ${student.lastName}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
                const matchesGrade = !selectedGrade || student.grade === selectedGrade;
                const balance = getStudentBalance(student.id);
                const matchesStatus =
                    filterStatus === 'all' ? true :
                        filterStatus === 'paid' ? balance === 0 :
                            filterStatus === 'pending' ? balance > 0 :
                                filterStatus === 'overdue' ? balance > 1000 : true;

                return matchesSearch && matchesGrade && matchesStatus;
            })
            .map(student => {
                const feeStructure = feeStructures[student.grade] || feeStructures['K'];
                const balance = getStudentBalance(student.id);
                const paidAmount = feeStructure.total - balance;
                const paymentProgress = (paidAmount / feeStructure.total) * 100;

                // Get last payment date
                const studentPayments = paymentHistory
                    .filter(p => p.studentId === student.id)
                    .sort((a, b) => new Date(b.date) - new Date(a.date));

                const lastPayment = studentPayments[0];

                // Determine if overdue (no payment for 30+ days and balance > 0)
                const isOverdue = balance > 0 && lastPayment &&
                    (new Date() - new Date(lastPayment.date)) > 30 * 24 * 60 * 60 * 1000;

                return {
                    ...student,
                    feeStructure,
                    balance,
                    paidAmount,
                    paymentProgress,
                    lastPayment,
                    isOverdue,
                    paymentStatus: balance === 0 ? 'paid' : isOverdue ? 'overdue' : 'pending'
                };
            });
    };

    const summary = calculateFeeSummary();
    const studentsWithFees = getStudentsWithFeeDetails();

    // Handle new payment
    const handlePayment = (student, amount, paymentMethod, notes) => {
        const payment = {
            id: Date.now().toString(),
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            grade: student.grade,
            amount: parseFloat(amount),
            date: new Date().toISOString().split('T')[0],
            paymentMethod,
            notes,
            reference: `PAY-${Date.now()}`
        };

        setPaymentHistory([payment, ...paymentHistory]);

        // Also add to transactions in main context
        const { addTransaction } = useStudents();
        addTransaction({
            studentId: student.id,
            type: 'credit',
            amount: parseFloat(amount),
            description: `Tuition payment - ${paymentMethod}`
        });

        alert(`Payment of ${formatCurrency(amount)} recorded successfully!`);
    };

    // Generate payment receipt
    const generateReceipt = (payment) => {
        const student = students.find(s => s.id === payment.studentId);
        if (!student) return;

        const receipt = `
      SCHOOL NAME
      ===========
      OFFICIAL RECEIPT
      
      Receipt No: ${payment.reference}
      Date: ${payment.date}
      
      Received from: ${student.firstName} ${student.lastName}
      Grade: ${student.grade}
      
      Amount: ${formatCurrency(payment.amount)}
      Payment Method: ${payment.paymentMethod}
      
      For: Tuition Fee Payment
      
      Notes: ${payment.notes || 'N/A'}
      
      Received by: _____________
      
      Thank you for your payment!
    `;

        // Create and download as text file
        const blob = new Blob([receipt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${payment.reference}.txt`;
        a.click();
    };

    return (
        <div className="tuition-fees">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Tuition Fees Management</h2>
                <div className="btn-group">
                    <button
                        className={`btn btn-outline-primary ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`btn btn-outline-primary ${activeTab === 'structure' ? 'active' : ''}`}
                        onClick={() => setActiveTab('structure')}
                    >
                        Fee Structure
                    </button>
                    <button
                        className={`btn btn-outline-primary ${activeTab === 'collections' ? 'active' : ''}`}
                        onClick={() => setActiveTab('collections')}
                    >
                        Collections
                    </button>
                    <button
                        className={`btn btn-outline-primary ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        Reports
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="fee-overview">
                    {/* Summary Cards */}
                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card bg-primary text-white">
                                <div className="card-body">
                                    <h6>Total Fees</h6>
                                    <h3>{formatCurrency(summary.totalFees)}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-success text-white">
                                <div className="card-body">
                                    <h6>Collected</h6>
                                    <h3>{formatCurrency(summary.totalCollected)}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-warning text-white">
                                <div className="card-body">
                                    <h6>Outstanding</h6>
                                    <h3>{formatCurrency(summary.totalOutstanding)}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-info text-white">
                                <div className="card-body">
                                    <h6>Collection Rate</h6>
                                    <h3>{summary.collectionRate.toFixed(1)}%</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="row mb-4">
                        <div className="col-md-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search student..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={selectedGrade}
                                onChange={(e) => setSelectedGrade(e.target.value)}
                            >
                                <option value="">All Grades</option>
                                {Object.keys(feeStructures).map(grade => (
                                    <option key={grade} value={grade}>Grade {grade}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>
                    </div>

                    {/* Students Fee Table */}
                    <div className="card">
                        <div className="card-header">
                            <h5>Student Fee Status</h5>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Grade</th>
                                        <th>Tuition Fee</th>
                                        <th>Misc Fees</th>
                                        <th>Total</th>
                                        <th>Paid</th>
                                        <th>Balance</th>
                                        <th>Progress</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {studentsWithFees.map(student => (
                                        <tr key={student.id}>
                                            <td>
                                                {student.firstName} {student.lastName}
                                                <br />
                                                <small className="text-muted">ID: {student.id}</small>
                                            </td>
                                            <td>{student.grade}</td>
                                            <td>{formatCurrency(student.feeStructure.tuition)}</td>
                                            <td>{formatCurrency(student.feeStructure.misc)}</td>
                                            <td><strong>{formatCurrency(student.feeStructure.total)}</strong></td>
                                            <td className="text-success">{formatCurrency(student.paidAmount)}</td>
                                            <td className={student.balance > 0 ? 'text-danger' : ''}>
                                                <strong>{formatCurrency(student.balance)}</strong>
                                            </td>
                                            <td>
                                                <div className="progress" style={{ height: '20px' }}>
                                                    <div
                                                        className={`progress-bar ${
                                                            student.paymentStatus === 'paid' ? 'bg-success' :
                                                                student.paymentStatus === 'overdue' ? 'bg-danger' : 'bg-warning'
                                                        }`}
                                                        role="progressbar"
                                                        style={{ width: `${student.paymentProgress}%` }}
                                                        aria-valuenow={student.paymentProgress}
                                                        aria-valuemin="0"
                                                        aria-valuemax="100"
                                                    >
                                                        {student.paymentProgress.toFixed(0)}%
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                          <span className={`badge bg-${
                              student.paymentStatus === 'paid' ? 'success' :
                                  student.paymentStatus === 'overdue' ? 'danger' : 'warning'
                          }`}>
                            {student.paymentStatus}
                          </span>
                                                {student.isOverdue && (
                                                    <small className="d-block text-danger">
                                                        Overdue
                                                    </small>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-primary me-1"
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setShowPaymentModal(true);
                                                    }}
                                                    disabled={student.balance === 0}
                                                >
                                                    Record Payment
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-info"
                                                    onClick={() => {
                                                        const studentPayments = paymentHistory
                                                            .filter(p => p.studentId === student.id)
                                                            .sort((a, b) => new Date(b.date) - new Date(a.date));

                                                        alert(`
                                Payment History for ${student.firstName} ${student.lastName}
                                =================================
                                ${studentPayments.map(p =>
                                                            `${p.date}: ${formatCurrency(p.amount)} (${p.paymentMethod})`
                                                        ).join('\n')}
                                ${studentPayments.length === 0 ? 'No payments recorded' : ''}
                              `);
                                                    }}
                                                >
                                                    History
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'structure' && (
                <FeeStructureManager
                    feeStructures={feeStructures}
                    setFeeStructures={setFeeStructures}
                />
            )}

            {activeTab === 'collections' && (
                <FeeCollection
                    students={students}
                    feeStructures={feeStructures}
                    collections={collections}
                    setCollections={setCollections}
                    paymentHistory={paymentHistory}
                    setPaymentHistory={setPaymentHistory}
                />
            )}

            {activeTab === 'reports' && (
                <FeeReports
                    students={students}
                    feeStructures={feeStructures}
                    paymentHistory={paymentHistory}
                    getStudentBalance={getStudentBalance}
                />
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedStudent && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Record Payment</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setSelectedStudent(null);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Student:</strong> {selectedStudent.firstName} {selectedStudent.lastName}</p>
                                <p><strong>Grade:</strong> {selectedStudent.grade}</p>
                                <p><strong>Total Fee:</strong> {formatCurrency(selectedStudent.feeStructure.total)}</p>
                                <p><strong>Balance:</strong> {formatCurrency(selectedStudent.balance)}</p>

                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    handlePayment(
                                        selectedStudent,
                                        formData.get('amount'),
                                        formData.get('paymentMethod'),
                                        formData.get('notes')
                                    );
                                    setShowPaymentModal(false);
                                    setSelectedStudent(null);
                                }}>
                                    <div className="mb-3">
                                        <label className="form-label">Payment Amount</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="amount"
                                            max={selectedStudent.balance}
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Payment Method</label>
                                        <select className="form-select" name="paymentMethod" required>
                                            <option value="Cash">Cash</option>
                                            <option value="Check">Check</option>
                                            <option value="Bank Transfer">Bank Transfer</option>
                                            <option value="Credit Card">Credit Card</option>
                                            <option value="Online Payment">Online Payment</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Notes (Optional)</label>
                                        <textarea
                                            className="form-control"
                                            name="notes"
                                            rows="2"
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">
                                        Process Payment
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TuitionFees;