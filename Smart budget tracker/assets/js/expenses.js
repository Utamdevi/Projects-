// Expenses Management
let transactions = JSON.parse(localStorage.getItem("budgetTransactions")) || [];
let filteredTransactions = [];
let selectedCurrency = localStorage.getItem("selectedCurrency") || "NGN";
let currentPage = 1;
const itemsPerPage = 10;
let selectedTransactions = new Set();

// Filters
let filters = {
  category: "all",
  type: "all",
  month: "all",
  year: "all",
};
// Initialize mobile menu
initMobileMenu();

// Initialize expenses page
document.addEventListener("DOMContentLoaded", function () {
  initPage();
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

// Initialize the page
function initPage() {
  loadTransactions();
  setupEventListeners();
  updateSummary();
  updatePagination();
  updateCurrencySelect();
}

// Setup event listeners
function setupEventListeners() {
  // Filter elements
  const filterCategory = document.getElementById("filterCategory");
  const filterType = document.getElementById("filterType");
  const filterMonth = document.getElementById("filterMonth");
  const filterYear = document.getElementById("filterYear");
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  // Apply filters button
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", applyFilters);
  }

  // Clear filters button
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", clearFilters);
  }

  // Filter change events
  if (filterCategory) {
    filterCategory.addEventListener("change", updateCategoryOptions);
  }

  // Table actions
  const exportBtn = document.getElementById("exportBtn");
  const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");

  if (exportBtn) {
    exportBtn.addEventListener("click", exportToCSV);
  }

  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener("click", deleteSelectedTransactions);
  }

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", toggleSelectAll);
  }

  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", goToPrevPage);
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", goToNextPage);
  }

  // Currency selector
  const currencySelect = document.getElementById("currencySelectCategories");
  if (currencySelect) {
    currencySelect.value = selectedCurrency;
    currencySelect.addEventListener("change", function () {
      selectedCurrency = this.value;
      localStorage.setItem("selectedCurrency", selectedCurrency);
      updateSummary();
      loadTransactions();
    });
  }
}

// Load and display transactions
function loadTransactions() {
  const tableBody = document.getElementById("transactionsTableBody");
  const categories = JSON.parse(localStorage.getItem("budgetCategories")) || [];

  // Get categories for dropdown
  updateCategoryOptions();

  // Apply filters
  filterTransactions();

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex,
  );

  if (filteredTransactions.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="fas fa-exchange-alt"></i>
                        <p>No transactions found. Try adjusting your filters or add some transactions.</p>
                    </div>
                </td>
            </tr>
        `;
    return;
  }

  let tableHTML = "";

  paginatedTransactions.forEach((transaction) => {
    const isSelected = selectedTransactions.has(transaction.id);
    const date = new Date(transaction.date);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const isExpense = transaction.type === "expense";
    const typeClass = isExpense ? "expense" : "income";
    const typeText = isExpense ? "Expense" : "Income";
    const amountColor = isExpense ? "danger" : "success";

    // Get category color and icon
    const categoryData = categories.find(
      (cat) => cat.name === transaction.category,
    );
    const categoryColor = categoryData ? categoryData.color : "#36A2EB";
    const categoryIcon = categoryData ? categoryData.icon : "fas fa-tag";

    tableHTML += `
            <tr class="${isSelected ? "selected" : ""}">
                <td>
                    <input type="checkbox" 
                           class="transaction-checkbox" 
                           data-id="${transaction.id}"
                           ${isSelected ? "checked" : ""}>
                </td>
                <td>${formattedDate}</td>
                <td>${transaction.name}</td>
                <td>
                    <span class="category-badge" style="background-color: ${categoryColor}20; color: ${categoryColor};">
                        <i class="${categoryIcon}"></i>
                        ${transaction.category}
                    </span>
                </td>
                <td><span class="type-badge ${typeClass}">${typeText}</span></td>
                <td class="text-right ${amountColor}">
                    ${isExpense ? "-" : "+"}${getCurrencySymbol()}${transaction.amount.toFixed(2)}
                </td>
                <td class="actions-cell">
                    <button class="btn-icon btn-edit" onclick="editTransaction(${transaction.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteTransaction(${transaction.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
  });

  tableBody.innerHTML = tableHTML;

  // Add event listeners to checkboxes
  const checkboxes = document.querySelectorAll(".transaction-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", handleCheckboxChange);
  });

  updatePagination();
  updateSummary();
}

// Update category options in filter dropdown
function updateCategoryOptions() {
  const categories = JSON.parse(localStorage.getItem("budgetCategories")) || [];
  const filterCategory = document.getElementById("filterCategory");

  if (!filterCategory) return;

  // Save current value
  const currentValue = filterCategory.value;

  // Clear existing options except "All Categories"
  filterCategory.innerHTML = '<option value="all">All Categories</option>';

  // Add categories from localStorage
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    filterCategory.appendChild(option);
  });

  // Restore selected value if it still exists
  if (
    currentValue &&
    Array.from(filterCategory.options).some((opt) => opt.value === currentValue)
  ) {
    filterCategory.value = currentValue;
  } else {
    filterCategory.value = filters.category;
  }
}

// Apply filters
function applyFilters() {
  filters = {
    category: document.getElementById("filterCategory").value,
    type: document.getElementById("filterType").value,
    month: document.getElementById("filterMonth").value,
    year: document.getElementById("filterYear").value,
  };

  currentPage = 1;
  loadTransactions();
}

// Clear all filters
function clearFilters() {
  document.getElementById("filterCategory").value = "all";
  document.getElementById("filterType").value = "all";
  document.getElementById("filterMonth").value = "all";
  document.getElementById("filterYear").value = "all";

  filters = {
    category: "all",
    type: "all",
    month: "all",
    year: "all",
  };

  currentPage = 1;
  loadTransactions();
}

// Filter transactions based on current filters
function filterTransactions() {
  filteredTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);

    // Category filter
    if (
      filters.category !== "all" &&
      transaction.category !== filters.category
    ) {
      return false;
    }

    // Type filter
    if (filters.type !== "all" && transaction.type !== filters.type) {
      return false;
    }

    // Month filter
    if (
      filters.month !== "all" &&
      date.getMonth() + 1 !== parseInt(filters.month)
    ) {
      return false;
    }

    // Year filter
    if (
      filters.year !== "all" &&
      date.getFullYear() !== parseInt(filters.year)
    ) {
      return false;
    }

    return true;
  });

  // Sort by date (newest first)
  filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Update summary information
function updateSummary() {
  const totalTransactions = filteredTransactions.length;
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  document.getElementById("totalTransactionsCount").textContent =
    totalTransactions;
  document.getElementById("totalIncome").textContent =
    `${getCurrencySymbol()}${totalIncome.toFixed(2)}`;
  document.getElementById("totalExpenses").textContent =
    `${getCurrencySymbol()}${totalExpenses.toFixed(2)}`;
}

// Update pagination controls
function updatePagination() {
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const pageInfo = document.getElementById("pageInfo");
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");

  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
  }

  if (prevPageBtn) {
    prevPageBtn.disabled = currentPage === 1;
  }

  if (nextPageBtn) {
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
  }

  // Update select all checkbox
  if (selectAllCheckbox) {
    const currentPageTransactions = filteredTransactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
    const allSelected =
      currentPageTransactions.length > 0 &&
      currentPageTransactions.every((t) => selectedTransactions.has(t.id));
    selectAllCheckbox.checked = allSelected;
    selectAllCheckbox.indeterminate =
      !allSelected &&
      currentPageTransactions.some((t) => selectedTransactions.has(t.id));
  }
}

// Go to previous page
function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    loadTransactions();
  }
}

// Go to next page
function goToNextPage() {
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    loadTransactions();
  }
}

// Handle checkbox changes
function handleCheckboxChange(event) {
  const transactionId = parseInt(event.target.dataset.id);

  if (event.target.checked) {
    selectedTransactions.add(transactionId);
  } else {
    selectedTransactions.delete(transactionId);
  }

  // Update select all checkbox state
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  if (selectAllCheckbox) {
    const currentPageTransactions = filteredTransactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
    const allSelected =
      currentPageTransactions.length > 0 &&
      currentPageTransactions.every((t) => selectedTransactions.has(t.id));
    selectAllCheckbox.checked = allSelected;
    selectAllCheckbox.indeterminate =
      !allSelected &&
      currentPageTransactions.some((t) => selectedTransactions.has(t.id));
  }

  // Update row style
  const row = event.target.closest("tr");
  if (event.target.checked) {
    row.classList.add("selected");
  } else {
    row.classList.remove("selected");
  }
}

// Toggle select all checkboxes on current page
function toggleSelectAll(event) {
  const currentPageTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (event.target.checked) {
    currentPageTransactions.forEach((transaction) => {
      selectedTransactions.add(transaction.id);
    });
  } else {
    currentPageTransactions.forEach((transaction) => {
      selectedTransactions.delete(transaction.id);
    });
  }

  // Update UI
  loadTransactions();
}

// Delete selected transactions
function deleteSelectedTransactions() {
  if (selectedTransactions.size === 0) {
    showNotification("Please select transactions to delete", "error");
    return;
  }

  if (
    !confirm(
      `Are you sure you want to delete ${selectedTransactions.size} transaction(s)? This action cannot be undone.`,
    )
  ) {
    return;
  }

  // Filter out selected transactions
  transactions = transactions.filter(
    (transaction) => !selectedTransactions.has(transaction.id),
  );

  // Save to localStorage
  localStorage.setItem("budgetTransactions", JSON.stringify(transactions));

  // Clear selection
  selectedTransactions.clear();

  // Update dashboard if it's open
  if (typeof updateChart === "function") {
    updateChart();
  }

  // Update UI
  loadTransactions();
  showNotification(
    `${selectedTransactions.size} transaction(s) deleted successfully`,
    "success",
  );

  // Clear selection set
  selectedTransactions.clear();
}

// Delete single transaction
function deleteTransaction(id) {
  if (
    !confirm(
      "Are you sure you want to delete this transaction? This action cannot be undone.",
    )
  ) {
    return;
  }

  // Remove from transactions array
  transactions = transactions.filter((transaction) => transaction.id !== id);

  // Remove from selected set if present
  selectedTransactions.delete(id);

  // Save to localStorage
  localStorage.setItem("budgetTransactions", JSON.stringify(transactions));

  // Update dashboard if it's open
  if (typeof updateChart === "function") {
    updateChart();
  }

  // Update UI
  loadTransactions();
  showNotification("Transaction deleted successfully", "success");
}

// Edit transaction (open modal)
function editTransaction(id) {
  const transaction = transactions.find((t) => t.id === id);
  if (!transaction) return;

  // Create modal for editing
  const modalHTML = `
        <div class="modal active" id="editTransactionModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Transaction</h3>
                    <button class="modal-close" onclick="closeEditModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editTransactionForm" onsubmit="saveTransactionEdit(event, ${id})">
                        <div class="form-group">
                            <label for="editTransactionName">Description</label>
                            <input type="text" class="form-control" id="editTransactionName" 
                                   value="${transaction.name}" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editTransactionType">Type</label>
                                <select class="form-control" id="editTransactionType">
                                    <option value="expense" ${transaction.type === "expense" ? "selected" : ""}>Expense</option>
                                    <option value="income" ${transaction.type === "income" ? "selected" : ""}>Income</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="editTransactionCategory">Category</label>
                                <select class="form-control" id="editTransactionCategory">
                                    <!-- Categories will be loaded by JavaScript -->
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editTransactionAmount">Amount</label>
                                <div class="input-with-currency">
                                    <span class="currency-symbol">${getCurrencySymbol()}</span>
                                    <input type="number" class="form-control" id="editTransactionAmount"
                                           value="${transaction.amount}" min="0" step="0.01" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="editTransactionDate">Date</label>
                                <input type="date" class="form-control" id="editTransactionDate"
                                       value="${transaction.date}" required>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Save Changes
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="closeEditModal()">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

  // Add modal to body
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer.firstElementChild);

  // Load categories
  loadCategoriesForEdit();
}

// Load categories for edit modal
function loadCategoriesForEdit() {
  const categories = JSON.parse(localStorage.getItem("budgetCategories")) || [];
  const select = document.getElementById("editTransactionCategory");
  const currentTransaction = transactions.find((t) => t.id === arguments[0]); // Get transaction from closure

  if (select) {
    select.innerHTML = "";

    // Add categories from localStorage
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.name;
      option.textContent = category.name;
      if (currentTransaction && currentTransaction.category === category.name) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    // Add default option if no categories exist
    if (categories.length === 0) {
      const option = document.createElement("option");
      option.value = "other";
      option.textContent = "Other";
      if (currentTransaction && currentTransaction.category === "other") {
        option.selected = true;
      }
      select.appendChild(option);
    }
  }
}

// Save transaction edit
function saveTransactionEdit(event, id) {
  event.preventDefault();

  const transactionIndex = transactions.findIndex((t) => t.id === id);
  if (transactionIndex === -1) return;

  // Get updated values
  const updatedTransaction = {
    ...transactions[transactionIndex],
    name: document.getElementById("editTransactionName").value.trim(),
    type: document.getElementById("editTransactionType").value,
    category: document.getElementById("editTransactionCategory").value,
    amount: parseFloat(document.getElementById("editTransactionAmount").value),
    date: document.getElementById("editTransactionDate").value,
  };

  // Update transaction
  transactions[transactionIndex] = updatedTransaction;

  // Save to localStorage
  localStorage.setItem("budgetTransactions", JSON.stringify(transactions));

  // Update dashboard if it's open
  if (typeof updateChart === "function") {
    updateChart();
  }

  // Close modal and update UI
  closeEditModal();
  loadTransactions();
  showNotification("Transaction updated successfully", "success");
}

// Close edit modal
function closeEditModal() {
  const modal = document.getElementById("editTransactionModal");
  if (modal) {
    modal.remove();
  }
}

// Export to CSV
function exportToCSV() {
  if (filteredTransactions.length === 0) {
    showNotification("No transactions to export", "error");
    return;
  }

  // Create CSV content
  const headers = [
    "Date",
    "Description",
    "Category",
    "Type",
    "Amount",
    "Currency",
  ];
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(","));

  // Add transaction data
  filteredTransactions.forEach((transaction) => {
    const date = new Date(transaction.date).toLocaleDateString("en-US");
    const row = [
      `"${date}"`,
      `"${transaction.name}"`,
      `"${transaction.category}"`,
      `"${transaction.type}"`,
      transaction.amount.toFixed(2),
      selectedCurrency,
    ];
    csvRows.push(row.join(","));
  });

  // Create CSV string
  const csvString = csvRows.join("\n");

  // Create download link
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  showNotification("CSV exported successfully", "success");
}

// Get currency symbol
function getCurrencySymbol() {
  const symbols = {
    NGN: "₦",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    PKR: "₨",
    CAD: "C$",
    AUD: "A$",
    INR: "₹",
    CNY: "¥",
    ZAR: "R",
  };

  return symbols[selectedCurrency] || "₦";
}

// Update currency select dropdown
function updateCurrencySelect() {
  const currencySelect = document.getElementById("currencySelectCategories");
  if (currencySelect) {
    currencySelect.value = selectedCurrency;
  }
}

// Show notification
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => {
    notification.remove();
  });

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
        <span>${message}</span>
    `;

  // Add styles
  const style = document.createElement("style");
  style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        }
        .notification-success {
            border-left: 4px solid #4CAF50;
            color: #2E7D32;
        }
        .notification-error {
            border-left: 4px solid #F44336;
            color: #C62828;
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
  document.head.appendChild(style);

  // Add to document
  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 300);
  }, 3000);
}

// Make functions available globally
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
window.saveTransactionEdit = saveTransactionEdit;
window.closeEditModal = closeEditModal;
