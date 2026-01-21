// reports.js
document.addEventListener("DOMContentLoaded", function () {
  // Initialize mobile menu
  initMobileMenu();

  // Initialize reports
  initReports();

  // Initialize charts
  initCharts();

  // Setup event listeners
  setupEventListeners();
});

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

function initReports() {
  // Load budget performance data
  updateBudgetPerformance();

  // Load financial insights
  generateFinancialInsights();

  // Set default dates
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  document.getElementById("startDate").value = formatDate(firstDay);
  document.getElementById("endDate").value = formatDate(today);
}

function initCharts() {
  // Income vs Expenses Chart
  const incomeExpensesCtx = document
    .getElementById("incomeExpensesChart")
    .getContext("2d");
  window.incomeExpensesChart = new Chart(incomeExpensesCtx, {
    type: "bar",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Income",
          data: [300000, 280000, 320000, 310000, 290000, 330000],
          backgroundColor: "#28a745",
          borderColor: "#28a745",
          borderWidth: 1,
        },
        {
          label: "Expenses",
          data: [240000, 220000, 260000, 250000, 230000, 270000],
          backgroundColor: "#dc3545",
          borderColor: "#dc3545",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Income vs Expenses",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "N" + value.toLocaleString();
            },
          },
        },
      },
    },
  });

  // Monthly Trends Chart
  const trendCtx = document.getElementById("trendChart").getContext("2d");
  window.trendChart = new Chart(trendCtx, {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Income",
          data: [300000, 280000, 320000, 310000, 290000, 330000],
          borderColor: "#28a745",
          backgroundColor: "rgba(40, 167, 69, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Expenses",
          data: [240000, 220000, 260000, 250000, 230000, 270000],
          borderColor: "#dc3545",
          backgroundColor: "rgba(220, 53, 69, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Balance",
          data: [60000, 60000, 60000, 60000, 60000, 60000],
          borderColor: "#007bff",
          backgroundColor: "rgba(0, 123, 255, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "N" + value.toLocaleString();
            },
          },
        },
      },
    },
  });
}

function setupEventListeners() {
  // Report period change
  const reportPeriod = document.getElementById("reportPeriod");
  const customDates = document.getElementById("customDates");

  if (reportPeriod) {
    reportPeriod.addEventListener("change", function () {
      customDates.style.display = this.value === "custom" ? "flex" : "none";
    });
  }

  // Generate Report button
  const generateReportBtn = document.getElementById("generateReportBtn");
  if (generateReportBtn) {
    generateReportBtn.addEventListener("click", function () {
      generateReport();
    });
  }

  // Trend type change
  const trendType = document.getElementById("trendType");
  if (trendType) {
    trendType.addEventListener("change", function () {
      updateTrendChart(this.value);
    });
  }

  // Refresh insights button
  const refreshInsightsBtn = document.getElementById("refreshInsightsBtn");
  if (refreshInsightsBtn) {
    refreshInsightsBtn.addEventListener("click", function () {
      generateFinancialInsights();
    });
  }
}

function updateBudgetPerformance() {
  // In a real app, this would come from an API
  const budgetData = {
    totalBudget: 300000,
    totalExpenses: 225000,
    totalIncome: 300000,
    overspentCategories: 1,
    categories: [
      { name: "Food", budget: 50000, spent: 45000 },
      { name: "Transportation", budget: 40000, spent: 35000 },
      { name: "Entertainment", budget: 30000, spent: 40000, overspent: true },
      { name: "Utilities", budget: 35000, spent: 30000 },
      { name: "Shopping", budget: 25000, spent: 20000 },
      { name: "Savings", budget: 80000, saved: 60000 },
    ],
  };

  // Calculate percentages
  const budgetUsed = Math.round(
    (budgetData.totalExpenses / budgetData.totalBudget) * 100,
  );
  const savingsRate = Math.round(
    ((budgetData.totalIncome - budgetData.totalExpenses) /
      budgetData.totalIncome) *
      100,
  );
  const performance = Math.round(
    ((budgetData.totalIncome - budgetData.totalExpenses) /
      budgetData.totalIncome) *
      100,
  );

  // Update DOM
  document.getElementById("budgetPerformance").textContent = performance + "%";
  document.getElementById("budgetUsed").textContent = budgetUsed + "%";
  document
    .getElementById("budgetUsed")
    .parentElement.querySelector(".performance-fill").style.width =
    budgetUsed + "%";

  document.getElementById("savingsRate").textContent = savingsRate + "%";
  document
    .getElementById("savingsRate")
    .parentElement.querySelector(".performance-fill").style.width =
    savingsRate + "%";

  document.getElementById("overspentCategories").textContent =
    budgetData.overspentCategories;

  // Update key metrics
  document.getElementById("avgMonthlyIncome").textContent = formatCurrency(
    budgetData.totalIncome,
  );
  document.getElementById("avgMonthlyExpenses").textContent = formatCurrency(
    budgetData.totalExpenses,
  );
  document.getElementById("monthlySavings").textContent = formatCurrency(
    budgetData.totalIncome - budgetData.totalExpenses,
  );

  // Find top spending category
  const topCategory = budgetData.categories.reduce((prev, current) =>
    prev.spent > current.spent ? prev : current,
  );
  document.getElementById("topCategory").textContent = topCategory.name;
}

function generateFinancialInsights() {
  const insightsGrid = document.getElementById("insightsGrid");
  if (!insightsGrid) return;

  const insights = [
    {
      icon: "fa-chart-line",
      title: "Spending Trend",
      description:
        "Your entertainment expenses increased by 25% this month. Consider setting a stricter budget limit.",
      type: "warning",
    },
    {
      icon: "fa-piggy-bank",
      title: "Savings Opportunity",
      description:
        "You could save an additional N15,000 by reducing dining out expenses by 30%.",
      type: "success",
    },
    {
      icon: "fa-lightbulb",
      title: "Budget Optimization",
      description:
        "Your transportation budget has 20% unused funds. Consider reallocating to overspent categories.",
      type: "info",
    },
    {
      icon: "fa-calendar-check",
      title: "Bill Payment Alert",
      description:
        "Upcoming bills: Electricity (N8,500) due in 3 days, Internet (N15,000) due in 5 days.",
      type: "danger",
    },
    {
      icon: "fa-trophy",
      title: "Achievement Unlocked",
      description:
        "You've maintained a savings rate above 20% for 3 consecutive months! Keep it up.",
      type: "success",
    },
    {
      icon: "fa-exclamation-triangle",
      title: "High Spending Alert",
      description:
        "Your shopping expenses are 15% above your 3-month average. Review recent purchases.",
      type: "danger",
    },
  ];

  insightsGrid.innerHTML = insights
    .map(
      (insight) => `
        <div class="insight-card ${insight.type}">
            <div class="insight-icon">
                <i class="fas ${insight.icon}"></i>
            </div>
            <div class="insight-content">
                <h4>${insight.title}</h4>
                <p>${insight.description}</p>
            </div>
            <div class="insight-actions">
                <button class="btn btn-sm btn-outline">
                    <i class="fas fa-info-circle"></i>
                </button>
            </div>
        </div>
    `,
    )
    .join("");
}

function generateReport() {
  const reportPeriod = document.getElementById("reportPeriod").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  // Update period display
  const periodElement = document.getElementById("incomeExpensesPeriod");
  if (periodElement) {
    if (reportPeriod === "custom") {
      periodElement.textContent = `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`;
    } else {
      periodElement.textContent =
        document.getElementById("reportPeriod").options[
          document.getElementById("reportPeriod").selectedIndex
        ].text;
    }
  }

  // Update charts based on selected period
  updateChartsForPeriod(reportPeriod, startDate, endDate);

  // Update budget performance
  updateBudgetPerformance();

  // Show success message
  showNotification("Report generated successfully!", "success");
}

function updateTrendChart(type) {
  if (!window.trendChart) return;

  // Hide all datasets
  window.trendChart.data.datasets.forEach((dataset) => {
    dataset.hidden = true;
  });

  // Show selected dataset
  if (type === "income") {
    window.trendChart.data.datasets[0].hidden = false;
    window.trendChart.options.plugins.title = {
      display: true,
      text: "Monthly Income Trend",
    };
  } else if (type === "expenses") {
    window.trendChart.data.datasets[1].hidden = false;
    window.trendChart.options.plugins.title = {
      display: true,
      text: "Monthly Expenses Trend",
    };
  } else {
    window.trendChart.data.datasets[2].hidden = false;
    window.trendChart.options.plugins.title = {
      display: true,
      text: "Monthly Balance Trend",
    };
  }

  window.trendChart.update();
}

function updateChartsForPeriod(period, startDate, endDate) {
  // In a real app, this would fetch new data from an API
  // For now, we'll just simulate with different data

  const sampleData = {
    "current-month": {
      income: [310000, 290000, 330000],
      expenses: [250000, 230000, 270000],
      labels: ["Week 1", "Week 2", "Week 3"],
    },
    "last-month": {
      income: [280000, 320000, 310000],
      expenses: [220000, 260000, 250000],
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    },
    "last-3-months": {
      income: [300000, 280000, 320000],
      expenses: [240000, 220000, 260000],
      labels: ["Month 1", "Month 2", "Month 3"],
    },
  };

  const data = sampleData[period] || sampleData["current-month"];

  // Update income vs expenses chart
  if (window.incomeExpensesChart) {
    window.incomeExpensesChart.data.labels = data.labels;
    window.incomeExpensesChart.data.datasets[0].data = data.income;
    window.incomeExpensesChart.data.datasets[1].data = data.expenses;
    window.incomeExpensesChart.update();
  }

  // Update trend chart
  if (window.trendChart) {
    window.trendChart.data.labels = data.labels;
    window.trendChart.data.datasets[0].data = data.income;
    window.trendChart.data.datasets[1].data = data.expenses;
    window.trendChart.data.datasets[2].data = data.income.map(
      (income, i) => income - data.expenses[i],
    );
    window.trendChart.update();
  }
}

// Utility functions
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function formatDateDisplay(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount) {
  return "N" + amount.toLocaleString("en-US");
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <i class="fas ${type === "success" ? "fa-check-circle" : "fa-info-circle"}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

  // Add to body
  document.body.appendChild(notification);

  // Add show class after a delay
  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);

  // Close button
  notification
    .querySelector(".notification-close")
    .addEventListener("click", () => {
      notification.classList.remove("show");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });
}

// Export functions (would connect to backend in real app)
function exportReport(format) {
  switch (format) {
    case "pdf":
      showNotification("PDF export started. This may take a moment...", "info");
      // In real app: generate and download PDF
      setTimeout(() => {
        showNotification("PDF report downloaded successfully!", "success");
      }, 2000);
      break;
    case "csv":
      showNotification("CSV file downloaded successfully!", "success");
      // In real app: generate and download CSV
      break;
    case "print":
      window.print();
      break;
  }
}
