// expenses.js
// Initialize mobile menu
initMobileMenu();
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let filteredTransactions = [...transactions];

const rowsPerPage = 5;
let currentPage = 1;

// DOM Elements
const tableBody = document.getElementById("transactionsTableBody");
const totalCount = document.getElementById("totalTransactionsCount");
const totalIncome = document.getElementById("totalIncome");
const totalExpenses = document.getElementById("totalExpenses");
const pageInfo = document.getElementById("pageInfo");

const filterCategory = document.getElementById("filterCategory");
const filterType = document.getElementById("filterType");
const filterMonth = document.getElementById("filterMonth");
const filterYear = document.getElementById("filterYear");

const prevBtn = document.getElementById("prevPageBtn");
const nextBtn = document.getElementById("nextPageBtn");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const selectAllCheckbox = document.getElementById("selectAllCheckbox");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const exportBtn = document.getElementById("exportBtn");

// Sample Data (only first time)
if (transactions.length === 0) {
  transactions = [
    {
      id: Date.now(),
      date: "2025-01-10",
      description: "Salary",
      category: "other",
      type: "income",
      amount: 120000,
    },
    {
      id: Date.now() + 1,
      date: "2025-01-12",
      description: "Food",
      category: "food",
      type: "expense",
      amount: 15000,
    },
  ];
  localStorage.setItem("transactions", JSON.stringify(transactions));
  filteredTransactions = [...transactions];
}

// Render Table
function renderTable() {
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const paginated = filteredTransactions.slice(start, start + rowsPerPage);

  paginated.forEach((tx) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><input type="checkbox" class="rowCheckbox" data-id="${tx.id}"></td>
      <td>${formatDate(tx.date)}</td>
      <td>${tx.description}</td>
      <td>${tx.category}</td>
      <td>${tx.type}</td>
      <td class="text-right">${formatCurrency(tx.amount)}</td>
      <td>
        <button onclick="deleteTransaction(${tx.id})" class="btn btn-danger btn-sm">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  updateSummary();
  updatePagination();
}

// Summary
function updateSummary() {
  totalCount.textContent = filteredTransactions.length;

  let income = 0,
    expense = 0;
  filteredTransactions.forEach((tx) => {
    tx.type === "income" ? (income += tx.amount) : (expense += tx.amount);
  });

  totalIncome.textContent = formatCurrency(income);
  totalExpenses.textContent = formatCurrency(expense);
}

// Pagination
function updatePagination() {
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage) || 1;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

// Filters
applyFiltersBtn.addEventListener("click", () => {
  filteredTransactions = transactions.filter((tx) => {
    return (
      (filterCategory.value === "all" ||
        tx.category === filterCategory.value) &&
      (filterType.value === "all" || tx.type === filterType.value) &&
      (filterMonth.value === "all" || getMonth(tx.date) == filterMonth.value) &&
      (filterYear.value === "all" || getYear(tx.date) == filterYear.value)
    );
  });

  currentPage = 1;
  renderTable();
});

// Delete Single
function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  transactions = transactions.filter((tx) => tx.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  filteredTransactions = [...transactions];
  renderTable();
}

// Select All
selectAllCheckbox.addEventListener("change", () => {
  document.querySelectorAll(".rowCheckbox").forEach((cb) => {
    cb.checked = selectAllCheckbox.checked;
  });
});

// Delete Selected
deleteSelectedBtn.addEventListener("click", () => {
  const selected = [...document.querySelectorAll(".rowCheckbox:checked")].map(
    (cb) => Number(cb.dataset.id),
  );

  if (selected.length === 0) return alert("No transactions selected");

  if (!confirm("Delete selected transactions?")) return;

  transactions = transactions.filter((tx) => !selected.includes(tx.id));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  filteredTransactions = [...transactions];
  renderTable();
});

// CSV Export
exportBtn.addEventListener("click", () => {
  let csv = "Date,Description,Category,Type,Amount\n";

  filteredTransactions.forEach((tx) => {
    csv += `${tx.date},${tx.description},${tx.category},${tx.type},${tx.amount}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "transactions.csv";
  link.click();
});

// Pagination Buttons
prevBtn.addEventListener("click", () => {
  currentPage--;
  renderTable();
});

nextBtn.addEventListener("click", () => {
  currentPage++;
  renderTable();
});

// Initial Load
renderTable();
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
