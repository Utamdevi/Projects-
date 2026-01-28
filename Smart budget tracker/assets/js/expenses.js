document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize logic
    initExpenses();
    
});

// State
let allTransactions = [];
let filteredTransactions = [];
let currentCurrency = "PKR";
let currentPage = 1;
const rowsPerPage = 10;

function initExpenses() {
    // Load Data
    allTransactions = BudgetUtils.loadFromLocalStorage("transactions") || [];
    const settings = BudgetUtils.loadFromLocalStorage("settings");
    currentCurrency = settings ? (settings.currency || "PKR") : "PKR";

    // Initial Filter State
    filteredTransactions = [...allTransactions];

    // Setup Event Listeners
    setupEventListeners();

    // Render Initial Table
    renderTable();
}

function setupEventListeners() {
    // --- Export CSV Button ---
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
        exportBtn.addEventListener("click", exportToCSV);
    }

    // --- Delete Selected Button ---
    const deleteSelBtn = document.getElementById("deleteSelectedBtn");
    if (deleteSelBtn) {
        deleteSelBtn.addEventListener("click", deleteSelectedItems);
    }

    // --- Select All Checkbox ---
    const selectAll = document.getElementById("selectAllCheckbox");
    if (selectAll) {
        selectAll.addEventListener("change", (e) => {
            const checkboxes = document.querySelectorAll(".rowCheckbox");
            checkboxes.forEach(cb => cb.checked = e.target.checked);
        });
    }

    // --- Filters ---
    document.getElementById("applyFiltersBtn").addEventListener("click", applyFilters);

    // --- Pagination ---
    document.getElementById("prevPageBtn").addEventListener("click", () => {
        if (currentPage > 1) { currentPage--; renderTable(); }
    });
    document.getElementById("nextPageBtn").addEventListener("click", () => {
        const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
        if (currentPage < totalPages) { currentPage++; renderTable(); }
    });
}

// ==========================
// CORE FUNCTIONS
// ==========================

function renderTable() {
    const tbody = document.getElementById("transactionsTableBody");
    tbody.innerHTML = "";

    // Sort by Date (Newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Pagination Logic
    const start = (currentPage - 1) * rowsPerPage;
    const paginatedItems = filteredTransactions.slice(start, start + rowsPerPage);

    if (paginatedItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem;">No transactions found.</td></tr>`;
        updateSummary();
        return;
    }

    paginatedItems.forEach(tx => {
        const row = document.createElement("tr");
        const catInfo = BudgetUtils.getCategoryInfo(tx.category);
        
        row.innerHTML = `
            <td><input type="checkbox" class="rowCheckbox" data-id="${tx.id}"></td>
            <td>${BudgetUtils.formatDate(tx.date)}</td>
            <td><strong>${tx.name}</strong></td>
            <td>
                <span style="display:inline-flex; align-items:center; gap:5px; background:${catInfo.color}20; color:${catInfo.color}; padding: 4px 10px; border-radius:15px; font-size:0.85rem; font-weight:600;">
                    <i class="${catInfo.icon}"></i> ${catInfo.name}
                </span>
            </td>
            <td><span class="type-badge ${tx.type}">${tx.type.toUpperCase()}</span></td>
            <td class="text-right" style="font-weight:bold; color: ${tx.type === 'income' ? '#27ae60' : '#e74c3c'}">
                ${tx.type === 'income' ? '+' : '-'} ${BudgetUtils.formatCurrency(tx.amount, currentCurrency)}
            </td>
            <td>
                <button class="btn-icon btn-delete" onclick="deleteSingleTransaction('${tx.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    updateSummary();
    updatePagination();
    
    // Uncheck "Select All" when changing pages
    const selectAll = document.getElementById("selectAllCheckbox");
    if(selectAll) selectAll.checked = false;
}

function updateSummary() {
    document.getElementById("totalTransactionsCount").textContent = filteredTransactions.length;
    
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    document.getElementById("totalIncome").textContent = BudgetUtils.formatCurrency(income, currentCurrency);
    document.getElementById("totalExpenses").textContent = BudgetUtils.formatCurrency(expense, currentCurrency);
}

function updatePagination() {
    const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage) || 1;
    document.getElementById("pageInfo").textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById("prevPageBtn").disabled = currentPage === 1;
    document.getElementById("nextPageBtn").disabled = currentPage === totalPages;
}

// ==========================
// FILTER LOGIC
// ==========================

function applyFilters() {
    const category = document.getElementById("filterCategory").value;
    const type = document.getElementById("filterType").value;
    const month = document.getElementById("filterMonth").value;
    const year = document.getElementById("filterYear").value;

    filteredTransactions = allTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        
        const matchCat = category === "all" || tx.category === category;
        const matchType = type === "all" || tx.type === type;
        const matchMonth = month === "all" || (txDate.getMonth() + 1) == month;
        const matchYear = year === "all" || txDate.getFullYear() == year;

        return matchCat && matchType && matchMonth && matchYear;
    });

    currentPage = 1;
    renderTable();
}

// ==========================
// EXPORT CSV LOGIC
// ==========================

function exportToCSV() {
    if (filteredTransactions.length === 0) {
        alert("No transactions to export.");
        return;
    }

    // 1. Define Headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Name,Category,Type,Amount\n";

    // 2. Add Data Rows
    filteredTransactions.forEach(tx => {
        const row = [
            tx.date,
            `"${tx.name}"`, // Quote name to handle commas inside name
            tx.category,
            tx.type,
            tx.amount
        ].join(",");
        csvContent += row + "\n";
    });

    // 3. Trigger Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = `spendora_export_${new Date().toISOString().slice(0,10)}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==========================
// DELETE LOGIC
// ==========================

function deleteSelectedItems() {
    const checkboxes = document.querySelectorAll(".rowCheckbox:checked");
    if (checkboxes.length === 0) {
        alert("Please select items to delete.");
        return;
    }

    if (confirm(`Are you sure you want to delete ${checkboxes.length} transaction(s)?`)) {
        const idsToDelete = Array.from(checkboxes).map(cb => cb.dataset.id);
        
        // Filter OUT the deleted items
        allTransactions = allTransactions.filter(tx => !idsToDelete.includes(tx.id));
        
        // Save and Reload
        BudgetUtils.saveToLocalStorage("transactions", allTransactions);
        
        // Re-apply filters to current view
        applyFilters(); 
    }
}

// Expose single delete to global scope for the inline onclick handler
window.deleteSingleTransaction = function(id) {
    if (confirm("Delete this transaction?")) {
        allTransactions = allTransactions.filter(tx => tx.id !== id);
        BudgetUtils.saveToLocalStorage("transactions", allTransactions);
        applyFilters();
    }
};