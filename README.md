# REACT

Student Information System (SIS)

A comprehensive React application for managing student records, tuition fees, and financial transactions with PDF reporting.

Key Features

- Student Management - Add, edit, delete students with grade tracking
- Tuition Fees - Grade-based fee structures with multiple components
- Financial Ledger - Track charges, payments, and running balances
- Aging Reports - 30/60/90/120+ days accounts receivable
- PDF Reports - Generate statements, receipts, and aging reports
- Dashboard - Real-time overview of key metrics

Tech Stack

- React 18 (Hooks, Context API)
- React Router
- Bootstrap 5
- jsPDF (PDF generation)
- localStorage (data persistence)

Core Modules

| Module               | Description                      |
|----------------------|----------------------------------|
| Dashboard            | KPIs, recent activity, summaries |
| Student              | CRUD operations, search, filter  |
| Ledger               | Transactions, running balance    |
| Tuition Fees         | Grade-based fee structure        |
| Aging Report         | 30/60/90/120+ day buckets        |
| Statement of Account | Individual student statement     |

Data Flow

StudentContext (Global State)
    ├── Students
    ├── Transactions
    ├── Fee Structures
    └── Collections


Data Persistence

All data auto-saves to browser's localStorage. No database required.

PDF Reports

- Student Lists
- Statements of Account
- Aging Reports
- Payment Receipts
- Collection Summaries

Quick Usage

1. Setup → Configure fee structures by grade
2. Add → Enter student information
3. Track → Record charges and payments
4. Monitor → Check aging reports
5. Export → Generate PDF reports
