export const mockStudents = [
    {
        id: '1001',
        firstName: 'John',
        lastName: 'Doe',
        grade: '10',
        status: 'active',
        dateEnrolled: '2024-01-15'
    },
    {
        id: '1002',
        firstName: 'Jane',
        lastName: 'Smith',
        grade: '12',
        status: 'active',
        dateEnrolled: '2024-01-10'
    },
    {
        id: '1003',
        firstName: 'Mike',
        lastName: 'Johnson',
        grade: '8',
        status: 'active',
        dateEnrolled: '2024-01-20'
    },
    {
        id: '1004',
        firstName: 'Sarah',
        lastName: 'Williams',
        grade: '11',
        status: 'inactive',
        dateEnrolled: '2023-09-05'
    },
    {
        id: '1005',
        firstName: 'David',
        lastName: 'Brown',
        grade: '9',
        status: 'active',
        dateEnrolled: '2024-02-01'
    }
];

export const mockTransactions = [
    {
        id: 't1',
        studentId: '1001',
        date: '2024-01-15',
        type: 'debit',
        amount: 5000,
        description: 'Tuition Fee - Semester 2'
    },
    {
        id: 't2',
        studentId: '1001',
        date: '2024-01-20',
        type: 'credit',
        amount: 2000,
        description: 'Partial Payment'
    },
    {
        id: 't3',
        studentId: '1002',
        date: '2024-01-10',
        type: 'debit',
        amount: 5500,
        description: 'Tuition Fee - Semester 2'
    },
    {
        id: 't4',
        studentId: '1003',
        date: '2024-01-20',
        type: 'debit',
        amount: 4500,
        description: 'Tuition Fee - Semester 2'
    },
    {
        id: 't5',
        studentId: '1004',
        date: '2023-09-05',
        type: 'debit',
        amount: 5200,
        description: 'Tuition Fee - Semester 1'
    },
    {
        id: 't6',
        studentId: '1005',
        date: '2024-02-01',
        type: 'debit',
        amount: 4800,
        description: 'Tuition Fee - Semester 2'
    },
    {
        id: 't7',
        studentId: '1005',
        date: '2024-02-15',
        type: 'credit',
        amount: 1000,
        description: 'Down Payment'
    }
];