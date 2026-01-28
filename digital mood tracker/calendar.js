// Calendar-specific JavaScript
let currentViewDate = new Date();
let isYearView = false;

document.addEventListener("DOMContentLoaded", function () {
  // Load mood data
  loadMoodData();

  // Initialize calendar
  renderMonthCalendar();
  updateMonthStats();

  // Set up event listeners
  setupCalendarListeners();
});

function setupCalendarListeners() {
  // Navigation buttons
  document.getElementById("prevMonth").addEventListener("click", function () {
    currentViewDate.setMonth(currentViewDate.getMonth() - 1);
    if (isYearView) {
      renderYearCalendar();
    } else {
      renderMonthCalendar();
    }
    updateMonthStats();
  });

  document.getElementById("nextMonth").addEventListener("click", function () {
    currentViewDate.setMonth(currentViewDate.getMonth() + 1);
    if (isYearView) {
      renderYearCalendar();
    } else {
      renderMonthCalendar();
    }
    updateMonthStats();
  });

  document.getElementById("prevYear").addEventListener("click", function () {
    currentViewDate.setFullYear(currentViewDate.getFullYear() - 1);
    if (isYearView) {
      renderYearCalendar();
    } else {
      renderMonthCalendar();
    }
    updateMonthStats();
  });

  document.getElementById("nextYear").addEventListener("click", function () {
    currentViewDate.setFullYear(currentViewDate.getFullYear() + 1);
    if (isYearView) {
      renderYearCalendar();
    } else {
      renderMonthCalendar();
    }
    updateMonthStats();
  });

  document.getElementById("todayBtn").addEventListener("click", function () {
    currentViewDate = new Date();
    if (isYearView) {
      renderYearCalendar();
    } else {
      renderMonthCalendar();
    }
    updateMonthStats();
  });

  // View toggle buttons
  document.getElementById("monthView").addEventListener("click", function () {
    isYearView = false;
    document.getElementById("monthView").classList.add("active");
    document.getElementById("yearView").classList.remove("active");
    document.getElementById("monthCalendar").classList.remove("hidden");
    document.getElementById("yearCalendar").classList.add("hidden");
    renderMonthCalendar();
  });

  document.getElementById("yearView").addEventListener("click", function () {
    isYearView = true;
    document.getElementById("yearView").classList.add("active");
    document.getElementById("monthView").classList.remove("active");
    document.getElementById("yearCalendar").classList.remove("hidden");
    document.getElementById("monthCalendar").classList.add("hidden");
    renderYearCalendar();
  });
}

function renderMonthCalendar() {
  const calendarGrid = document.getElementById("monthCalendar");
  const currentMonthElement = document.getElementById("currentMonth");

  // Clear the calendar
  calendarGrid.innerHTML = "";

  // Set the current month display
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[currentViewDate.getMonth()];
  const year = currentViewDate.getFullYear();
  currentMonthElement.textContent = `${monthName} ${year}`;

  // // Get first day of month and total days
  // const firstDay = new Date(
  //   currentViewDate.getFullYear(),
  //   currentViewDate.getMonth(),
  //   1,
  // );
  // const lastDay = new Date(
  //   currentViewDate.getFullYear(),
  //   currentViewDate.getMonth() + 1,
  //   0,
  // );
  // const totalDays = lastDay.getDate();
  // const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Add day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dayNames.forEach((day) => {
    const dayElement = document.createElement("div");
    dayElement.className = "day-name";
    dayElement.textContent = day;
    calendarGrid.appendChild(dayElement);
  });

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "day-cell empty";
    calendarGrid.appendChild(emptyCell);
  }

  // Add cells for each day of the month
  const today = formatDate(new Date());
  const currentMonth = currentViewDate.getMonth();
  const currentYear = currentViewDate.getFullYear();

  for (let day = 1; day <= totalDays; day++) {
    const dayCell = document.createElement("div");
    dayCell.className = "day-cell";
    dayCell.textContent = day;

    // Check if this day has a mood entry
    const dateKey = formatDate(new Date(currentYear, currentMonth, day));

    // Check if it's today
    if (dateKey === today) {
      dayCell.classList.add("today");
    }

    if (moodData[dateKey]) {
      // Add mood class
      dayCell.classList.add(`mood-${moodData[dateKey].mood}`);
      dayCell.classList.add("has-entry");

      // Add a tooltip
      dayCell.title = `${moodData[dateKey].mood.charAt(0).toUpperCase() + moodData[dateKey].mood.slice(1)}: ${moodData[dateKey].note || "No note"}`;

      // Add click event to view details
      dayCell.addEventListener("click", function () {
        showDayDetails(dateKey);
      });
    }

    calendarGrid.appendChild(dayCell);
  }
}

function renderYearCalendar() {
  const yearGrid = document.getElementById("yearCalendar");
  const currentMonthElement = document.getElementById("currentMonth");

  // Set the current year display
  const year = currentViewDate.getFullYear();
  currentMonthElement.textContent = `Year ${year}`;

  // Clear the year calendar
  yearGrid.innerHTML = "";

  // Create a 3x4 grid for months
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let month = 0; month < 12; month++) {
    const monthContainer = document.createElement("div");
    monthContainer.className = "year-month";

    // Month header
    const monthHeader = document.createElement("div");
    monthHeader.className = "year-month-header";
    monthHeader.textContent = monthNames[month];
    monthContainer.appendChild(monthHeader);

    // Create mini calendar for the month
    const monthGrid = document.createElement("div");
    monthGrid.className = "year-month-grid";

    // Add day names (abbreviated)
    const miniDayNames = ["S", "M", "T", "W", "T", "F", "S"];
    miniDayNames.forEach((day) => {
      const dayElement = document.createElement("div");
      dayElement.className = "year-day-name";
      dayElement.textContent = day;
      monthGrid.appendChild(dayElement);
    });

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    // Add empty cells
    for (let i = 0; i < firstDayOfWeek; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "year-day-cell empty";
      monthGrid.appendChild(emptyCell);
    }

    // Add day cells
    for (let day = 1; day <= totalDays; day++) {
      const dayCell = document.createElement("div");
      dayCell.className = "year-day-cell";
      dayCell.textContent = day;

      // Check if this day has a mood entry
      const dateKey = formatDate(new Date(year, month, day));

      if (moodData[dateKey]) {
        // Add mood class
        dayCell.classList.add(`mood-${moodData[dateKey].mood}`);
        dayCell.classList.add("has-entry");

        // Add a tooltip
        dayCell.title = `${monthNames[month]} ${day}: ${moodData[dateKey].mood.charAt(0).toUpperCase() + moodData[dateKey].mood.slice(1)}`;
      }

      monthGrid.appendChild(dayCell);
    }

    monthContainer.appendChild(monthGrid);
    yearGrid.appendChild(monthContainer);
  }
}

function showDayDetails(dateKey) {
  const entry = moodData[dateKey];
  const dayInfo = document.getElementById("selectedDayInfo");

  if (!entry) {
    dayInfo.innerHTML = `
            <div class="day-detail">
                <h4>No entry for this day</h4>
                <p>Click on a day with a mood entry to see details.</p>
            </div>
        `;
    return;
  }

  // Format the date
  const dateObj = new Date(dateKey);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Mood text with capitalization
  const moodText = entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1);

  // Mood emoji
  const moodEmoji = {
    happy: "😊",
    sad: "😢",
    neutral: "😐",
    angry: "😠",
  };

  dayInfo.innerHTML = `
        <div class="day-detail">
            <div class="detail-date">${formattedDate}</div>
            <div class="detail-mood ${`mood-${entry.mood}`}">
                ${moodEmoji[entry.mood]} ${moodText}
            </div>
            <div class="detail-note">
                <strong>Note:</strong> ${entry.note || "No note provided"}
            </div>
            <button class="edit-btn" data-date="${dateKey}">
                <i class="fas fa-edit"></i> Edit Entry
            </button>
        </div>
    `;

  // Add event listener to edit button
  dayInfo.querySelector(".edit-btn").addEventListener("click", function () {
    editEntry(dateKey);
  });
}

function editEntry(dateKey) {
  const entry = moodData[dateKey];
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
  moodData[dateKey] = {
    mood: newMood,
    note: newNote,
    date: dateKey,
  };

  // Save to localStorage
  saveMoodData();

  // Update UI
  if (isYearView) {
    renderYearCalendar();
  } else {
    renderMonthCalendar();
  }
  updateMonthStats();
  showDayDetails(dateKey);

  alert("Entry updated successfully!");
}

function updateMonthStats() {
  const monthStats = document.getElementById("monthStats");
  if (!monthStats) return;

  const month = currentViewDate.getMonth();
  const year = currentViewDate.getFullYear();

  // Get first and last day of the month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Count moods for the month
  const moodCounts = { happy: 0, sad: 0, neutral: 0, angry: 0 };
  let totalEntries = 0;

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateKey = formatDate(new Date(year, month, day));
    if (moodData[dateKey]) {
      moodCounts[moodData[dateKey].mood]++;
      totalEntries++;
    }
  }

  // Calculate percentages
  const percentages = {};
  for (const mood in moodCounts) {
    percentages[mood] =
      totalEntries > 0
        ? Math.round((moodCounts[mood] / totalEntries) * 100)
        : 0;
  }

  // Find most common mood
  let mostCommonMood = null;
  let maxCount = 0;
  for (const mood in moodCounts) {
    if (moodCounts[mood] > maxCount) {
      maxCount = moodCounts[mood];
      mostCommonMood = mood;
    }
  }

  monthStats.innerHTML = `
        <div class="month-stat">
            <div class="stat-label">Total Entries:</div>
            <div class="stat-value">${totalEntries}</div>
        </div>
        <div class="month-stat">
            <div class="stat-label">Most Common Mood:</div>
            <div class="stat-value">${mostCommonMood ? mostCommonMood.charAt(0).toUpperCase() + mostCommonMood.slice(1) : "None"}</div>
        </div>
        <div class="mood-percentages">
            <div class="percentage-bar">
                <div class="percentage-label">Happy:</div>
                <div class="percentage-value">${percentages.happy}%</div>
                <div class="percentage-bar-fill" style="width: ${percentages.happy}%; background-color: var(--happy);"></div>
            </div>
            <div class="percentage-bar">
                <div class="percentage-label">Sad:</div>
                <div class="percentage-value">${percentages.sad}%</div>
                <div class="percentage-bar-fill" style="width: ${percentages.sad}%; background-color: var(--sad);"></div>
            </div>
            <div class="percentage-bar">
                <div class="percentage-label">Neutral:</div>
                <div class="percentage-value">${percentages.neutral}%</div>
                <div class="percentage-bar-fill" style="width: ${percentages.neutral}%; background-color: var(--neutral);"></div>
            </div>
            <div class="percentage-bar">
                <div class="percentage-label">Angry:</div>
                <div class="percentage-value">${percentages.angry}%</div>
                <div class="percentage-bar-fill" style="width: ${percentages.angry}%; background-color: var(--angry);"></div>
            </div>
        </div>
    `;
}
