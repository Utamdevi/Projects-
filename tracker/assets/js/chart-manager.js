// Chart Manager for Budget Tracker
class ChartManager {
  constructor(app) {
    this.app = app;
    this.chart = null;
    this.chartType = "doughnut";
    this.chartTypes = ["doughnut", "pie", "bar", "line"];

    this.init();
  }

  init() {
    this.setupChartButtons();
    this.setupExportButton();
    this.initializeChart();
  }

  setupChartButtons() {
    const chartButtons = document.querySelectorAll(".chart-btn");
    chartButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const type = e.currentTarget.dataset.type;
        this.setChartType(type);

        // Update active state
        chartButtons.forEach((b) => b.classList.remove("active"));
        e.currentTarget.classList.add("active");

        BudgetUtils.showNotification(`Switched to ${type} chart`, "info");
      });
    });
  }

  setupExportButton() {
    const exportBtn = document.getElementById("exportChartBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportChart());
    }
  }

  setChartType(type) {
    if (this.chartTypes.includes(type)) {
      this.chartType = type;
      this.updateChartType();
    }
  }

  updateChartType() {
    if (!this.app.chart) return;

    // Destroy old chart
    this.app.chart.destroy();

    // Reinitialize chart with new type
    this.initializeChart();
  }

  initializeChart() {
    const ctx = document.getElementById("expenseChart")?.getContext("2d");
    if (!ctx) return;

    const chartData = this.getChartData();

    this.chart = new Chart(ctx, {
      type: this.chartType,
      data: {
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.data,
            backgroundColor: chartData.colors,
            borderWidth: 2,
            borderColor: "#fff",
            hoverOffset: 15,
          },
        ],
      },
      options: this.getChartOptions(),
    });

    this.app.chart = this.chart;
    this.app.updateChartCalculations();
  }

  getChartData() {
    const categoryTotals = BudgetUtils.calculateCategoryTotals(
      this.app.transactions,
    );
    const allCategories = BudgetUtils.getAllCategories();

    const labels = allCategories.map(
      (cat) => BudgetUtils.getCategoryInfo(cat).name,
    );
    const data = allCategories.map((cat) => categoryTotals[cat] || 0);
    const colors = allCategories.map(
      (cat) => BudgetUtils.getCategoryInfo(cat).color,
    );

    // If all data is zero, show placeholder
    const total = data.reduce((a, b) => a + b, 0);
    if (total === 0) {
      return {
        labels: ["No Expenses"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#ecf0f1"],
            borderColor: "#fff",
            borderWidth: 2,
          },
        ],
      };
    }

    return {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderColor: "#fff",
          borderWidth: 2,
          hoverOffset: 15,
        },
      ],
    };
  }

  getChartOptions() {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: this.chartType !== "bar" && this.chartType !== "line",
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
              const percentage =
                total > 0 ? Math.round((value / total) * 100) : 0;
              return `${context.label}: ${BudgetUtils.formatCurrency(value, this.app.currentCurrency)} (${percentage}%)`;
            },
          },
        },
      },
    };

    // Add specific options for different chart types
    switch (this.chartType) {
      case "bar":
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) =>
                  BudgetUtils.formatCurrency(value, this.app.currentCurrency),
              },
            },
          },
        };

      case "line":
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) =>
                  BudgetUtils.formatCurrency(value, this.app.currentCurrency),
              },
            },
          },
        };

      default:
        return baseOptions;
    }
  }

  updateChart() {
    if (!this.chart) {
      this.initializeChart();
      return;
    }

    const chartData = this.getChartData();

    this.chart.data.labels = chartData.labels;
    this.chart.data.datasets[0].data = chartData.data;
    this.chart.data.datasets[0].backgroundColor =
      chartData.datasets[0].backgroundColor;

    this.chart.update();
    this.app.updateChartCalculations();
  }

  exportChart() {
    if (!this.chart) return;

    try {
      const link = document.createElement("a");
      link.download = `budget-chart-${new Date().toISOString().split("T")[0]}.png`;
      link.href = this.chart.toBase64Image();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      BudgetUtils.showNotification("Chart exported successfully!", "success");
    } catch (error) {
      BudgetUtils.showNotification("Error exporting chart", "error");
      console.error("Export error:", error);
    }
  }

  // Method to update calculations display
  updateCalculationsDisplay() {
    const categoryTotals = BudgetUtils.calculateCategoryTotals(
      this.app.transactions,
    );
    const allCategories = BudgetUtils.getAllCategories();
    const totalExpenses = Object.values(categoryTotals).reduce(
      (a, b) => a + b,
      0,
    );

    // Find highest category
    let highestCategory = null;
    let highestAmount = 0;

    allCategories.forEach((category) => {
      const amount = categoryTotals[category] || 0;
      if (amount > highestAmount) {
        highestAmount = amount;
        highestCategory = category;
      }
    });

    // Update summary
    const summaryElement = document.querySelector(".chart-summary");
    if (summaryElement) {
      const highestCategoryName = highestCategory
        ? BudgetUtils.getCategoryInfo(highestCategory).name
        : "None";
      const highestPercentage =
        totalExpenses > 0
          ? Math.round((highestAmount / totalExpenses) * 100)
          : 0;

      summaryElement.innerHTML = `
        <div class="summary-item">
          <span>Total Expenses:</span>
          <strong>${BudgetUtils.formatCurrency(totalExpenses, this.app.currentCurrency)}</strong>
        </div>
        <div class="summary-item">
          <span>Average per Category:</span>
          <strong>${BudgetUtils.formatCurrency(totalExpenses / allCategories.length, this.app.currentCurrency)}</strong>
        </div>
        <div class="summary-item">
          <span>Highest Category:</span>
          <strong>${highestCategoryName} (${highestPercentage}%)</strong>
        </div>
      `;
    }
  }
}

// Initialize Chart Manager
document.addEventListener("DOMContentLoaded", () => {
  if (window.budgetTracker) {
    window.chartManager = new ChartManager(window.budgetTracker);
  }
});
