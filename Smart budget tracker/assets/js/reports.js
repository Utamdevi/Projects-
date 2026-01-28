// assets/js/reports.js

document.addEventListener("DOMContentLoaded", () => {
    initReports();
    setupEventListeners();
    
});

let transactions = [];
let incomeChart = null;
let trendChart = null;
let currentCurrency = "PKR";

function initReports() {
    // 1. Load Data
    transactions = BudgetUtils.loadFromLocalStorage("transactions") || [];
    const settings = BudgetUtils.loadFromLocalStorage("settings");
    currentCurrency = settings ? (settings.currency || "PKR") : "PKR";

    // 2. Set Default Dates (Current Month)
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    // Set custom date inputs (hidden by default)
    const startInput = document.getElementById("startDate");
    const endInput = document.getElementById("endDate");
    if(startInput) startInput.valueAsDate = firstDay;
    if(endInput) endInput.valueAsDate = lastDay;

    // 3. Generate Report (Silent Mode: No Alert)
    generateReport(true); 
}

function setupEventListeners() {
    // Report Period Selector
    const periodSelect = document.getElementById("reportPeriod");
    if (periodSelect) {
        periodSelect.addEventListener("change", (e) => {
            const customDates = document.getElementById("customDates");
            if(customDates) {
                customDates.style.display = e.target.value === "custom" ? "flex" : "none";
            }
        });
    }

    // Generate Button (Manual Mode: Shows Alert)
    const generateBtn = document.getElementById("generateReportBtn");
    if (generateBtn) {
        generateBtn.addEventListener("click", () => {
            generateReport(false); 
        });
    }

    // Trend Type Toggle
    const trendSelect = document.getElementById("trendType");
    if (trendSelect) {
        trendSelect.addEventListener("change", () => {
            updateTrendChart();
        });
    }
    
    // Refresh Insights
    const refreshBtn = document.getElementById("refreshInsightsBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            generateInsights();
            BudgetUtils.showNotification("Insights refreshed", "info");
        });
    }
}

// ============================================
// CORE REPORT GENERATION
// ============================================

function generateReport(silent = true) {
    // 1. Filter Data based on selection
    const filtered = filterTransactions();
    
    // 2. Update Charts
    updateIncomeExpenseChart(filtered);
    updateTrendChart(filtered);
    
    // 3. Update Text Metrics
    updateMetrics(filtered);
    updateBudgetPerformance(filtered);
    generateInsights(filtered);

    // 4. Notification (Only if NOT silent)
    if (!silent) {
        // Using a standard alert or custom notification if available
        if (typeof BudgetUtils.showNotification === 'function') {
            BudgetUtils.showNotification("Report generated successfully", "success");
        } else {
            alert("Report generated successfully!");
        }
    }
}

function filterTransactions() {
    const period = document.getElementById("reportPeriod").value;
    const now = new Date();
    let startDate, endDate;

    switch (period) {
        case 'current-month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
        case 'last-month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        case 'last-3-months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            endDate = now;
            break;
        case 'last-6-months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            endDate = now;
            break;
        case 'current-year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
            break;
        case 'last-year':
            startDate = new Date(now.getFullYear() - 1, 0, 1);
            endDate = new Date(now.getFullYear() - 1, 11, 31);
            break;
        case 'custom':
            startDate = new Date(document.getElementById("startDate").value);
            endDate = new Date(document.getElementById("endDate").value);
            break;
        default:
            startDate = new Date(0); // Beginning of time
            endDate = now;
    }

    // Update Label
    const periodLabel = document.getElementById("incomeExpensesPeriod");
    if(periodLabel) periodLabel.textContent = period.replace(/-/g, ' ').toUpperCase();

    return transactions.filter(t => {
        const d = new Date(t.date);
        return d >= startDate && d <= endDate;
    });
}

// ============================================
// CHARTS & VISUALS
// ============================================

function updateIncomeExpenseChart(data) {
    const ctx = document.getElementById("incomeExpensesChart");
    if (!ctx) return;

    const income = data.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
    const expense = data.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

    if (incomeChart) incomeChart.destroy();

    incomeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                label: 'Amount',
                data: [income, expense],
                backgroundColor: ['#27ae60', '#e74c3c'],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function updateTrendChart(data = null) {
    // If data is null, re-filter (useful for toggle button)
    if(!data) data = filterTransactions();

    const ctx = document.getElementById("trendChart");
    if (!ctx) return;
    
    // Group by Date
    const grouped = {};
    data.forEach(t => {
        const d = t.date; // ISO string YYYY-MM-DD
        if (!grouped[d]) grouped[d] = { income: 0, expense: 0 };
        if (t.type === 'income') grouped[d].income += t.amount;
        else grouped[d].expense += t.amount;
    });

    const labels = Object.keys(grouped).sort();
    
    // Determine what to show based on dropdown
    const type = document.getElementById("trendType").value; // income, expenses, balance
    let dataset = [];
    let color = '';

    if (type === 'income') {
        dataset = labels.map(d => grouped[d].income);
        color = '#27ae60';
    } else if (type === 'expenses') {
        dataset = labels.map(d => grouped[d].expense);
        color = '#e74c3c';
    } else {
        // Balance
        dataset = labels.map(d => grouped[d].income - grouped[d].expense);
        color = '#3498db';
    }

    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(d => BudgetUtils.formatDate(d)),
            datasets: [{
                label: type.charAt(0).toUpperCase() + type.slice(1),
                data: dataset,
                borderColor: color,
                backgroundColor: color + '20', // transparent version
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function updateMetrics(data) {
    const income = data.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
    const expense = data.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
    const savings = income - expense;

    // We can't calculate true "Monthly Average" without more logic, 
    // so we will treat the selection as the period total for now.
    
    const incEl = document.getElementById("avgMonthlyIncome");
    const expEl = document.getElementById("avgMonthlyExpenses");
    const savEl = document.getElementById("monthlySavings");

    if(incEl) incEl.textContent = BudgetUtils.formatCurrency(income, currentCurrency);
    if(expEl) expEl.textContent = BudgetUtils.formatCurrency(expense, currentCurrency);
    if(savEl) savEl.textContent = BudgetUtils.formatCurrency(savings, currentCurrency);

    // Top Category
    const totals = {};
    data.filter(t => t.type === 'expense').forEach(t => {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    
    let topCat = "None";
    let topAmt = 0;
    for (const [cat, amt] of Object.entries(totals)) {
        if (amt > topAmt) {
            topAmt = amt;
            topCat = cat;
        }
    }
    
    const catEl = document.getElementById("topCategory");
    if(catEl) {
        catEl.textContent = BudgetUtils.getCategoryInfo(topCat).name;
        // Update the subtitle
        const percent = expense > 0 ? Math.round((topAmt / expense) * 100) : 0;
        const sub = catEl.nextElementSibling;
        if(sub) sub.textContent = `${percent}% of total expenses`;
    }
}

function updateBudgetPerformance(data) {
    // Determine total income to set a "Soft Budget"
    const income = data.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
    const expense = data.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
    
    // Avoid division by zero
    const budgetLimit = income > 0 ? income : 1; 
    const percentUsed = Math.min(Math.round((expense / budgetLimit) * 100), 100);

    const perfEl = document.getElementById("budgetPerformance");
    if(perfEl) perfEl.textContent = `${percentUsed}%`;

    const usedEl = document.getElementById("budgetUsed");
    if(usedEl) usedEl.textContent = `${percentUsed}%`;

    const barFill = document.querySelector(".performance-fill");
    if(barFill) barFill.style.width = `${percentUsed}%`;
    
    // Savings Rate
    const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
    const saveEl = document.getElementById("savingsRate");
    if(saveEl) saveEl.textContent = `${savingsRate}%`;
}

function generateInsights(data = null) {
    if(!data) data = filterTransactions();
    
    const income = data.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
    const expense = data.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
    const grid = document.getElementById("insightsGrid");
    
    if(!grid) return;

    let insights = [];

    // Logic 1: Spending Check
    if (expense > income) {
        insights.push({
            icon: "fa-exclamation-triangle",
            type: "danger",
            title: "Overspending Alert",
            desc: "You have spent more than you earned this period."
        });
    } else if (expense < (income * 0.5)) {
        insights.push({
            icon: "fa-thumbs-up",
            type: "success",
            title: "Great Saver",
            desc: "You saved more than 50% of your income!"
        });
    } else {
        insights.push({
            icon: "fa-check-circle",
            type: "info",
            title: "Balanced Budget",
            desc: "Your spending is within sustainable limits."
        });
    }

    // Logic 2: Category Check
    const totals = {};
    data.filter(t => t.type === 'expense').forEach(t => totals[t.category] = (totals[t.category] || 0) + t.amount);
    if (totals['entertainment'] > totals['food']) {
        insights.push({
            icon: "fa-gamepad",
            type: "warning",
            title: "High Entertainment Cost",
            desc: "You spent more on fun than food. Check your priorities?"
        });
    }

    // Render
    grid.innerHTML = insights.map(i => `
        <div class="insight-card ${i.type}" style="display:flex; align-items:center; gap:10px; padding:15px; border-radius:10px; border-left:4px solid; background:white; margin-bottom:10px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
            <div class="insight-icon" style="font-size:1.5rem;"><i class="fas ${i.icon}"></i></div>
            <div class="insight-content">
                <h4 style="margin:0;">${i.title}</h4>
                <p style="margin:0; font-size:0.9rem; color:#666;">${i.desc}</p>
            </div>
        </div>
    `).join("");
    
    if(insights.length === 0) {
         grid.innerHTML = `<p style="color:#888;">Add more transactions to generate insights.</p>`;
    }
}

// ============================================
// EXPORT FUNCTIONS (GLOBAL)
// ============================================

window.exportReport = function(format) {
    if (format === 'print') {
        window.print();
        return;
    }

    const element = document.querySelector('main'); // Capture the main content area

    if (format === 'pdf') {
        if (typeof html2pdf === 'undefined') {
            alert("PDF Library not loaded. Please ensure internet connection.");
            return;
        }
        
        const opt = {
            margin:       10,
            filename:     'Spendora_Report.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Generate PDF
        html2pdf().set(opt).from(element).save();
        
    } else if (format === 'csv') {
        // Simple CSV Export logic re-used
        const data = filterTransactions();
        let csv = "Date,Name,Type,Category,Amount\n";
        data.forEach(t => {
            csv += `${t.date},"${t.name}",${t.type},${t.category},${t.amount}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "Report.csv";
        a.click();
    }
};