import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';

const Ledger = ({ student, onBack }) => {
    const { getStudentTransactions, addTransaction, getStudentBalance } = useStudents();
    const [transactionType, setTransactionType] = useState('debit');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    if (!student) {
        return <div>Please select a student</div>;
    }

    const transactions = getStudentTransactions(student.id);
    const currentBalance = getStudentBalance(student.id);

    const handleSubmit = (e) => {
        e.preventDefault();

        addTransaction({
            studentId: student.id,
            type: transactionType,
            amount: parseFloat(amount),
            description,
            date: new Date().toISOString().split('T')[0]
        });

        setAmount('');
        setDescription('');
    };

    return (
        <div className="ledger">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Student Ledger</h2>
                <button className="btn btn-secondary" onClick={onBack}>
                    ← Back to List
                </button>
            </div>

            <div className="row">
                <div className="col-md-4">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5>Student Info</h5>
                        </div>
                        <div className="card-body">
                            <p><strong>Name:</strong> {student.firstName} {student.lastName}</p>
                            <p><strong>Grade:</strong> {student.grade}</p>
                            <p><strong>Status:</strong> {student.status}</p>
                            <h4 className="text-primary">
                                Balance: ${currentBalance.toFixed(2)}
                            </h4>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h5>Add Transaction</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Type</label>
                                    <select
                                        className="form-select"
                                        value={transactionType}
                                        onChange={(e) => setTransactionType(e.target.value)}
                                    >
                                        <option value="debit">Charge (Debit)</option>
                                        <option value="credit">Payment (Credit)</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Amount</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">
                                    Add Transaction
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            <h5>Transaction History</h5>
                        </div>
                        <div className="card-body">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Running Balance</th>
                                </tr>
                                </thead>
                                <tbody>
                                {transactions.map((t, index, arr) => {
                                    // Calculate running balance
                                    const runningBalance = arr
                                        .slice(0, index + 1)
                                        .reduce((acc, curr) => {
                                            return curr.type === 'debit'
                                                ? acc + curr.amount
                                                : acc - curr.amount;
                                        }, 0);

                                    return (
                                        <tr key={t.id}>
                                            <td>{t.date}</td>
                                            <td>{t.description}</td>
                                            <td>
                          <span className={`badge bg-${t.type === 'debit' ? 'warning' : 'success'}`}>
                            {t.type}
                          </span>
                                            </td>
                                            <td>${t.amount.toFixed(2)}</td>
                                            <td>${runningBalance.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ledger;