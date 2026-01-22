// ======================
// Global Mobile Menu Init
// ======================
initMobileMenu();

// ======================
// Dashboard Manager Class
// ======================
class DashboardManager {
  constructor(app) {
    this.app = app;

    // ✅ Set default currency to PKR if not already set
    if (!this.app.currentCurrency) {
      this.app.currentCurrency = "PKR";
    }

    this.setupDashboardListeners();
    this.initializeDashboard();
  }

  initializeDashboard() {
    this.setDefaultDate();
    this.loadSampleDataIfEmpty();
    this.setupChartResize();
    this.renderCharts();
  }

  setDefaultDate() {
    const transactionDate = document.getElementById("transactionDate");
    if (transactionDate) {
      const today = new Date().toISOString().split("T")[0];
      transactionDate.value = today;
      transactionDate.max = today;
    }
  }

  loadSampleDataIfEmpty() {
    if (this.app.transactions.length === 0) {
      // Uncomment to load sample data
      // this.loadSampleData();
    }
  }

  setupDashboardListeners() {
    this.setupCategoryBudgetEditing();
    this.setupTransactionFiltering();
    this.setupDataExport();
    this.setupQuickAddButtons();
  }

  setupCategoryBudgetEditing() {
    const categoryProgress = document.getElementById("categoryProgress");
    if (categoryProgress) {
      categoryProgress.addEventListener("dblclick", (e) => {
        const progressItem = e.target.closest(".progress-item");
        if (progressItem) {
          const category = progressItem.className.match(/progress-(\w+)/)[1];
          this.editCategoryBudget(category);
        }
      });
    }
  }

  editCategoryBudget(category) {
    const currentBudget = this.app.budgetLimits[category];
    const categoryInfo = BudgetUtils.getCategoryInfo(category);
    const newBudget = prompt(
      `Edit budget for ${categoryInfo.name}:`,
      currentBudget,
    );

    if (newBudget && !isNaN(newBudget) && parseFloat(newBudget) > 0) {
      this.app.budgetLimits[category] = parseFloat(newBudget);
      this.app.saveData();
      this.app.updateUI();
      BudgetUtils.showNotification(
        `${categoryInfo.name} budget updated to ${BudgetUtils.formatCurrency(
          newBudget,
          this.app.currentCurrency,
        )}`,
        "success",
      );
    }
  }

  setupTransactionFiltering() {
    this.addTransactionFilters();
  }

  addTransactionFilters() {
    const transactionsCard = document.querySelector(
      ".card:has(.transactions-list)",
    );
    if (transactionsCard && this.app.transactions.length > 0) {
      const header = transactionsCard.querySelector("h2");
      const filterHTML = `
        <div class="transaction-filters">
          <select class="filter-select" id="filterCategory">
            <option value="all">All Categories</option>
            ${BudgetUtils.getAllCategories()
              .map((cat) => {
                const info = BudgetUtils.getCategoryInfo(cat);
                return `<option value="${cat}">${info.name}</option>`;
              })
              .join("")}
          </select>
          <select class="filter-select" id="filterType">
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      `;

      header.insertAdjacentHTML("afterend", filterHTML);

      document
        .getElementById("filterCategory")
        .addEventListener("change", () => this.filterTransactions());
      document
        .getElementById("filterType")
        .addEventListener("change", () => this.filterTransactions());
    }
  }

  filterTransactions() {
    const categoryFilter =
      document.getElementById("filterCategory")?.value || "all";
    const typeFilter = document.getElementById("filterType")?.value || "all";

    const filteredTransactions = this.app.transactions.filter((transaction) => {
      const categoryMatch =
        categoryFilter === "all" || transaction.category === categoryFilter;
      const typeMatch = typeFilter === "all" || transaction.type === typeFilter;
      return categoryMatch && typeMatch;
    });

    this.displayFilteredTransactions(filteredTransactions);
  }

  displayFilteredTransactions(transactions) {
    const transactionsList = document.getElementById("transactionsList");

    if (transactions.length === 0) {
      transactionsList.innerHTML = `
        <div class="no-transactions-message">
          <i class="fas fa-search"></i>
          <p>No transactions match your filters</p>
        </div>
      `;
      return;
    }

    let transactionsHTML = "";
    transactions.slice(0, 10).forEach((transaction) => {
      const categoryInfo = BudgetUtils.getCategoryInfo(transaction.category);
      const isIncome = transaction.type === "income";

      transactionsHTML += `
        <div class="transaction-item">
          <div class="transaction-info">
            <div class="transaction-icon" style="background: ${categoryInfo.color}">
              <i class="${categoryInfo.icon}"></i>
            </div>
            <div class="transaction-details">
              <h4>${transaction.name}</h4>
              <div class="transaction-category">${categoryInfo.name} • ${BudgetUtils.formatDate(transaction.date)}</div>
            </div>
          </div>
          <div class="transaction-amount ${isIncome ? "transaction-income" : "transaction-expense"}">
            ${isIncome ? "+" : "-"}${BudgetUtils.formatCurrency(transaction.amount, this.app.currentCurrency)}
          </div>
        </div>
      `;
    });

    transactionsList.innerHTML = transactionsHTML;
  }

  setupDataExport() {
    this.addExportButton();
  }

  addExportButton() {
    const statsCard = document.querySelector(".stats-grid");
    if (statsCard) {
      const exportBtn = document.createElement("button");
      exportBtn.className = "btn btn-secondary btn-small";
      exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Data';
      exportBtn.style.marginTop = "1rem";
      exportBtn.style.marginLeft = "1rem";
      exportBtn.addEventListener("click", () => this.exportData());

      statsCard.parentNode.insertBefore(exportBtn, statsCard.nextSibling);
    }
  }

  exportData() {
    if (this.app.transactions.length === 0) {
      BudgetUtils.showNotification("No data to export", "warning");
      return;
    }

    let csv = "Date,Name,Category,Type,Amount\n";
    this.app.transactions.forEach((transaction) => {
      const row = [
        transaction.date,
        `"${transaction.name}"`,
        transaction.category,
        transaction.type,
        transaction.amount,
      ].join(",");
      csv += row + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budget-tracker-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    BudgetUtils.showNotification("Data exported successfully", "success");
  }

  setupQuickAddButtons() {
    this.addQuickAddSection();
  }

  addQuickAddSection() {
    const formCard = document.querySelector(".card:has(#transactionForm)");
    if (formCard) {
      const quickAddHTML = `
        <div class="quick-add-section">
          <h4><i class="fas fa-bolt"></i> Quick Add</h4>
          <div class="quick-add-buttons">
            <button class="quick-add-btn" data-type="expense" data-category="food" data-amount="5000">
              <i class="fas fa-utensils"></i> Food ₨5,000
            </button>
            <button class="quick-add-btn" data-type="expense" data-category="transport" data-amount="3000">
              <i class="fas fa-bus"></i> Transport ₨3,000
            </button>
            <button class="quick-add-btn" data-type="expense" data-category="entertainment" data-amount="2000">
              <i class="fas fa-film"></i> Entertainment ₨2,000
            </button>
            <button class="quick-add-btn" data-type="income" data-category="other" data-amount="10000">
              <i class="fas fa-money-bill-wave"></i> Income ₨10,000
            </button>
          </div>
        </div>
      `;

      formCard.insertAdjacentHTML("beforeend", quickAddHTML);

      document.querySelectorAll(".quick-add-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const type = e.currentTarget.dataset.type;
          const category = e.currentTarget.dataset.category;
          const amount = parseFloat(e.currentTarget.dataset.amount);
          this.quickAddTransaction(type, category, amount);
        });
      });
    }
  }

  quickAddTransaction(type, category, amount) {
    const categoryInfo = BudgetUtils.getCategoryInfo(category);
    const name = prompt(
      `Enter name for ${type} (${categoryInfo.name}):`,
      type === "income" ? "Quick Income" : "Quick Expense",
    );

    if (name) {
      const transaction = {
        id: BudgetUtils.generateId(),
        type: type,
        name: name,
        amount: amount,
        category: category,
        date: new Date().toISOString().split("T")[0],
        timestamp: new Date().toISOString(),
      };

      this.app.addTransaction(transaction);
      BudgetUtils.showNotification(
        `${type === "income" ? "Income" : "Expense"} added successfully!`,
        "success",
      );
      this.renderCharts();
    }
  }

  setupChartResize() {
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (this.app.chart) {
          this.app.chart.resize();
        }
      }, 250);
    });
  }

  renderCharts() {
    this.renderPieChart();
    this.renderBarChart();
  }

  renderPieChart() {
    const pieCanvas = document.getElementById("pieChart");
    if (!pieCanvas) return;

    const expenseTransactions = this.app.transactions.filter(
      (t) => t.type === "expense",
    );

    const categoryTotals = {};
    expenseTransactions.forEach((t) => {
      if (!categoryTotals[t.category]) categoryTotals[t.category] = 0;
      categoryTotals[t.category] += t.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (this.pieChart) this.pieChart.destroy();

    this.pieChart = new Chart(pieCanvas, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: labels.map(
              (c) => BudgetUtils.getCategoryInfo(c).color,
            ),
          },
        ],
      },
      options: {
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });
  }

  renderBarChart() {
    const barCanvas = document.getElementById("barChart");
    if (!barCanvas) return;

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

    const incomeByMonth = new Array(12).fill(0);
    const expenseByMonth = new Array(12).fill(0);

    this.app.transactions.forEach((t) => {
      const monthIndex = new Date(t.date).getMonth();
      if (t.type === "income") incomeByMonth[monthIndex] += t.amount;
      else expenseByMonth[monthIndex] += t.amount;
    });

    if (this.barChart) this.barChart.destroy();

    this.barChart = new Chart(barCanvas, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          { label: "Income", data: incomeByMonth },
          { label: "Expense", data: expenseByMonth },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });
  }
}

// ======================
// Initialize Dashboard
// ======================
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (window.budgetTracker) {
      window.dashboardManager = new DashboardManager(window.budgetTracker);
    }
  }, 500);
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
