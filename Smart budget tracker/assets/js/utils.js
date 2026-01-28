// assets/js/utils.js

class BudgetUtils {
  // --- Currency & Formatting ---
  static formatCurrency(amount, currency = "PKR") {
    const currencySymbols = {
      PKR: "Rs",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
      INR: "₹",
      CNY: "¥",
      ZAR: "R",
      NGN: "₦"
    };

    const formatter = new Intl.NumberFormat("en-PK", { // Use en-PK locale
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0, // Rs usually doesn't need decimals for large amounts
    });

    let formatted = formatter.format(amount);

    // Force the symbol replacement if needed
    if (currencySymbols[currency]) {
       // Strip default symbols usually added by Intl
       const rawVal = new Intl.NumberFormat("en-US", { 
           minimumFractionDigits: 0 
       }).format(amount);
       return `${currencySymbols[currency]} ${rawVal}`;
    }

    return formatted;
  }

  static formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric", month: "short", day: "numeric"
    });
  }

  // --- Data Helpers ---
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static getCategoryInfo(category) {
    const categories = {
      food: { icon: "fas fa-utensils", color: "#FF6B6B", name: "Food" },
      rent: { icon: "fas fa-home", color: "#4ECDC4", name: "Rent" },
      transport: { icon: "fas fa-bus", color: "#FFD166", name: "Transport" },
      shopping: { icon: "fas fa-shopping-bag", color: "#06D6A0", name: "Shopping" },
      entertainment: { icon: "fas fa-film", color: "#118AB2", name: "Entertainment" },
      other: { icon: "fas fa-ellipsis-h", color: "#073B4C", name: "Other" },
    };
    return categories[category] || categories.other;
  }

  static getAllCategories() {
    return ["food", "rent", "transport", "shopping", "entertainment", "other"];
  }

  // --- Validation & Storage ---
  static validateTransaction(data) {
    const errors = [];
    if (!data.name || data.name.trim() === "") errors.push("Name is required");
    if (!data.amount || data.amount <= 0) errors.push("Amount must be > 0");
    if (!data.date) errors.push("Date is required");
    return errors;
  }

  static saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  static loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  // --- Calculations ---
  static calculateCategoryTotals(transactions) {
    const totals = {};
    this.getAllCategories().forEach(cat => totals[cat] = 0);
    
    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        if (!totals[tx.category]) totals[tx.category] = 0;
        totals[tx.category] += parseFloat(tx.amount);
      }
    });
    return totals;
  }

  static calculateBalance(transactions, initialBalance = 0) {
    return transactions.reduce((acc, tx) => {
      return tx.type === 'income' ? acc + parseFloat(tx.amount) : acc - parseFloat(tx.amount);
    }, initialBalance);
  }

  static calculatePercentage(part, total) {
      if(total === 0) return 0;
      return Math.round((part / total) * 100);
  }

  // --- Notification System ---
  static showNotification(message, type = "info") {
    // Create container if it doesn't exist
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 1000;";
        document.body.appendChild(container);
    }

    const notif = document.createElement("div");
    const colors = { success: "#2ecc71", error: "#e74c3c", info: "#3498db" };
    
    notif.style.cssText = `
        background: ${colors[type] || colors.info}; color: white; padding: 15px; 
        margin-bottom: 10px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        display: flex; align-items: center; gap: 10px; min-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    
    notif.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
    
    container.appendChild(notif);

    // Remove after 3 seconds
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(100%)';
        notif.style.transition = 'all 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
  }

  // NEW: Reset Logic
  static resetApp() {
    if (confirm("⚠️ RESET DEMO MODE?\n\nThis will delete ALL transactions, settings, and profile data.\n\nThe app will reload to a fresh state.")) {
      // 1. Clear LocalStorage
      localStorage.clear();
      
      // 2. Set Default "Fresh" Settings immediately (Optional, safeguards the reload)
      const defaultSettings = {
        currency: "PKR",
        balance: 0,
        budgetLimits: { food: 50000, rent: 150000, transport: 30000, shopping: 40000, entertainment: 20000, other: 10000 }
      };
      localStorage.setItem("settings", JSON.stringify(defaultSettings));

      // 3. Reload Page
      window.location.href = "index.html";
    }
  }
}