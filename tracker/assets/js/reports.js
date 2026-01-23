// reports.js

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initReports();
  initCharts();
  setupEventListeners();
});

// ====================== MOBILE MENU ======================
function initMobileMenu() {
  const btn = document.getElementById("mobileMenuBtn");
  const nav = document.getElementById("navLinks");

  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    nav.classList.toggle("show");
    btn.querySelector("i").className = nav.classList.contains("show")
      ? "fas fa-times"
      : "fas fa-bars";
  });
}

// ====================== TRANSACTIONS ======================
function getTransactions() {
  return JSON.parse(localStorage.getItem("transactions")) || [];
}

// ====================== INIT REPORTS ======================
function initReports() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  document.getElementById("startDate").value = formatDate(firstDay);
  document.getElementById("endDate").value = formatDate(today);

  updateBudgetPerformance();
  generateFinancialInsights();
}

// ====================== CHARTS ======================
let incomeExpensesChart, trendChart;

function initCharts() {
  const incomeCtx = document
    .getElementById("incomeExpensesChart")
    .getContext("2d");
  const trendCtx = document.getElementById("trendChart").getContext("2d");

  incomeExpensesChart = new Chart(incomeCtx, {
    type: "bar",
    data: { labels: [], datasets: [] },
    options: chartOptions("Income vs Expenses"),
  });

  trendChart = new Chart(trendCtx, {
    type: "line",
    data: { labels: [], datasets: [] },
    options: chartOptions("Monthly Trend"),
  });

  generateReport();
}

function chartOptions(title) {
  return {
    responsive: true,
    plugins: { title: { display: true, text: title } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => "₨" + v.toLocaleString() },
      },
    },
  };
}

// ====================== EVENTS ======================
function setupEventListeners() {
  document.getElementById("reportPeriod").addEventListener("change", (e) => {
    document.getElementById("customDates").style.display =
      e.target.value === "custom" ? "flex" : "none";
  });

  document
    .getElementById("generateReportBtn")
    .addEventListener("click", generateReport);

  document
    .getElementById("trendType")
    .addEventListener("change", (e) => updateTrendChart(e.target.value));

  document
    .getElementById("refreshInsightsBtn")
    .addEventListener("click", generateFinancialInsights);

  document
    .getElementById("exportCsvBtn")
    .addEventListener("click", exportReportCSV);

  document
    .getElementById("exportPdfBtn")
    .addEventListener("click", exportReportPDF);

  document
    .getElementById("printReportBtn")
    .addEventListener("click", printReport);
}

// ====================== REPORT GENERATION ======================
function generateReport() {
  const period = document.getElementById("reportPeriod").value;
  const start = new Date(document.getElementById("startDate").value);
  const end = new Date(document.getElementById("endDate").value);

  const txs = filterByPeriod(getTransactions(), period, start, end);
  updateCharts(txs);
  updateBudgetPerformance(txs);

  showNotification("Report generated successfully", "success");
}

function filterByPeriod(transactions, period, start, end) {
  const now = new Date();

  return transactions.filter((tx) => {
    const d = new Date(tx.date);

    if (period === "custom") return d >= start && d <= end;
    if (period === "current-month")
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    if (period === "last-month")
      return (
        d.getMonth() === now.getMonth() - 1 &&
        d.getFullYear() === now.getFullYear()
      );
    if (period === "last-3-months")
      return d >= new Date(now.getFullYear(), now.getMonth() - 3, 1);

    return true;
  });
}

// ====================== UPDATE CHARTS ======================
function updateCharts(transactions) {
  const grouped = {};

  transactions.forEach((tx) => {
    const label = new Date(tx.date).toLocaleString("default", {
      month: "short",
    });

    grouped[label] ||= { income: 0, expense: 0 };
    grouped[label][tx.type] += tx.amount;
  });

  const labels = Object.keys(grouped);
  const income = labels.map((l) => grouped[l].income);
  const expense = labels.map((l) => grouped[l].expense);
  const balance = labels.map((_, i) => income[i] - expense[i]);

  incomeExpensesChart.data = {
    labels,
    datasets: [
      { label: "Income", data: income },
      { label: "Expenses", data: expense },
    ],
  };

  trendChart.data = {
    labels,
    datasets: [
      { label: "Income", data: income },
      { label: "Expenses", data: expense },
      { label: "Balance", data: balance },
    ],
  };

  incomeExpensesChart.update();
  trendChart.update();
}

// ====================== TREND FILTER ======================
function updateTrendChart(type) {
  trendChart.data.datasets.forEach((ds) => (ds.hidden = true));

  if (type === "income") trendChart.data.datasets[0].hidden = false;
  else if (type === "expenses") trendChart.data.datasets[1].hidden = false;
  else trendChart.data.datasets[2].hidden = false;

  trendChart.update();
}

// ====================== BUDGET PERFORMANCE ======================
function updateBudgetPerformance(transactions = getTransactions()) {
  let income = 0,
    expense = 0;

  transactions.forEach((tx) =>
    tx.type === "income" ? (income += tx.amount) : (expense += tx.amount),
  );

  const savings = income - expense;
  const savingsRate = income ? Math.round((savings / income) * 100) : 0;

  document.getElementById("avgMonthlyIncome").textContent =
    formatCurrency(income);
  document.getElementById("avgMonthlyExpenses").textContent =
    formatCurrency(expense);
  document.getElementById("monthlySavings").textContent =
    formatCurrency(savings);
  document.getElementById("savingsRate").textContent = savingsRate + "%";
}

// ====================== INSIGHTS ======================
function generateFinancialInsights() {
  const grid = document.getElementById("insightsGrid");
  if (!grid) return;

  const txs = getTransactions();

  let income = 0,
    expense = 0;
  txs.forEach((t) =>
    t.type === "income" ? (income += t.amount) : (expense += t.amount),
  );

  const insights = [
    {
      icon: "fa-piggy-bank",
      title: "Savings Status",
      description:
        income > expense
          ? "You maintained a positive balance this period."
          : "Expenses exceeded income. Adjust your budget.",
      type: income > expense ? "success" : "danger",
    },
    {
      icon: "fa-wallet",
      title: "Budget Balance",
      description:
        expense > income * 0.9
          ? "Expenses are close to income. Reduce spending."
          : "Spending is under control.",
      type: expense > income * 0.9 ? "danger" : "success",
    },
  ];

  grid.innerHTML = insights
    .map(
      (i) => `
      <div class="insight-card ${i.type}">
        <div class="insight-icon"><i class="fas ${i.icon}"></i></div>
        <div class="insight-content">
          <h4>${i.title}</h4>
          <p>${i.description}</p>
        </div>
      </div>
    `,
    )
    .join("");
}

// ====================== EXPORT CSV ======================
// ====================== EXPORT CSV ======================
// ================= EXPORT REPORT =================
function exportReport(format) {
  if (format === "print") {
    window.print();
    return;
  }

  const period = document.getElementById("reportPeriod").value;
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  const txs = filterByPeriod(
    getTransactions(),
    period,
    new Date(start),
    new Date(end),
  );

  if (format === "csv") {
    exportCSV(txs);
  } else if (format === "pdf") {
    exportPDF(txs);
  }
}

function exportCSV(transactions) {
  let csv = "Date,Description,Category,Type,Amount\n";

  transactions.forEach((tx) => {
    csv += `${tx.date},${tx.description},${tx.category},${tx.type},${tx.amount}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "report.csv";
  link.click();
  showNotification("CSV downloaded successfully!", "success");
}

function exportPDF(transactions) {
  const doc = new jsPDF("p", "pt", "a4");
  doc.setFontSize(14);
  doc.text("SpendOra Report", 40, 40);

  let y = 80;
  doc.setFontSize(10);

  doc.text("Date", 40, y);
  doc.text("Description", 120, y);
  doc.text("Category", 260, y);
  doc.text("Type", 380, y);
  doc.text("Amount", 450, y);

  y += 20;

  transactions.forEach((tx) => {
    doc.text(tx.date, 40, y);
    doc.text(tx.description, 120, y);
    doc.text(tx.category, 260, y);
    doc.text(tx.type, 380, y);
    doc.text("₦" + tx.amount.toLocaleString(), 450, y);
    y += 20;

    if (y > 760) {
      doc.addPage();
      y = 40;
    }
  });

  doc.save("report.pdf");
  showNotification("PDF downloaded successfully!", "success");
}

// ====================== PRINT ======================
function printReport() {
  const period = document.getElementById("reportPeriod").value;
  const start = new Date(document.getElementById("startDate").value);
  const end = new Date(document.getElementById("endDate").value);

  const txs = filterByPeriod(getTransactions(), period, start, end);

  if (!txs.length) return alert("No data to print");

  const section = document.getElementById("reportSection");
  if (!section) return alert("Report section not found");

  const win = window.open("", "", "width=900,height=700");

  win.document.write(`
    <html>
      <head>
        <title>Print Financial Report</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h2 { text-align: center; }
        </style>
      </head>
      <body>
        <h2>Financial Report</h2>
        ${section.innerHTML}
      </body>
    </html>
  `);

  win.document.close();
  win.focus();
  win.print();
  win.close();
}

// ====================== UTILITIES ======================
function formatDate(d) {
  return d.toISOString().split("T")[0];
}

function formatCurrency(n) {
  return "₨" + Number(n).toLocaleString();
}

function showNotification(msg) {
  alert(msg);
}
