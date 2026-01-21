// reports.js
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initReports();
  initCharts();
  setupEventListeners();
});

/* ================= MOBILE MENU ================= */
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

/* ================= LOAD TRANSACTIONS ================= */
function getTransactions() {
  return JSON.parse(localStorage.getItem("transactions")) || [];
}

/* ================= INIT REPORTS ================= */
function initReports() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  document.getElementById("startDate").value = formatDate(firstDay);
  document.getElementById("endDate").value = formatDate(today);

  updateBudgetPerformance();
  generateFinancialInsights();
}

/* ================= CHARTS ================= */
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
        ticks: { callback: (v) => "₦" + v.toLocaleString() },
      },
    },
  };
}

/* ================= EVENTS ================= */
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
}

/* ================= REPORT GENERATION ================= */
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
    if (period === "last-month") return d.getMonth() === now.getMonth() - 1;
    if (period === "last-3-months")
      return d >= new Date(now.setMonth(now.getMonth() - 3));

    return true;
  });
}

/* ================= UPDATE CHARTS ================= */
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
      { label: "Income", data: income, backgroundColor: "#28a745" },
      { label: "Expenses", data: expense, backgroundColor: "#dc3545" },
    ],
  };

  trendChart.data = {
    labels,
    datasets: [
      { label: "Income", data: income, borderColor: "#28a745", fill: true },
      { label: "Expenses", data: expense, borderColor: "#dc3545", fill: true },
      { label: "Balance", data: balance, borderColor: "#007bff", fill: true },
    ],
  };

  incomeExpensesChart.update();
  trendChart.update();
}

/* ================= TREND FILTER ================= */
function updateTrendChart(type) {
  trendChart.data.datasets.forEach((ds) => (ds.hidden = true));

  if (type === "income") trendChart.data.datasets[0].hidden = false;
  else if (type === "expenses") trendChart.data.datasets[1].hidden = false;
  else trendChart.data.datasets[2].hidden = false;

  trendChart.update();
}

/* ================= BUDGET PERFORMANCE ================= */
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

/* ================= INSIGHTS ================= */
function generateFinancialInsights() {
  const grid = document.getElementById("insightsGrid");
  if (!grid) return;

  const txs = JSON.parse(localStorage.getItem("transactions")) || [];

  let income = 0,
    expense = 0;
  txs.forEach((t) =>
    t.type === "income" ? (income += t.amount) : (expense += t.amount),
  );

  const insights = [];

  insights.push({
    icon: "fa-piggy-bank",
    title: "Savings Status",
    description:
      income > expense
        ? "Congratulations! You successfully maintained a positive balance this period."
        : "Your expenses exceeded your income. Review your budget to regain control.",
    type: income > expense ? "success" : "danger",
  });

  insights.push({
    icon: "fa-lightbulb",
    title: "Smart Spending",
    description:
      "Your essential expenses are well controlled. Great financial discipline!",
    type: "info",
  });

  insights.push({
    icon: "fa-chart-line",
    title: "Expense Reduction Tip",
    description:
      "Reducing discretionary spending by 10% could significantly increase your monthly savings.",
    type: "warning",
  });

  insights.push({
    icon: "fa-wallet",
    title: "Budget Balance",
    description:
      expense > income * 0.9
        ? "Your expenses are approaching your income level. Consider adjusting your budget."
        : "Your spending is within a healthy range.",
    type: expense > income * 0.9 ? "danger" : "success",
  });

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

/* ================= UTILITIES ================= */
function formatDate(d) {
  return d.toISOString().split("T")[0];
}

function formatCurrency(n) {
  return "₦" + Number(n).toLocaleString();
}

function showNotification(msg, type) {
  alert(msg); // simple & reliable
}
