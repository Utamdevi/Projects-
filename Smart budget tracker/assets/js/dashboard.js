// ======================
// Global Mobile Menu Init
// ======================
initMobileMenu();

// ======================
// Budget Tracker App Class
// ======================
class BudgetTrackerApp {
  constructor(userId) {
    this.userId = userId;
    this.transactions =
      JSON.parse(localStorage.getItem(`transactions_${userId}`)) || [];
    this.budgetLimits =
      JSON.parse(localStorage.getItem(`budget_${userId}`)) || {};
    this.currentCurrency = "PKR";
  }

  saveData() {
    localStorage.setItem(
      `transactions_${this.userId}`,
      JSON.stringify(this.transactions),
    );
    localStorage.setItem(
      `budget_${this.userId}`,
      JSON.stringify(this.budgetLimits),
    );
  }

  addTransaction(transaction) {
    this.transactions.push(transaction);
    this.saveData();
  }
}

// ======================
// Dashboard Manager Class
// ======================
class DashboardManager {
  constructor(app) {
    this.app = app;
    this.setupDashboard();
  }

  setupDashboard() {
    this.setDefaultDate();
    this.renderCharts();
    this.renderTransactions();
    this.setupListeners();
  }

  setDefaultDate() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("transactionDate").value = today;
    document.getElementById("transactionDate").max = today;
  }

  setupListeners() {
    document
      .getElementById("addTransactionBtn")
      .addEventListener("click", () => {
        const transaction = {
          id: Date.now(),
          type: document.getElementById("transactionType").value,
          name: document.getElementById("transactionName").value,
          amount: parseFloat(
            document.getElementById("transactionAmount").value,
          ),
          category: document.getElementById("transactionCategory").value,
          date: document.getElementById("transactionDate").value,
          timestamp: new Date().toISOString(),
        };

        this.app.addTransaction(transaction);
        this.renderTransactions();
        this.renderCharts();
      });

    document.querySelectorAll(".quick-add-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const type = e.currentTarget.dataset.type;
        const category = e.currentTarget.dataset.category;
        const amount = parseFloat(e.currentTarget.dataset.amount);
        this.quickAddTransaction(type, category, amount);
      });
    });

    document
      .getElementById("exportBtn")
      .addEventListener("click", () => this.exportData());
  }

  renderTransactions() {
    const list = document.getElementById("transactionsList");
    list.innerHTML = "";

    if (this.app.transactions.length === 0) {
      list.innerHTML = "<p>No transactions yet.</p>";
      return;
    }

    this.app.transactions
      .slice()
      .reverse()
      .forEach((t) => {
        list.innerHTML += `
        <div class="transaction-item">
          <div>
            <strong>${t.name}</strong> <br>
            <small>${t.date} • ${t.category}</small>
          </div>
          <div class="${t.type === "income" ? "transaction-income" : "transaction-expense"}">
            ${t.type === "income" ? "+" : "-"}${t.amount}
          </div>
        </div>
      `;
      });
  }

  quickAddTransaction(type, category, amount) {
    const transaction = {
      id: Date.now(),
      type,
      name: type === "income" ? "Quick Income" : "Quick Expense",
      amount,
      category,
      date: new Date().toISOString().split("T")[0],
      timestamp: new Date().toISOString(),
    };
    this.app.addTransaction(transaction);
    this.renderTransactions();
    this.renderCharts();
  }

  exportData() {
    if (this.app.transactions.length === 0) return alert("No data to export");

    let csv = "Date,Name,Category,Type,Amount\n";
    this.app.transactions.forEach((t) => {
      csv += `${t.date},"${t.name}",${t.category},${t.type},${t.amount}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budget-${this.app.userId}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  renderCharts() {
    this.renderPieChart();
    this.renderBarChart();
  }

  renderPieChart() {
    const ctx = document.getElementById("pieChart");
    const expenses = this.app.transactions.filter((t) => t.type === "expense");

    const totals = {};
    expenses.forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });

    const labels = Object.keys(totals);
    const data = Object.values(totals);

    if (this.pieChart) this.pieChart.destroy();

    this.pieChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: labels.map((_, i) => `hsl(${i * 50}, 70%, 50%)`),
          },
        ],
      },
    });
  }

  renderBarChart() {
    const ctx = document.getElementById("barChart");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const income = new Array(12).fill(0);
    const expense = new Array(12).fill(0);

    this.app.transactions.forEach((t) => {
      const m = new Date(t.date).getMonth();
      if (t.type === "income") income[m] += t.amount;
      else expense[m] += t.amount;
    });

    if (this.barChart) this.barChart.destroy();

    this.barChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          { label: "Income", data: income },
          { label: "Expense", data: expense },
        ],
      },
    });
  }
}

// ======================
// Login System
// ======================
const loginBtn = document.getElementById("loginBtn");
const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");

let currentUserId = null;
let app = null;
let dashboardManager = null;

loginBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  if (!username) return alert("Enter username");

  currentUserId = username;
  loginCard.style.display = "none";
  dashboard.style.display = "block";

  app = new BudgetTrackerApp(currentUserId);
  dashboardManager = new DashboardManager(app);
});

// ======================
// Mobile Menu
// ======================
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", function () {
      navLinks.classList.toggle("show");
      const icon = this.querySelector("i");
      if (navLinks.classList.contains("show")) {
        icon.className = "fas fa-times";
      } else {
        icon.className = "fas fa-bars";
      }
    });
  }
}
