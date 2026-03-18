import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateStudentListPDF = (students) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Student List Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["ID", "Name", "Grade", "Status", "Balance"];
    const tableRows = [];

    students.forEach(student => {
        const studentData = [
            student.id,
            `${student.firstName} ${student.lastName}`,
            student.grade,
            student.status,
            `$${student.balance?.toFixed(2) || '0.00'}`
        ];
        tableRows.push(studentData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'striped',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save('student-list.pdf');
};

export const generateAgingReportPDF = (agingData) => {
    const doc = new jsPDF('landscape');

    doc.setFontSize(18);
    doc.text('Accounts Receivable Aging Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`As of: ${new Date().toLocaleDateString()}`, 14, 30);

    let yPos = 40;
    let totalOverall = 0;

    Object.entries(agingData).forEach(([period, students]) => {
        if (students.length === 0) return;

        doc.setFontSize(14);
        doc.text(`${period} Days`, 14, yPos);
        yPos += 10;

        const tableColumn = ["Student ID", "Name", "Grade", "Balance", "Days Overdue"];
        const tableRows = [];
        let periodTotal = 0;

        students.forEach(student => {
            periodTotal += student.balance;
            tableRows.push([
                student.id,
                `${student.firstName} ${student.lastName}`,
                student.grade,
                `$${student.balance.toFixed(2)}`,
                student.days || 'N/A'
            ]);
        });

        totalOverall += periodTotal;

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: yPos,
            theme: 'striped',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [52, 152, 219] },
            margin: { left: 14 }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // Add period total
        doc.setFontSize(10);
        doc.text(`Period Total: $${periodTotal.toFixed(2)}`, 14, yPos);
        yPos += 15;
    });

    // Add grand total
    doc.setFontSize(12);
    doc.text(`GRAND TOTAL: $${totalOverall.toFixed(2)}`, 14, yPos + 10);

    doc.save('aging-report.pdf');
};

export const generateStatementOfAccountPDF = (student, transactions, balance) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Statement of Account', 14, 22);
    doc.setFontSize(12);
    doc.text(`${student.firstName} ${student.lastName}`, 14, 32);
    doc.setFontSize(10);
    doc.text(`Student ID: ${student.id}`, 14, 38);
    doc.text(`Grade: ${student.grade}`, 14, 44);
    doc.text(`Status: ${student.status}`, 14, 50);
    doc.text(`Current Balance: $${balance.toFixed(2)}`, 14, 56);

    const tableColumn = ["Date", "Description", "Type", "Amount", "Running Balance"];
    const tableRows = [];

    let runningBalance = 0;
    transactions.forEach(t => {
        runningBalance += t.type === 'debit' ? t.amount : -t.amount;
        tableRows.push([
            t.date,
            t.description,
            t.type === 'debit' ? 'Charge' : 'Payment',
            `$${t.amount.toFixed(2)}`,
            `$${runningBalance.toFixed(2)}`
        ]);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [46, 204, 113] }
    });

    doc.save(`SOA-${student.id}.pdf`);
};