// Main Application Logic
class BudgetTrackerApp {
  constructor() {
    this.transactions = [];
    this.currentCurrency = "NGN";
    this.currentBalance = 0;
    this.budgetLimits = {
      food: 50000,
      rent: 150000,
      transport: 30000,
      shopping: 40000,
      entertainment: 20000,
      other: 10000,
    };
    this.chart = null;

    this.init();
  }

  init() {
    this.loadData();
    this.setupEventListeners();
    this.updateUI();
    this.initializeChart();
  }

  loadData() {
    const savedTransactions = BudgetUtils.loadFromLocalStorage("transactions");
    const savedSettings = BudgetUtils.loadFromLocalStorage("settings");

    if (savedTransactions) this.transactions = savedTransactions;
    if (savedSettings) {
      this.currentCurrency = savedSettings.currency || "NGN";
      this.currentBalance = savedSettings.balance || 0;
      this.budgetLimits = savedSettings.budgetLimits || this.budgetLimits;
    }

    const currencySelect = document.getElementById("currencySelect");
    if (currencySelect) currencySelect.value = this.currentCurrency;

    this.updateBalance();
  }

  saveData() {
    BudgetUtils.saveToLocalStorage("transactions", this.transactions);
    BudgetUtils.saveToLocalStorage("settings", {
      currency: this.currentCurrency,
      balance: this.currentBalance,
      budgetLimits: this.budgetLimits,
    });
  }

  setupEventListeners() {
    const transactionForm = document.getElementById("transactionForm");
    if (transactionForm) {
      transactionForm.addEventListener("submit", (e) =>
        this.handleTransactionSubmit(e),
      );
    }

    const clearFormBtn = document.getElementById("clearForm");
    if (clearFormBtn) {
      clearFormBtn.addEventListener("click", () => this.clearTransactionForm());
    }

    const currencySelect = document.getElementById("currencySelect");
    if (currencySelect) {
      currencySelect.addEventListener("change", (e) =>
        this.handleCurrencyChange(e),
      );
    }

    // Mobile menu
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const navLinks = document.getElementById("navLinks");
    if (mobileMenuBtn && navLinks) {
      mobileMenuBtn.addEventListener("click", () =>
        navLinks.classList.toggle("active"),
      );
    }

    // Start Journey button
    const startJourneyBtn = document.getElementById("startJourneyBtn");
    if (startJourneyBtn) {
      startJourneyBtn.addEventListener("click", () =>
        this.handleStartJourney(),
      );
    }

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest("nav") && !e.target.closest(".mobile-menu-btn")) {
        if (navLinks && navLinks.classList.contains("active")) {
          navLinks.classList.remove("active");
        }
      }
    });
  }

  handleTransactionSubmit(e) {
    e.preventDefault();

    const transactionData = {
      id: BudgetUtils.generateId(),
      type: document.getElementById("transactionType").value,
      name: document.getElementById("transactionName").value.trim(),
      amount: parseFloat(document.getElementById("transactionAmount").value),
      category: document.getElementById("transactionCategory").value,
      date: document.getElementById("transactionDate").value,
      timestamp: new Date().toISOString(),
    };

    const errors = BudgetUtils.validateTransaction(transactionData);
    if (errors.length > 0) {
      errors.forEach((error) => BudgetUtils.showNotification(error, "error"));
      return;
    }

    this.addTransaction(transactionData);
    this.clearTransactionForm();

    BudgetUtils.showNotification(
      `${transactionData.type === "income" ? "Income" : "Expense"} added successfully!`,
      "success",
    );
  }

  addTransaction(transaction) {
    this.transactions.unshift(transaction);
    this.saveData();
    this.updateUI();
  }

  clearTransactionForm() {
    const form = document.getElementById("transactionForm");
    if (form) {
      form.reset();
      document.getElementById("transactionDate").value = new Date()
        .toISOString()
        .split("T")[0];
      document.getElementById("transactionName").focus();
    }
  }

  handleCurrencyChange(e) {
    this.currentCurrency = e.target.value;
    this.saveData();
    this.updateUI();
  }

  updateBalance() {
    const balance = BudgetUtils.calculateBalance(
      this.transactions,
      this.currentBalance,
    );
    const balanceElement = document.getElementById("balanceAmount");
    if (balanceElement) {
      balanceElement.textContent = BudgetUtils.formatCurrency(
        balance,
        this.currentCurrency,
      );
      balanceElement.className =
        "balance-amount " + (balance >= 0 ? "positive" : "negative");
    }
  }

  updateCategoryProgress() {
    const categoryTotals = BudgetUtils.calculateCategoryTotals(
      this.transactions,
    );
    const categoryProgress = document.getElementById("categoryProgress");

    if (this.transactions.length === 0) {
      categoryProgress.innerHTML = `
        <div class="no-transactions-message">
          <i class="fas fa-chart-bar"></i>
          <p>No transactions yet. Add your first transaction to see progress.</p>
        </div>
      `;
      return;
    }

    let progressHTML = "";
    BudgetUtils.getAllCategories().forEach((category) => {
      const spent = categoryTotals[category] || 0;
      const limit = this.budgetLimits[category];
      const percentage = BudgetUtils.calculatePercentage(spent, limit);
      const categoryInfo = BudgetUtils.getCategoryInfo(category);

      progressHTML += `
        <div class="progress-item progress-${category}">
          <div class="progress-header">
            <div class="progress-label">
              <i class="${categoryInfo.icon}" style="color: ${categoryInfo.color}"></i>
              ${categoryInfo.name}
            </div>
            <div class="progress-amount">
              ${BudgetUtils.formatCurrency(spent, this.currentCurrency)} / 
              ${BudgetUtils.formatCurrency(limit, this.currentCurrency)}
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%; background: ${categoryInfo.color}"></div>
            <div class="progress-percentage">${percentage}%</div>
          </div>
        </div>
      `;
    });

    categoryProgress.innerHTML = progressHTML;
  }

  updateTransactionsList() {
    const transactionsList = document.getElementById("transactionsList");

    if (this.transactions.length === 0) {
      transactionsList.innerHTML = `
        <div class="no-transactions-message">
          <i class="fas fa-exchange-alt"></i>
          <p>No transactions yet. Add your first transaction above!</p>
        </div>
      `;
      return;
    }

    let transactionsHTML = "";
    this.transactions.slice(0, 10).forEach((transaction) => {
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
            ${isIncome ? "+" : "-"}${BudgetUtils.formatCurrency(transaction.amount, this.currentCurrency)}
          </div>
        </div>
      `;
    });

    transactionsList.innerHTML = transactionsHTML;
  }

  updateStatistics() {
    // Calculate totals
    const totalIncome = this.transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpense = this.transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalAmount = totalIncome - totalExpense + this.currentBalance;

    // Update total transactions
    const totalTransactionsElement =
      document.getElementById("totalTransactions");
    if (totalTransactionsElement) {
      totalTransactionsElement.textContent = BudgetUtils.formatCurrency(
        totalAmount,
        this.currentCurrency,
      );
      totalTransactionsElement.className =
        "stat-number " + (totalAmount >= 0 ? "positive" : "negative");
    }

    // Update total income
    const totalIncomeElement = document.getElementById("totalIncome");
    if (totalIncomeElement) {
      totalIncomeElement.textContent = BudgetUtils.formatCurrency(
        totalIncome,
        this.currentCurrency,
      );
    }

    // Update total expense
    const totalExpenseElement = document.getElementById("totalExpense");
    if (totalExpenseElement) {
      totalExpenseElement.textContent = BudgetUtils.formatCurrency(
        totalExpense,
        this.currentCurrency,
      );
    }
  }

  initializeChart() {
    const ctx = document.getElementById("expenseChart")?.getContext("2d");
    if (!ctx) return;

    const chartData = this.getChartData();

    this.chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.data,
            backgroundColor: chartData.colors,
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              padding: 20,
              usePointStyle: true,
              boxWidth: 12,
              font: {
                size: 11,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100) || 0;
                return `${context.label}: ${BudgetUtils.formatCurrency(value, this.currentCurrency)} (${percentage}%)`;
              },
            },
          },
        },
      },
    });

    this.updateChartCalculations();
  }

  getChartData() {
    const categoryTotals = BudgetUtils.calculateCategoryTotals(
      this.transactions,
    );
    const allCategories = BudgetUtils.getAllCategories();

    return {
      labels: allCategories.map((cat) => BudgetUtils.getCategoryInfo(cat).name),
      data: allCategories.map((cat) => categoryTotals[cat] || 0),
      colors: allCategories.map(
        (cat) => BudgetUtils.getCategoryInfo(cat).color,
      ),
    };
  }

  updateChart() {
    if (!this.chart) {
      this.initializeChart();
      return;
    }

    const chartData = this.getChartData();

    this.chart.data.labels = chartData.labels;
    this.chart.data.datasets[0].data = chartData.data;
    this.chart.data.datasets[0].backgroundColor = chartData.colors;

    this.chart.update();
    this.updateChartCalculations();
  }

  updateChartCalculations() {
    const categoryTotals = BudgetUtils.calculateCategoryTotals(
      this.transactions,
    );
    const allCategories = BudgetUtils.getAllCategories();
    const totalExpenses = Object.values(categoryTotals).reduce(
      (a, b) => a + b,
      0,
    );

    // Update category calculations
    const calculationsGrid = document.getElementById("categoryCalculations");
    if (calculationsGrid) {
      let calculationsHTML = "";

      allCategories.forEach((category) => {
        const categoryInfo = BudgetUtils.getCategoryInfo(category);
        const amount = categoryTotals[category] || 0;
        const percentage =
          totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;

        calculationsHTML += `
          <div class="calculation-item">
            <div class="calculation-category">
              <div class="category-color" style="background: ${categoryInfo.color}"></div>
              <span>${categoryInfo.name}</span>
            </div>
            <div class="calculation-details">
              <span class="calculation-amount">${BudgetUtils.formatCurrency(amount, this.currentCurrency)}</span>
              <span class="calculation-percentage">${percentage}%</span>
            </div>
          </div>
        `;
      });

      calculationsGrid.innerHTML = calculationsHTML;
    }

    // Update summary
    const chartTotalExpenses = document.getElementById("chartTotalExpenses");
    const chartAvgExpenses = document.getElementById("chartAvgExpenses");
    const chartHighestCategory = document.getElementById(
      "chartHighestCategory",
    );

    if (chartTotalExpenses) {
      chartTotalExpenses.textContent = BudgetUtils.formatCurrency(
        totalExpenses,
        this.currentCurrency,
      );
    }

    if (chartAvgExpenses && allCategories.length > 0) {
      const avgExpense = totalExpenses / allCategories.length;
      chartAvgExpenses.textContent = BudgetUtils.formatCurrency(
        avgExpense,
        this.currentCurrency,
      );
    }

    if (chartHighestCategory && totalExpenses > 0) {
      let highestCategory = "";
      let highestAmount = 0;

      allCategories.forEach((category) => {
        const amount = categoryTotals[category] || 0;
        if (amount > highestAmount) {
          highestAmount = amount;
          highestCategory = BudgetUtils.getCategoryInfo(category).name;
        }
      });

      chartHighestCategory.textContent = highestCategory || "-";
    }
  }

  handleStartJourney() {
    const addTransactionForm = document.getElementById("transactionForm");
    if (addTransactionForm) {
      addTransactionForm.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      document.getElementById("transactionName").focus();
      BudgetUtils.showNotification(
        "Welcome! Start by adding your first transaction.",
        "info",
        5000,
      );
    }
  }

  updateUI() {
    this.updateBalance();
    this.updateCategoryProgress();
    this.updateTransactionsList();
    this.updateStatistics();
    this.updateChart();
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  window.budgetTracker = new BudgetTrackerApp();
});
