/**
 * Comprehensive Calculations Utility for Student Information System
 * Handles all financial calculations, fee structures, payment schedules,
 * late fees, discounts, and financial aid computations.
 */

// ==================== FORMATTING FUNCTIONS ====================

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '$0.00';
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

/**
 * Format percentage
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined || isNaN(value)) {
        return '0%';
    }
    return `${value.toFixed(decimals)}%`;
};

/**
 * Format number with commas
 * @param {number} num - The number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
    return num?.toLocaleString('en-US') || '0';
};

// ==================== BASIC FEE CALCULATIONS ====================

/**
 * Calculate total fees including all components
 * @param {Object} feeComponents - Object containing fee components
 * @returns {Object} Total and breakdown
 */
export const calculateTotalFees = (feeComponents) => {
    const {
        tuition = 0,
        misc = 0,
        laboratory = 0,
        library = 0,
        development = 0,
        otherFees = {}
    } = feeComponents;

    // Calculate base total
    const baseTotal = tuition + misc + laboratory + library + development;

    // Calculate other fees
    const otherTotal = Object.values(otherFees).reduce((sum, fee) => sum + (fee || 0), 0);

    // Grand total
    const total = baseTotal + otherTotal;

    return {
        tuition,
        misc,
        laboratory,
        library,
        development,
        otherFees,
        baseTotal,
        otherTotal,
        total,
        breakdown: {
            tuition: { amount: tuition, percentage: (tuition / total) * 100 || 0 },
            misc: { amount: misc, percentage: (misc / total) * 100 || 0 },
            laboratory: { amount: laboratory, percentage: (laboratory / total) * 100 || 0 },
            library: { amount: library, percentage: (library / total) * 100 || 0 },
            development: { amount: development, percentage: (development / total) * 100 || 0 },
            other: { amount: otherTotal, percentage: (otherTotal / total) * 100 || 0 }
        }
    };
};

/**
 * Calculate per-unit fees (for laboratory, special classes)
 * @param {number} units - Number of units
 * @param {number} ratePerUnit - Rate per unit
 * @param {Object} additionalFees - Additional fixed fees
 * @returns {Object} Calculated fees
 */
export const calculatePerUnitFees = (units, ratePerUnit, additionalFees = {}) => {
    const unitTotal = units * ratePerUnit;
    const additionalTotal = Object.values(additionalFees).reduce((sum, fee) => sum + fee, 0);

    return {
        units,
        ratePerUnit,
        unitTotal,
        additionalFees,
        additionalTotal,
        total: unitTotal + additionalTotal,
        breakdown: {
            unitCost: unitTotal,
            ...additionalFees
        }
    };
};

// ==================== PAYMENT SCHEDULE CALCULATIONS ====================

/**
 * Generate payment schedule based on term structure
 * @param {number} totalAmount - Total fee amount
 * @param {string} termType - 'semester', 'quarter', 'annual', 'custom'
 * @param {Object} options - Additional options
 * @returns {Array} Payment schedule
 */
export const generatePaymentSchedule = (totalAmount, termType, options = {}) => {
    const {
        startDate = new Date(),
        numberOfPayments,
        downPayment = 0,
        downPaymentDueDate = new Date(),
        customPaymentDates = [],
        includeInterest = false,
        interestRate = 0,
        paymentFrequency = 'monthly' // monthly, biweekly, weekly
    } = options;

    let schedule = [];
    let remainingBalance = totalAmount - downPayment;
    let paymentCount = numberOfPayments || getDefaultPaymentCount(termType);
    let paymentAmount = remainingBalance / paymentCount;

    // Add down payment if applicable
    if (downPayment > 0) {
        schedule.push({
            paymentNumber: 0,
            dueDate: downPaymentDueDate,
            amount: downPayment,
            principal: downPayment,
            interest: 0,
            remainingBalance: remainingBalance,
            status: 'pending',
            type: 'down_payment',
            description: 'Down Payment'
        });
    }

    // Calculate payment dates
    const paymentDates = customPaymentDates.length > 0
        ? customPaymentDates
        : generatePaymentDates(startDate, paymentCount, paymentFrequency);

    // Generate regular payments
    for (let i = 0; i < paymentCount; i++) {
        let payment = {
            paymentNumber: i + 1,
            dueDate: paymentDates[i],
            amount: paymentAmount,
            principal: paymentAmount,
            interest: 0,
            remainingBalance: remainingBalance - (paymentAmount * (i + 1)),
            status: 'pending',
            type: 'regular',
            description: `Payment ${i + 1} of ${paymentCount}`
        };

        // Add interest if applicable
        if (includeInterest && interestRate > 0) {
            const interest = calculateSimpleInterest(paymentAmount, interestRate, 1);
            payment.amount += interest;
            payment.interest = interest;
            payment.principal = paymentAmount;
        }

        schedule.push(payment);
    }

    // Calculate totals
    const totals = calculateScheduleTotals(schedule);

    return {
        schedule,
        totals,
        summary: {
            totalAmount,
            downPayment,
            numberOfPayments: paymentCount,
            paymentAmount: paymentAmount,
            totalPayments: totals.totalPayments,
            totalInterest: totals.totalInterest,
            firstPaymentDate: paymentDates[0],
            lastPaymentDate: paymentDates[paymentDates.length - 1]
        }
    };
};

/**
 * Get default number of payments based on term type
 * @param {string} termType
 * @returns {number}
 */
const getDefaultPaymentCount = (termType) => {
    const paymentCounts = {
        'semester': 4,  // 4 months
        'quarter': 3,   // 3 months
        'annual': 10,   // 10 months (excluding summer)
        'summer': 2,    // 2 months
        'short': 1      // 1 payment
    };
    return paymentCounts[termType] || 4;
};

/**
 * Generate payment dates based on frequency
 * @param {Date} startDate
 * @param {number} count
 * @param {string} frequency
 * @returns {Array} Array of dates
 */
const generatePaymentDates = (startDate, count, frequency) => {
    const dates = [];
    const date = new Date(startDate);

    for (let i = 0; i < count; i++) {
        const newDate = new Date(date);

        switch(frequency) {
            case 'weekly':
                newDate.setDate(date.getDate() + (i * 7));
                break;
            case 'biweekly':
                newDate.setDate(date.getDate() + (i * 14));
                break;
            case 'monthly':
            default:
                newDate.setMonth(date.getMonth() + i);
                break;
        }

        dates.push(newDate.toISOString().split('T')[0]);
    }

    return dates;
};

/**
 * Calculate totals for payment schedule
 * @param {Array} schedule
 * @returns {Object} Totals
 */
const calculateScheduleTotals = (schedule) => {
    return schedule.reduce((acc, payment) => {
        return {
            totalPayments: acc.totalPayments + payment.amount,
            totalPrincipal: acc.totalPrincipal + payment.principal,
            totalInterest: acc.totalInterest + payment.interest
        };
    }, { totalPayments: 0, totalPrincipal: 0, totalInterest: 0 });
};

// ==================== INTEREST AND LATE FEE CALCULATIONS ====================

/**
 * Calculate simple interest
 * @param {number} principal - Principal amount
 * @param {number} rate - Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @param {number} time - Time in years (or fraction of year)
 * @returns {number} Interest amount
 */
export const calculateSimpleInterest = (principal, rate, time) => {
    return principal * rate * time;
};

/**
 * Calculate compound interest
 * @param {number} principal - Principal amount
 * @param {number} rate - Annual interest rate (as decimal)
 * @param {number} time - Time in years
 * @param {number} compoundingFrequency - Times compounded per year
 * @returns {number} Compound interest
 */
export const calculateCompoundInterest = (principal, rate, time, compoundingFrequency = 12) => {
    const compoundFactor = Math.pow(1 + (rate / compoundingFrequency), compoundingFrequency * time);
    return principal * compoundFactor - principal;
};

/**
 * Calculate late fees based on days overdue
 * @param {number} balance - Outstanding balance
 * @param {number} daysOverdue - Number of days payment is late
 * @param {Object} options - Late fee options
 * @returns {Object} Late fee calculation
 */
export const calculateLateFee = (balance, daysOverdue, options = {}) => {
    const {
        gracePeriod = 15,
        fixedFee = 50,
        percentageRate = 0.02, // 2% per month
        maxFee = balance * 0.1, // Maximum 10% of balance
        compound = false
    } = options;

    // No fee if within grace period
    if (daysOverdue <= gracePeriod) {
        return {
            amount: 0,
            daysOverdue,
            gracePeriod,
            calculation: 'Within grace period'
        };
    }

    // Calculate overdue periods (monthly)
    const overdueMonths = Math.ceil((daysOverdue - gracePeriod) / 30);

    let fee = 0;

    if (compound) {
        // Compound interest calculation
        fee = balance * Math.pow(1 + percentageRate, overdueMonths) - balance;
    } else {
        // Simple interest calculation
        fee = balance * percentageRate * overdueMonths;
    }

    // Add fixed fee
    fee += fixedFee;

    // Apply maximum fee limit
    fee = Math.min(fee, maxFee);

    return {
        amount: fee,
        daysOverdue,
        overdueMonths,
        gracePeriod,
        fixedFee,
        percentageFee: fee - fixedFee,
        maxFee,
        calculation: compound ? 'Compound' : 'Simple',
        breakdown: {
            fixedFee,
            percentageBased: fee - fixedFee,
            total: fee
        }
    };
};

/**
 * Calculate daily overdue rate
 * @param {number} balance
 * @param {number} dailyRate
 * @param {number} days
 * @returns {number}
 */
export const calculateDailyOverdue = (balance, dailyRate = 0.001, days) => {
    return balance * dailyRate * days;
};

// ==================== DISCOUNT CALCULATIONS ====================

/**
 * Calculate applicable discounts
 * @param {Object} student - Student information
 * @param {number} baseAmount - Base fee amount
 * @param {Array} applicableDiscounts - List of available discounts
 * @returns {Object} Discount calculation
 */
export const calculateDiscounts = (student, baseAmount, applicableDiscounts = []) => {
    let totalDiscount = 0;
    const appliedDiscounts = [];

    applicableDiscounts.forEach(discount => {
        // Check if student is eligible for this discount
        if (isEligibleForDiscount(student, discount)) {
            let discountAmount = 0;

            switch(discount.type) {
                case 'percentage':
                    discountAmount = baseAmount * (discount.value / 100);
                    break;
                case 'fixed':
                    discountAmount = discount.value;
                    break;
                case 'tiered':
                    discountAmount = calculateTieredDiscount(baseAmount, discount.tiers);
                    break;
                default:
                    discountAmount = 0;
            }

            // Apply maximum limit if specified
            if (discount.maxAmount) {
                discountAmount = Math.min(discountAmount, discount.maxAmount);
            }

            appliedDiscounts.push({
                ...discount,
                amount: discountAmount,
                remainingAmount: baseAmount - totalDiscount - discountAmount
            });

            totalDiscount += discountAmount;
        }
    });

    return {
        totalDiscount,
        netAmount: baseAmount - totalDiscount,
        appliedDiscounts,
        savings: (totalDiscount / baseAmount) * 100
    };
};

/**
 * Check if student is eligible for a specific discount
 * @param {Object} student
 * @param {Object} discount
 * @returns {boolean}
 */
const isEligibleForDiscount = (student, discount) => {
    // Check discount criteria
    if (discount.criteria) {
        const { grade, status, siblingCount, academicStanding } = discount.criteria;

        if (grade && student.grade !== grade) return false;
        if (status && student.status !== status) return false;
        if (siblingCount && (student.siblings || 0) < siblingCount) return false;
        if (academicStanding && student.academicStanding !== academicStanding) return false;
    }

    return true;
};

/**
 * Calculate tiered discount
 * @param {number} amount
 * @param {Array} tiers
 * @returns {number}
 */
const calculateTieredDiscount = (amount, tiers) => {
    let discount = 0;

    tiers.sort((a, b) => a.threshold - b.threshold);

    for (let i = 0; i < tiers.length; i++) {
        const tier = tiers[i];
        const nextThreshold = tiers[i + 1]?.threshold || Infinity;

        if (amount > tier.threshold) {
            const tierAmount = Math.min(amount, nextThreshold) - tier.threshold;
            discount += tierAmount * (tier.rate / 100);
        }
    }

    return discount;
};

// ==================== FINANCIAL AID CALCULATIONS ====================

/**
 * Calculate financial aid eligibility and amount
 * @param {Object} student
 * @param {Object} familyInfo
 * @param {Array} aidPrograms
 * @returns {Object} Aid calculation
 */
export const calculateFinancialAid = (student, familyInfo, aidPrograms) => {
    const aidResults = [];

    aidPrograms.forEach(program => {
        const eligibility = checkAidEligibility(student, familyInfo, program);

        if (eligible) {
            let awardAmount = 0;

            switch(program.calculationType) {
                case 'need-based':
                    awardAmount = calculateNeedBasedAid(familyInfo, program);
                    break;
                case 'merit-based':
                    awardAmount = calculateMeritBasedAid(student, program);
                    break;
                case 'formula':
                    awardAmount = calculateFormulaAid(familyInfo, program.formula);
                    break;
                default:
                    awardAmount = program.defaultAmount || 0;
            }

            aidResults.push({
                programName: program.name,
                amount: awardAmount,
                type: program.type,
                renewable: program.renewable,
                conditions: program.conditions
            });
        }
    });

    const totalAid = aidResults.reduce((sum, aid) => sum + aid.amount, 0);

    return {
        totalAid,
        aidBreakdown: aidResults,
        remainingNeed: calculateFinancialNeed(student, familyInfo) - totalAid,
        summary: {
            programsApplied: aidResults.length,
            totalAwarded: totalAid,
            averageAward: totalAid / (aidResults.length || 1)
        }
    };
};

/**
 * Calculate financial need
 * @param {Object} student
 * @param {Object} familyInfo
 * @returns {number}
 */
export const calculateFinancialNeed = (student, familyInfo) => {
    const { tuition, fees, books, supplies, livingExpenses } = student.costOfAttendance || {};
    const { income, assets, householdSize, dependents } = familyInfo;

    // Cost of attendance
    const totalCost = (tuition || 0) + (fees || 0) + (books || 0) +
        (supplies || 0) + (livingExpenses || 0);

    // Expected Family Contribution (EFC)
    const efc = calculateEFC(familyInfo);

    // Financial need
    return Math.max(0, totalCost - efc);
};

/**
 * Calculate Expected Family Contribution (EFC)
 * @param {Object} familyInfo
 * @returns {number}
 */
const calculateEFC = (familyInfo) => {
    const {
        income,
        assets,
        householdSize,
        dependents,
        allowances = 0
    } = familyInfo;

    // Simplified EFC calculation
    const incomeContribution = (income - allowances) * 0.22; // 22% of available income
    const assetContribution = assets * 0.05; // 5% of assets

    // Adjust for household size
    const householdAdjustment = householdSize * 2000;

    return Math.max(0, incomeContribution + assetContribution - householdAdjustment);
};

// ==================== BALANCE AND PAYMENT CALCULATIONS ====================

/**
 * Calculate running balance for transactions
 * @param {Array} transactions - List of transactions
 * @returns {Array} Transactions with running balance
 */
export const calculateRunningBalance = (transactions) => {
    let balance = 0;

    return transactions
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(transaction => {
            if (transaction.type === 'debit' || transaction.type === 'charge') {
                balance += transaction.amount;
            } else {
                balance -= transaction.amount;
            }

            return {
                ...transaction,
                runningBalance: balance
            };
        });
};

/**
 * Calculate payment distribution (principal vs interest)
 * @param {number} paymentAmount
 * @param {number} outstandingBalance
 * @param {number} interestRate
 * @returns {Object}
 */
export const calculatePaymentDistribution = (paymentAmount, outstandingBalance, interestRate) => {
    const monthlyInterest = outstandingBalance * (interestRate / 12);
    let principalPaid = 0;
    let interestPaid = 0;

    if (paymentAmount >= monthlyInterest) {
        interestPaid = monthlyInterest;
        principalPaid = paymentAmount - monthlyInterest;
    } else {
        interestPaid = paymentAmount;
        principalPaid = 0;
    }

    return {
        paymentAmount,
        interestPaid,
        principalPaid,
        remainingBalance: outstandingBalance - principalPaid,
        interestRate,
        monthlyInterest
    };
};

/**
 * Calculate payoff timeline
 * @param {number} balance
 * @param {number} monthlyPayment
 * @param {number} interestRate
 * @returns {Object}
 */
export const calculatePayoffTimeline = (balance, monthlyPayment, interestRate) => {
    let remainingBalance = balance;
    let months = 0;
    let totalInterest = 0;
    const schedule = [];

    while (remainingBalance > 0 && months < 360) { // Max 30 years
        const monthlyInterest = remainingBalance * (interestRate / 12);
        let principalPaid = monthlyPayment - monthlyInterest;

        if (principalPaid <= 0) {
            // Payment too low to cover interest
            return {
                error: 'Payment too low to cover interest',
                months: Infinity,
                totalInterest: Infinity
            };
        }

        if (principalPaid > remainingBalance) {
            principalPaid = remainingBalance;
        }

        totalInterest += monthlyInterest;
        remainingBalance -= principalPaid;
        months++;

        schedule.push({
            month: months,
            payment: monthlyPayment,
            interestPaid: monthlyInterest,
            principalPaid,
            remainingBalance
        });
    }

    return {
        months,
        totalPayments: monthlyPayment * months,
        totalInterest,
        payoffDate: addMonths(new Date(), months),
        schedule
    };
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Add months to a date
 * @param {Date} date
 * @param {number} months
 * @returns {Date}
 */
const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};

/**
 * Calculate days between two dates
 * @param {string|Date} date1
 * @param {string|Date} date2
 * @returns {number}
 */
export const daysBetween = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate weighted average
 * @param {Array} items - Items with value and weight
 * @returns {number}
 */
export const calculateWeightedAverage = (items) => {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const weightedSum = items.reduce((sum, item) => sum + (item.value * item.weight), 0);
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
};

/**
 * Calculate statistics for a set of numbers
 * @param {Array} numbers
 * @returns {Object}
 */
export const calculateStatistics = (numbers) => {
    const validNumbers = numbers.filter(n => !isNaN(n) && n !== null);

    if (validNumbers.length === 0) {
        return {
            count: 0,
            sum: 0,
            average: 0,
            median: 0,
            min: 0,
            max: 0,
            standardDeviation: 0
        };
    }

    const sum = validNumbers.reduce((a, b) => a + b, 0);
    const average = sum / validNumbers.length;
    const sorted = [...validNumbers].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    // Standard deviation
    const squareDiffs = validNumbers.map(value => Math.pow(value - average, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / validNumbers.length;
    const standardDeviation = Math.sqrt(avgSquareDiff);

    return {
        count: validNumbers.length,
        sum,
        average,
        median,
        min,
        max,
        standardDeviation
    };
};

// ==================== REPORT GENERATION FUNCTIONS ====================

/**
 * Generate fee summary report data
 * @param {Array} students
 * @param {Object} feeStructures
 * @param {Function} getBalance
 * @returns {Object}
 */
export const generateFeeSummary = (students, feeStructures, getBalance) => {
    const summary = {
        byGrade: {},
        totals: {
            totalFees: 0,
            totalCollected: 0,
            totalOutstanding: 0,
            studentCount: 0
        }
    };

    students.forEach(student => {
        if (student.status !== 'active') return;

        const grade = student.grade;
        const fees = feeStructures[grade];
        const balance = getBalance(student.id);
        const totalFee = fees?.total || 0;
        const paid = totalFee - balance;

        if (!summary.byGrade[grade]) {
            summary.byGrade[grade] = {
                studentCount: 0,
                totalFees: 0,
                collected: 0,
                outstanding: 0,
                collectionRate: 0
            };
        }

        summary.byGrade[grade].studentCount++;
        summary.byGrade[grade].totalFees += totalFee;
        summary.byGrade[grade].collected += paid;
        summary.byGrade[grade].outstanding += balance;

        summary.totals.totalFees += totalFee;
        summary.totals.totalCollected += paid;
        summary.totals.totalOutstanding += balance;
        summary.totals.studentCount++;
    });

    // Calculate collection rates
    Object.keys(summary.byGrade).forEach(grade => {
        const gradeData = summary.byGrade[grade];
        gradeData.collectionRate = gradeData.totalFees > 0
            ? (gradeData.collected / gradeData.totalFees) * 100
            : 0;
    });

    summary.totals.collectionRate = summary.totals.totalFees > 0
        ? (summary.totals.totalCollected / summary.totals.totalFees) * 100
        : 0;

    return summary;
};

/**
 * Calculate payment metrics
 * @param {Array} payments
 * @returns {Object}
 */
export const calculatePaymentMetrics = (payments) => {
    const onTime = payments.filter(p => !p.late).length;
    const late = payments.filter(p => p.late).length;
    const totalPayments = payments.length;

    return {
        totalPayments,
        onTime,
        late,
        onTimeRate: totalPayments > 0 ? (onTime / totalPayments) * 100 : 0,
        lateRate: totalPayments > 0 ? (late / totalPayments) * 100 : 0,
        averagePayment: payments.reduce((sum, p) => sum + p.amount, 0) / totalPayments || 0,
        totalCollected: payments.reduce((sum, p) => sum + p.amount, 0)
    };
};

// Export all functions as a single object for convenience
export default {
    formatCurrency,
    formatPercentage,
    formatNumber,
    calculateTotalFees,
    calculatePerUnitFees,
    generatePaymentSchedule,
    calculateSimpleInterest,
    calculateCompoundInterest,
    calculateLateFee,
    calculateDailyOverdue,
    calculateDiscounts,
    calculateFinancialAid,
    calculateFinancialNeed,
    calculateRunningBalance,
    calculatePaymentDistribution,
    calculatePayoffTimeline,
    daysBetween,
    calculateWeightedAverage,
    calculateStatistics,
    generateFeeSummary,
    calculatePaymentMetrics
};