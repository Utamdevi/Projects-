// assets/js/app.js

class BudgetTrackerApp {
  constructor() {
    this.transactions = [];
    this.currentCurrency = "PKR"; // Default to Rs
    this.init();
  }

  init() {
    this.loadData();
    this.setupEventListeners();
    this.updateUI();
  }

  loadData() {
    const savedTransactions = BudgetUtils.loadFromLocalStorage("transactions");
    const savedSettings = BudgetUtils.loadFromLocalStorage("settings");

    if (savedTransactions) this.transactions = savedTransactions;
    
    // Load settings or default to PKR
    this.currentCurrency = savedSettings ? (savedSettings.currency || "PKR") : "PKR";

    // Set dropdown value
    const currencySelect = document.getElementById("currencySelect");
    if (currencySelect) currencySelect.value = this.currentCurrency;
  }

  saveData() {
    BudgetUtils.saveToLocalStorage("transactions", this.transactions);
    BudgetUtils.saveToLocalStorage("settings", {
      currency: this.currentCurrency
    });
  }

  setupEventListeners() {
    // 1. Transaction Form Submission (The Fix for "Not adding transaction")
    const form = document.getElementById("transactionForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault(); // Stop page reload
        this.handleAddTransaction();
      });
    }

    // 2. Clear Form Button
    const clearBtn = document.getElementById("clearForm");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        form.reset();
        // Reset date to today
        document.getElementById("transactionDate").valueAsDate = new Date();
      });
    }

    // 3. Hero Buttons (The Fix for "Buttons not doing anything")
    const startBtn = document.getElementById("startJourneyBtn");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        // Scroll smoothly to the Add Transaction form
        const formCard = document.querySelector(".card:has(#transactionForm)") || document.getElementById("transactionForm");
        if(formCard) formCard.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    const howItWorksBtn = document.getElementById("howItWorksBtn");
    if (howItWorksBtn) {
      howItWorksBtn.addEventListener("click", () => {
        // Scroll to the Dashboard Statistics
        const statsSection = document.querySelector(".stats-grid");
        if(statsSection) statsSection.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    // 4. Currency Selector
    const currencySelect = document.getElementById("currencySelect");
    if (currencySelect) {
      currencySelect.addEventListener("change", (e) => {
        this.currentCurrency = e.target.value;
        this.saveData();
        this.updateUI();
        // Reload page to refresh charts/reports that might not observe this change immediately
        setTimeout(() => location.reload(), 100); 
      });
    }
    
    // 5. Mobile Menu (Ensures hamburger works)
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            const icon = menuBtn.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }
  }

  handleAddTransaction() {
    // Get values
    const nameInput = document.getElementById("transactionName");
    const amountInput = document.getElementById("transactionAmount");
    const typeInput = document.getElementById("transactionType");
    const categoryInput = document.getElementById("transactionCategory");
    const dateInput = document.getElementById("transactionDate");

    const newTransaction = {
      id: BudgetUtils.generateId(),
      name: nameInput.value,
      amount: parseFloat(amountInput.value),
      type: typeInput.value,
      category: categoryInput.value,
      date: dateInput.value || new Date().toISOString().split('T')[0]
    };

    // Validation
    const errors = BudgetUtils.validateTransaction(newTransaction);
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    // Save
    this.transactions.unshift(newTransaction); // Add to top of list
    this.saveData();
    this.updateUI();

    // Reset Form
    nameInput.value = "";
    amountInput.value = "";
    nameInput.focus();

    // Notification (Optional, using simple alert if custom not available)
    // alert("Transaction added successfully!"); 
  }

  updateUI() {
    this.updateBalance();
    this.updateTransactionsList();
    this.updateStatistics();
    
    // Trigger Chart Updates if they exist
    if (window.dashboardManager) {
        window.dashboardManager.updateCharts(this.transactions, this.currentCurrency);
    }
  }

  updateBalance() {
    const total = BudgetUtils.calculateBalance(this.transactions);
    const balanceEl = document.getElementById("balanceAmount");
    if (balanceEl) {
      balanceEl.textContent = BudgetUtils.formatCurrency(total, this.currentCurrency);
      balanceEl.style.color = total >= 0 ? "#27ae60" : "#e74c3c";
    }
  }

  updateTransactionsList() {
    const list = document.getElementById("transactionsList");
    if (!list) return;

    list.innerHTML = "";
    const recent = this.transactions.slice(0, 5); // Top 5

    if (recent.length === 0) {
      list.innerHTML = `
        <div class="no-transactions-message">
           <i class="fas fa-exchange-alt"></i>
           <p>No transactions yet. Add your first transaction above!</p>
        </div>`;
      return;
    }

    recent.forEach(tx => {
      const catInfo = BudgetUtils.getCategoryInfo(tx.category);
      const isIncome = tx.type === 'income';
      
      const item = document.createElement("div");
      item.className = "transaction-item";
      item.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-icon" style="background: ${catInfo.color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                <i class="${catInfo.icon}"></i>
            </div>
            <div class="transaction-details">
                <h4 style="margin: 0; font-size: 1rem;">${tx.name}</h4>
                <span class="transaction-date" style="font-size: 0.8rem; color: #888;">${BudgetUtils.formatDate(tx.date)}</span>
            </div>
        </div>
        <div class="transaction-amount" style="font-weight: bold; color: ${isIncome ? '#27ae60' : '#e74c3c'}">
            ${isIncome ? '+' : '-'} ${BudgetUtils.formatCurrency(tx.amount, this.currentCurrency)}
        </div>
      `;
      list.appendChild(item);
    });
  }

  updateStatistics() {
    // Total Volume
    const totalEl = document.getElementById("totalTransactions");
    if (totalEl) {
        const totalVol = this.transactions.reduce((acc, t) => acc + t.amount, 0);
        totalEl.textContent = BudgetUtils.formatCurrency(totalVol, this.currentCurrency);
    }
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  window.budgetTracker = new BudgetTrackerApp();
  
  // Set default date to today
  const dateInput = document.getElementById("transactionDate");
  if(dateInput) dateInput.valueAsDate = new Date();
});