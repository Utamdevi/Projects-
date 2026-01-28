// History-specific JavaScript
let currentPage = 1;
const entriesPerPage = 10;
let filteredEntries = [];

document.addEventListener("DOMContentLoaded", function () {
  // Load mood data
  loadMoodData();

  // Initialize history
  initializeHistory();

  // Set up event listeners
  setupHistoryListeners();
});

function initializeHistory() {
  // Get all entries
  filteredEntries = Object.values(moodData)
    .map((entry) => ({
      ...entry,
      dateObj: new Date(entry.date),
    }))
    .sort((a, b) => b.dateObj - a.dateObj); // Newest first

  // Update stats
  updateHistoryStats();

  // Render first page
  renderHistoryPage();
}

function setupHistoryListeners() {
  // Search input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterEntries();
    });
  }

  // Mood filter
  const moodFilter = document.getElementById("moodFilter");
  if (moodFilter) {
    moodFilter.addEventListener("change", function () {
      filterEntries();
    });
  }

  // Date filter
  const dateFilter = document.getElementById("dateFilter");
  if (dateFilter) {
    dateFilter.addEventListener("change", function () {
      filterEntries();
    });
  }

  // Sort filter
  const sortFilter = document.getElementById("sortFilter");
  if (sortFilter) {
    sortFilter.addEventListener("change", function () {
      filterEntries();
    });
  }

  // Export button
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportHistory);
  }

  // Print button
  const printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      window.print();
    });
  }

  // Clear all button
  const clearAllBtn = document.getElementById("clearAllBtn");
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", function () {
      if (
        confirm(
          "Are you sure you want to delete all your mood entries? This cannot be undone.",
        )
      ) {
        clearAllEntries();
      }
    });
  }

  // Pagination buttons
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");

  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;
        renderHistoryPage();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", function () {
      const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderHistoryPage();
      }
    });
  }
}

function filterEntries() {
  // Get filter values
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const moodFilterValue = document.getElementById("moodFilter").value;
  const dateFilterValue = document.getElementById("dateFilter").value;
  const sortOrder = document.getElementById("sortFilter").value;

  // Get all entries
  let entries = Object.values(moodData).map((entry) => ({
    ...entry,
    dateObj: new Date(entry.date),
  }));

  // Apply filters
  // 1. Mood filter
  if (moodFilterValue !== "all") {
    entries = entries.filter((entry) => entry.mood === moodFilterValue);
  }

  // 2. Date filter
  const now = new Date();
  let startDate = new Date(0); // Beginning of time

  if (dateFilterValue === "week") {
    startDate = new Date();
    startDate.setDate(now.getDate() - 7);
  } else if (dateFilterValue === "month") {
    startDate = new Date();
    startDate.setMonth(now.getMonth() - 1);
  } else if (dateFilterValue === "year") {
    startDate = new Date();
    startDate.setFullYear(now.getFullYear() - 1);
  }

  entries = entries.filter((entry) => entry.dateObj >= startDate);

  // 3. Search filter
  if (searchTerm) {
    entries = entries.filter(
      (entry) => entry.note && entry.note.toLowerCase().includes(searchTerm),
    );
  }

  // 4. Sort
  if (sortOrder === "newest") {
    entries.sort((a, b) => b.dateObj - a.dateObj);
  } else if (sortOrder === "oldest") {
    entries.sort((a, b) => a.dateObj - b.dateObj);
  }

  // Update filtered entries
  filteredEntries = entries;
  currentPage = 1; // Reset to first page

  // Update UI
  updateHistoryStats();
  renderHistoryPage();
}

function renderHistoryPage() {
  const container = document.getElementById("historyContainer");

  // Calculate pagination
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const pageEntries = filteredEntries.slice(startIndex, endIndex);

  // Update pagination buttons
  updatePagination();

  if (pageEntries.length === 0) {
    container.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-clipboard-list"></i>
                <h3>No entries found</h3>
                <p>${filteredEntries.length === 0 ? "No mood entries yet. Start tracking today!" : "Try changing your filters"}</p>
            </div>
        `;
    return;
  }

  let html = "";

  pageEntries.forEach((entry) => {
    // Format the date
    const formattedDate = entry.dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Mood emoji and name
    const moodEmoji = {
      happy: "😊",
      sad: "😢",
      neutral: "😐",
      angry: "😠",
    };

    const moodName = entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1);

    html += `
        <div class="history-entry">
            <div class="entry-header">
                <div class="entry-date">${formattedDate}</div>
                <div class="entry-actions">
                    <button class="edit-entry" data-date="${entry.date}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-entry" data-date="${entry.date}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="entry-body">
                <div class="entry-mood ${`mood-${entry.mood}`}">
                    <span class="mood-emoji">${moodEmoji[entry.mood]}</span>
                    <span class="mood-name">${moodName}</span>
                </div>
                <div class="entry-note">
                    <p>${entry.note || "No note provided"}</p>
                </div>
            </div>
        </div>
        `;
  });

  container.innerHTML = html;

  // Add event listeners to edit and delete buttons
  container.querySelectorAll(".edit-entry").forEach((btn) => {
    btn.addEventListener("click", function () {
      const date = this.getAttribute("data-date");
      editEntry(date);
    });
  });

  container.querySelectorAll(".delete-entry").forEach((btn) => {
    btn.addEventListener("click", function () {
      const date = this.getAttribute("data-date");
      deleteEntry(date);
    });
  });
}

function updatePagination() {
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  const currentPageElement = document.getElementById("currentPage");
  const totalPagesElement = document.getElementById("totalPages");
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");

  if (currentPageElement) currentPageElement.textContent = currentPage;
  if (totalPagesElement) totalPagesElement.textContent = totalPages;

  if (prevPageBtn) {
    prevPageBtn.disabled = currentPage <= 1;
  }

  if (nextPageBtn) {
    nextPageBtn.disabled = currentPage >= totalPages;
  }
}

function updateHistoryStats() {
  // Update total entries
  document.getElementById("totalEntriesCount").textContent =
    Object.keys(moodData).length;

  // Update showing count
  document.getElementById("showingCount").textContent = filteredEntries.length;

  // Update date range
  const dateFilter = document.getElementById("dateFilter");
  if (dateFilter) {
    const dateFilterValue = dateFilter.value;
    let dateRangeText = "";

    switch (dateFilterValue) {
      case "week":
        dateRangeText = "Last 7 days";
        break;
      case "month":
        dateRangeText = "Last 30 days";
        break;
      case "year":
        dateRangeText = "Last year";
        break;
      default:
        dateRangeText = "All time";
    }

    document.getElementById("dateRange").textContent = dateRangeText;
  }
}

function editEntry(date) {
  const entry = moodData[date];
  if (!entry) return;

  // Prompt for new mood
  const newMood = prompt(
    "Enter new mood (happy, sad, neutral, angry):",
    entry.mood,
  );
  if (!newMood || !["happy", "sad", "neutral", "angry"].includes(newMood)) {
    alert("Invalid mood. Please enter one of: happy, sad, neutral, angry");
    return;
  }

  // Prompt for new note
  const newNote = prompt("Enter new note (or leave empty):", entry.note || "");

  // Update entry
  moodData[date] = {
    mood: newMood,
    note: newNote,
    date: date,
  };

  // Save to localStorage
  saveMoodData();

  // Re-initialize history
  initializeHistory();

  alert("Entry updated successfully!");
}

function deleteEntry(date) {
  if (!confirm("Are you sure you want to delete this entry?")) {
    return;
  }

  // Delete entry
  delete moodData[date];

  // Save to localStorage
  saveMoodData();

  // Re-initialize history
  initializeHistory();

  alert("Entry deleted successfully!");
}

function clearAllEntries() {
  // Clear all entries
  moodData = {};

  // Save to localStorage
  saveMoodData();

  // Re-initialize history
  initializeHistory();

  alert("All entries have been deleted.");
}

function exportHistory() {
  if (filteredEntries.length === 0) {
    alert("No entries to export with the current filters.");
    return;
  }

  // Convert filtered entries to CSV format
  let csvContent = "Date,Mood,Note\n";

  filteredEntries.forEach((entry) => {
    const row = [
      entry.date,
      entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1),
      `"${(entry.note || "").replace(/"/g, '""')}"`,
    ];
    csvContent += row.join(",") + "\n";
  });

  // Create a download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `mood-history-${new Date().toISOString().slice(0, 10)}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  alert("Your filtered history has been exported as a CSV file!");
}
