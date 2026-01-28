// assets/js/dashboard.js

class DashboardManager {
    constructor() {
        this.chartInstance = null;
    }

    updateCharts(transactions, currency) {
        const ctx = document.getElementById('expenseChart');
        if (!ctx) return;

        // 1. Filter for Expenses only
        const expenses = transactions.filter(t => t.type === 'expense');
        
        // 2. Calculate Totals by Category
        const totals = {};
        BudgetUtils.getAllCategories().forEach(cat => totals[cat] = 0);
        
        let totalExpenseAmount = 0;
        expenses.forEach(t => {
            if (totals[t.category] !== undefined) {
                totals[t.category] += t.amount;
                totalExpenseAmount += t.amount;
            }
        });

        // 3. Prepare Data for Chart.js
        const categories = BudgetUtils.getAllCategories();
        let dataValues = categories.map(cat => totals[cat]);
        let labels = categories.map(cat => BudgetUtils.getCategoryInfo(cat).name);
        let colors = categories.map(cat => BudgetUtils.getCategoryInfo(cat).color);

        // --- EMPTY STATE FIX ---
        // If no expenses, show a placeholder grey chart
        if (totalExpenseAmount === 0) {
            dataValues = [1]; // Dummy value to make a full circle
            labels = ["No Expenses Yet"];
            colors = ["#e0e0e0"]; // Grey color
        }

        // 4. Update Text Summaries
        const totalExpEl = document.getElementById('totalExpense');
        if(totalExpEl) totalExpEl.textContent = BudgetUtils.formatCurrency(totalExpenseAmount, currency);

        const catCountEl = document.getElementById('categoryCount');
        if(catCountEl) catCountEl.textContent = categories.filter(c => totals[c] > 0).length;

        // 5. Find Highest Spending Category
        let highestCat = "-";
        let highestAmt = 0;
        for (const [cat, val] of Object.entries(totals)) {
            if (val > highestAmt) {
                highestAmt = val;
                highestCat = BudgetUtils.getCategoryInfo(cat).name;
            }
        }
        const highEl = document.getElementById('highestExpense');
        if(highEl) highEl.textContent = highestCat;

        // 6. Render Chart
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: dataValues,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: totalExpenseAmount === 0 ? 0 : 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%', // Thinner ring for modern look
                plugins: {
                    legend: { 
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 10
                        }
                    },
                    tooltip: {
                        enabled: totalExpenseAmount > 0 // Disable tooltip for placeholder
                    }
                }
            }
        });
        
        // 7. Render Custom Legend/List
        this.renderCategoryList(totals, currency);
    }
    
    renderCategoryList(totals, currency) {
        const list = document.getElementById('categoriesList');
        if(!list) return;
        
        list.innerHTML = '';
        const categories = BudgetUtils.getAllCategories();
        
        // Only show categories that have spending
        const activeCategories = categories.filter(cat => totals[cat] > 0);

        if (activeCategories.length === 0) {
            list.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #999; padding: 10px;">Add an expense to see details here.</div>';
            return;
        }

        activeCategories.forEach(cat => {
            const info = BudgetUtils.getCategoryInfo(cat);
            const div = document.createElement('div');
            div.className = 'category-item'; 
            // Inline styles to ensure it looks good even if CSS is lagging
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.style.padding = '10px';
            div.style.background = 'rgba(255,255,255,0.05)';
            div.style.borderRadius = '8px';
            div.style.marginBottom = '5px';
            
            div.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="width:12px; height:12px; border-radius:50%; background:${info.color}"></span>
                    <span style="color:black; font-size:0.9rem;">${info.name}</span>
                </div>
                <span style="color:black; font-weight:bold; font-size:0.9rem;">${BudgetUtils.formatCurrency(totals[cat], currency)}</span>
            `;
            list.appendChild(div);
        });
    }
}

// Initialize on load immediately
document.addEventListener("DOMContentLoaded", () => {
    window.dashboardManager = new DashboardManager();
    
    // Initial Paint: Fetch data from storage directly to handle page reload
    const tx = BudgetUtils.loadFromLocalStorage("transactions") || [];
    const settings = BudgetUtils.loadFromLocalStorage("settings");
    const currency = settings ? (settings.currency || "PKR") : "PKR";
    
    window.dashboardManager.updateCharts(tx, currency);
});