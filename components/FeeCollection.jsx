import React, { useState } from 'react';
import { formatCurrency } from '../utils/calculations';

const FeeCollection = ({
                           students,
                           feeStructures,
                           collections,
                           setCollections,
                           paymentHistory,
                           setPaymentHistory
                       }) => {
    const [collectionDate, setCollectionDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [selectedStudent, setSelectedStudent] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [notes, setNotes] = useState('');

    // Get today's collections
    const todaysCollections = collections.filter(c => c.date === collectionDate);
    const todaysTotal = todaysCollections.reduce((sum, c) => sum + c.amount, 0);

    const handleAddCollection = (e) => {
        e.preventDefault();

        const student = students.find(s => s.id === selectedStudent);
        if (!student) return;

        const newCollection = {
            id: Date.now().toString(),
            date: collectionDate,
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            grade: student.grade,
            amount: parseFloat(amount),
            paymentMethod,
            notes,
            reference: `COL-${Date.now()}`
        };

        setCollections([...collections, newCollection]);

        // Also add to payment history
        setPaymentHistory([{
            ...newCollection,
            id: Date.now().toString() + '-hist'
        }, ...paymentHistory]);

        // Reset form
        setSelectedStudent('');
        setAmount('');
        setNotes('');

        alert('Collection recorded successfully!');
    };

    return (
        <div className="fee-collection">
            <div className="row">
                <div className="col-md-5">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5>Record New Collection</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleAddCollection}>
                                <div className="mb-3">
                                    <label className="form-label">Collection Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={collectionDate}
                                        onChange={(e) => setCollectionDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Select Student</label>
                                    <select
                                        className="form-select"
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                        required
                                    >
                                        <option value="">Choose student...</option>
                                        {students
                                            .filter(s => s.status === 'active')
                                            .map(student => (
                                                <option key={student.id} value={student.id}>
                                                    {student.firstName} {student.lastName} - Grade {student.grade}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                {selectedStudent && (
                                    <div className="mb-3">
                                        <label className="form-label">Fee Details</label>
                                        <div className="bg-light p-2 rounded">
                                            {(() => {
                                                const student = students.find(s => s.id === selectedStudent);
                                                const fees = feeStructures[student.grade];
                                                return (
                                                    <>
                                                        <small>Tuition: {formatCurrency(fees.tuition)}</small><br />
                                                        <small>Misc: {formatCurrency(fees.misc)}</small><br />
                                                        <strong>Total: {formatCurrency(fees.total)}</strong>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label">Amount</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Payment Method</label>
                                    <select
                                        className="form-select"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Check">Check</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="Online Payment">Online Payment</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Notes</label>
                                    <textarea
                                        className="form-control"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows="2"
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn btn-primary w-100">
                                    Record Collection
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-7">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5>Collections for {collectionDate}</h5>
                            <span className="badge bg-success">
                Total: {formatCurrency(todaysTotal)}
              </span>
                        </div>
                        <div className="card-body">
                            {todaysCollections.length === 0 ? (
                                <p className="text-muted">No collections recorded for this date.</p>
                            ) : (
                                <table className="table">
                                    <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Student</th>
                                        <th>Grade</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Reference</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {todaysCollections.map(collection => (
                                        <tr key={collection.id}>
                                            <td>{new Date().toLocaleTimeString()}</td>
                                            <td>{collection.studentName}</td>
                                            <td>{collection.grade}</td>
                                            <td>{formatCurrency(collection.amount)}</td>
                                            <td>{collection.paymentMethod}</td>
                                            <td>
                                                <small>{collection.reference}</small>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Collections */}
            <div className="card mt-4">
                <div className="card-header">
                    <h5>Recent Collections (Last 7 Days)</h5>
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Student</th>
                            <th>Grade</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Reference</th>
                        </tr>
                        </thead>
                        <tbody>
                        {collections
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice(0, 10)
                            .map(collection => (
                                <tr key={collection.id}>
                                    <td>{collection.date}</td>
                                    <td>{collection.studentName}</td>
                                    <td>{collection.grade}</td>
                                    <td>{formatCurrency(collection.amount)}</td>
                                    <td>{collection.paymentMethod}</td>
                                    <td>
                                        <small>{collection.reference}</small>
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

export default FeeCollection;