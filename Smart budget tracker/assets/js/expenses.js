// expenses.js

/* ================= INITIAL SETUP ================= */
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  renderTable();
});

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let filteredTransactions = [...transactions];

const rowsPerPage = 5;
let currentPage = 1;

/* ================= DOM ELEMENTS ================= */
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

/* ================= SAMPLE DATA (FIRST TIME) ================= */
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

/* ================= RENDER TABLE ================= */
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
        <button class="btn btn-danger btn-sm" onclick="deleteTransaction(${tx.id})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  updateSummary();
  updatePagination();
}

/* ================= SUMMARY ================= */
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

/* ================= PAGINATION ================= */
function updatePagination() {
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage) || 1;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

prevBtn.addEventListener("click", () => {
  currentPage--;
  renderTable();
});

nextBtn.addEventListener("click", () => {
  currentPage++;
  renderTable();
});

/* ================= FILTERS ================= */
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

/* ================= DELETE ================= */
function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  transactions = transactions.filter((tx) => tx.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  filteredTransactions = [...transactions];
  renderTable();
}

selectAllCheckbox.addEventListener("change", () => {
  document.querySelectorAll(".rowCheckbox").forEach((cb) => {
    cb.checked = selectAllCheckbox.checked;
  });
});

deleteSelectedBtn.addEventListener("click", () => {
  const selectedIds = [
    ...document.querySelectorAll(".rowCheckbox:checked"),
  ].map((cb) => Number(cb.dataset.id));

  if (selectedIds.length === 0) {
    alert("No transactions selected");
    return;
  }

  if (!confirm("Delete selected transactions?")) return;

  transactions = transactions.filter((tx) => !selectedIds.includes(tx.id));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  filteredTransactions = [...transactions];
  renderTable();
});

/* ================= EXPORT CSV ================= */
exportBtn.addEventListener("click", () => {
  let csv = "Date,Description,Category,Type,Amount (PKR)\n";

  filteredTransactions.forEach((tx) => {
    csv += `${tx.date},${tx.description},${tx.category},${tx.type},${tx.amount}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "transactions_pkr.csv";
  link.click();
});

/* ================= HELPERS ================= */
function formatCurrency(amount) {
  return `₨ ${amount.toLocaleString("en-PK")}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB");
}

function getMonth(date) {
  return new Date(date).getMonth() + 1;
}

function getYear(date) {
  return new Date(date).getFullYear();
}

/* ================= MOBILE MENU ================= */
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");

  if (!mobileMenuBtn || !navLinks) return;

  mobileMenuBtn.addEventListener("click", function () {
    navLinks.classList.toggle("show");
    const icon = this.querySelector("i");
    icon.className = navLinks.classList.contains("show")
      ? "fas fa-times"
      : "fas fa-bars";
  });
}
