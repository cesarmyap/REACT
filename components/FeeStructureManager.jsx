import React, { useState } from 'react';
import { formatCurrency } from '../utils/calculations.js';

const FeeStructureManager = ({ feeStructures, setFeeStructures }) => {
    const [editingGrade, setEditingGrade] = useState(null);
    const [editForm, setEditForm] = useState({ tuition: 0, misc: 0 });

    const handleEdit = (grade) => {
        setEditingGrade(grade);
        setEditForm({
            tuition: feeStructures[grade].tuition,
            misc: feeStructures[grade].misc
        });
    };

    const handleSave = (grade) => {
        setFeeStructures({
            ...feeStructures,
            [grade]: {
                tuition: parseFloat(editForm.tuition),
                misc: parseFloat(editForm.misc),
                total: parseFloat(editForm.tuition) + parseFloat(editForm.misc)
            }
        });
        setEditingGrade(null);
    };

    const handleBulkUpdate = (percentage) => {
        if (!window.confirm(`Apply ${percentage}% increase to all grade levels?`)) return;

        const updated = {};
        Object.keys(feeStructures).forEach(grade => {
            const current = feeStructures[grade];
            updated[grade] = {
                tuition: current.tuition * (1 + percentage/100),
                misc: current.misc * (1 + percentage/100),
                total: (current.tuition + current.misc) * (1 + percentage/100)
            };
        });
        setFeeStructures(updated);
    };

    return (
        <div className="fee-structure-manager">
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5>Fee Structure by Grade Level</h5>
                    <div>
                        <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleBulkUpdate(5)}
                        >
                            +5% Increase
                        </button>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleBulkUpdate(10)}
                        >
                            +10% Increase
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Grade</th>
                            <th>Tuition Fee</th>
                            <th>Miscellaneous</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Object.entries(feeStructures).map(([grade, fees]) => (
                            <tr key={grade}>
                                <td><strong>Grade {grade}</strong></td>
                                {editingGrade === grade ? (
                                    <>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                value={editForm.tuition}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    tuition: e.target.value
                                                })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                value={editForm.misc}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    misc: e.target.value
                                                })}
                                            />
                                        </td>
                                        <td>
                                            {formatCurrency(
                                                parseFloat(editForm.tuition) + parseFloat(editForm.misc)
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-success me-1"
                                                onClick={() => handleSave(grade)}
                                            >
                                                Save
                                            </button>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => setEditingGrade(null)}
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{formatCurrency(fees.tuition)}</td>
                                        <td>{formatCurrency(fees.misc)}</td>
                                        <td><strong>{formatCurrency(fees.total)}</strong></td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleEdit(grade)}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FeeStructureManager;