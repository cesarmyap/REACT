import React, { createContext, useState, useContext } from 'react';
import { mockStudents, mockTransactions } from '../data/mockData';

const StudentContext = createContext();

export const useStudents = () => useContext(StudentContext);

export const StudentProvider = ({ children }) => {
    const [students, setStudents] = useState(mockStudents);
    const [transactions, setTransactions] = useState(mockTransactions);
    const [grades, setGrades] = useState({});

    const addStudent = (student) => {
        const newStudent = {
            ...student,
            id: Date.now().toString(),
            dateEnrolled: new Date().toISOString().split('T')[0]
        };
        setStudents([...students, newStudent]);
    };

    const updateStudent = (id, updatedData) => {
        setStudents(students.map(s => s.id === id ? { ...s, ...updatedData } : s));
    };

    const deleteStudent = (id) => {
        setStudents(students.filter(s => s.id !== id));
    };

    const addTransaction = (transaction) => {
        const newTransaction = {
            ...transaction,
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0]
        };
        setTransactions([...transactions, newTransaction]);
    };

    const getStudentTransactions = (studentId) => {
        return transactions.filter(t => t.studentId === studentId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const getStudentBalance = (studentId) => {
        const studentTransactions = getStudentTransactions(studentId);
        return studentTransactions.reduce((acc, t) => {
            return t.type === 'debit' ? acc + t.amount : acc - t.amount;
        }, 0);
    };

    const getAgingReport = () => {
        const today = new Date();
        const aging = {
            current: [],
            '1-30': [],
            '31-60': [],
            '61-90': [],
            '91-120': [],
            '120+': []
        };

        students.forEach(student => {
            const balance = getStudentBalance(student.id);
            if (balance <= 0) return;

            const lastTransaction = transactions
                .filter(t => t.studentId === student.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

            if (!lastTransaction) {
                aging.current.push({ ...student, balance });
                return;
            }

            const daysDiff = Math.floor((today - new Date(lastTransaction.date)) / (1000 * 60 * 60 * 24));

            if (daysDiff <= 30) aging['1-30'].push({ ...student, balance, days: daysDiff });
            else if (daysDiff <= 60) aging['31-60'].push({ ...student, balance, days: daysDiff });
            else if (daysDiff <= 90) aging['61-90'].push({ ...student, balance, days: daysDiff });
            else if (daysDiff <= 120) aging['91-120'].push({ ...student, balance, days: daysDiff });
            else aging['120+'].push({ ...student, balance, days: daysDiff });
        });

        return aging;
    };

    return (
        <StudentContext.Provider value={{
            students,
            transactions,
            grades,
            addStudent,
            updateStudent,
            deleteStudent,
            addTransaction,
            getStudentTransactions,
            getStudentBalance,
            getAgingReport
        }}>
            {children}
        </StudentContext.Provider>
    );
};