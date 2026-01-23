// Utility Functions for Budget Tracker
class BudgetUtils {
  // Format currency based on selected currency
  static formatCurrency(amount, currency = "NGN") {
    const currencySymbols = {
      NGN: "₦",
      PKR: "₨",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
      INR: "₹",
      CNY: "¥",
      ZAR: "R",
    };

    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    });

    let formatted = formatter.format(amount);

    if (currencySymbols[currency]) {
      const defaultSymbol = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      })
        .format(0)
        .replace("0.00", "")
        .trim();
      formatted = formatted.replace(defaultSymbol, currencySymbols[currency]);
    }

    return formatted;
  }

  // Get category info with all required categories
  static getCategoryInfo(category) {
    const categories = {
      food: { icon: "fas fa-utensils", color: "#FF6B6B", name: "Food" },
      rent: { icon: "fas fa-home", color: "#4ECDC4", name: "Rent" },
      transport: { icon: "fas fa-bus", color: "#FFD166", name: "Transport" },
      shopping: {
        icon: "fas fa-shopping-bag",
        color: "#06D6A0",
        name: "Shopping",
      },
      entertainment: {
        icon: "fas fa-film",
        color: "#118AB2",
        name: "Entertainment",
      },
      other: { icon: "fas fa-ellipsis-h", color: "#073B4C", name: "Other" },
    };

    return categories[category] || categories.other;
  }

  // Get all categories
  static getAllCategories() {
    return ["food", "rent", "transport", "shopping", "entertainment", "other"];
  }

  static formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static validateTransaction(data) {
    const errors = [];
    if (!data.name || data.name.trim() === "")
      errors.push("Transaction name is required");
    if (!data.amount || data.amount <= 0)
      errors.push("Amount must be greater than 0");
    if (!data.date) errors.push("Date is required");
    return errors;
  }

  static calculatePercentage(part, total) {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  }

  static saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return false;
    }
  }

  static loadFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      return null;
    }
  }

  static showNotification(message, type = "info", duration = 3000) {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${
        type === "success"
          ? "check-circle"
          : type === "error"
            ? "exclamation-circle"
            : "info-circle"
      }"></i>
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${
        type === "success"
          ? "#d4edda"
          : type === "error"
            ? "#f8d7da"
            : "#d1ecf1"
      };
      color: ${
        type === "success"
          ? "#155724"
          : type === "error"
            ? "#721c24"
            : "#0c5460"
      };
      padding: 1rem 1.5rem;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 1000;
      animation: slideInRight 0.3s ease;
      max-width: 400px;
    `;

    document.body.appendChild(notification);

    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => notification.remove());

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOutRight 0.3s ease";
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);

    if (!document.querySelector("#notification-styles")) {
      const style = document.createElement("style");
      style.id = "notification-styles";
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        .notification-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          margin-left: auto;
        }
      `;
      document.head.appendChild(style);
    }
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Calculate totals for ALL categories (even if 0)
  static calculateCategoryTotals(transactions) {
    const allCategories = this.getAllCategories();
    const totals = {};

    // Initialize all categories to 0
    allCategories.forEach((category) => {
      totals[category] = 0;
    });

    // Calculate actual totals
    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        if (!totals[transaction.category]) {
          totals[transaction.category] = 0;
        }
        totals[transaction.category] += parseFloat(transaction.amount);
      }
    });
    return totals;
  }

  static calculateBalance(transactions, initialBalance = 0) {
    let balance = initialBalance;
    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        balance += parseFloat(transaction.amount);
      } else {
        balance -= parseFloat(transaction.amount);
      }
    });
    return balance;
  }

  // Calculate expenses by category for chart
  static getChartData(transactions, currency) {
    const totals = this.calculateCategoryTotals(transactions);
    const allCategories = this.getAllCategories();

    return {
      labels: allCategories.map((cat) => this.getCategoryInfo(cat).name),
      data: allCategories.map((cat) => totals[cat] || 0),
      colors: allCategories.map((cat) => this.getCategoryInfo(cat).color),
    };
  }
}
// utils.js

function formatCurrency(amount) {
  return "₦" + Number(amount).toLocaleString();
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

function getMonth(dateStr) {
  return new Date(dateStr).getMonth() + 1;
}

function getYear(dateStr) {
  return new Date(dateStr).getFullYear();
}
