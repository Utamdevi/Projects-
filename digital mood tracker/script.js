// Mood data and state
let moodData = {};
let selectedMood = null;
let currentDate = new Date();

// Load mood data from localStorage
function loadMoodData() {
  const savedData = localStorage.getItem("moodTrackerData");
  if (savedData) {
    moodData = JSON.parse(savedData);
  }
}

// Save mood data to localStorage
function saveMoodData() {
  localStorage.setItem("moodTrackerData", JSON.stringify(moodData));
}

// Initialize the app
function initializeApp() {
  // Load saved data from localStorage
  loadMoodData();

  // Set up event listeners
  setupEventListeners();

  // Initialize the UI
  updateDateDisplay();
  updateSummary();
  selectTodaysMood();

  // Set up navigation
  setupNavigation();
}

// Set up event listeners
function setupEventListeners() {
  // Mood selection
  const emojiOptions = document.querySelectorAll(".emoji-option");
  if (emojiOptions.length > 0) {
    emojiOptions.forEach((option) => {
      option.addEventListener("click", function () {
        selectedMood = this.getAttribute("data-mood");
        updateMoodSelection();
      });
    });
  }

  // Save button
  const saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveTodayMood);
  }

  // Allow Enter key to save (but not in textarea)
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      saveTodayMood();
    }
  });
}

// Update the visual mood selection
function updateMoodSelection() {
  document.querySelectorAll(".emoji-option").forEach((option) => {
    option.classList.remove("selected");
    if (option.getAttribute("data-mood") === selectedMood) {
      option.classList.add("selected");
    }
  });
}

// Update the date display
function updateDateDisplay() {
  const dateDisplay = document.getElementById("dateDisplay");
  if (dateDisplay) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const dateString = currentDate.toLocaleDateString("en-US", options);
    dateDisplay.textContent = dateString;
  }
}

// Save today's mood
function saveTodayMood() {
  if (!selectedMood) {
    alert("Please select a mood first!");
    return;
  }

  const dateKey = formatDate(currentDate);
  const noteInput = document.getElementById("noteInput");
  const note = noteInput ? noteInput.value.trim() : "";

  // Save the mood entry
  moodData[dateKey] = {
    mood: selectedMood,
    note: note,
    date: dateKey,
  };

  // Save to localStorage
  saveMoodData();

  // Update the UI
  updateSummary();

  // Show confirmation
  alert("Mood saved successfully!");

  // Clear the note field
  if (noteInput) {
    noteInput.value = "";
  }

  // Reset selection for next entry
  selectedMood = null;
  updateMoodSelection();

  // Refresh the page if we're on the history page
  if (window.location.pathname.includes("history.html")) {
    window.location.reload();
  }
}

// Select today's mood if it exists
function selectTodaysMood() {
  const todayKey = formatDate(currentDate);
  if (moodData[todayKey]) {
    selectedMood = moodData[todayKey].mood;
    const noteInput = document.getElementById("noteInput");
    if (noteInput) {
      noteInput.value = moodData[todayKey].note || "";
    }
    updateMoodSelection();
  }
}

// Update the summary section
function updateSummary() {
  // Count moods for the last 7 days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(formatDate(date));
  }

  // Count each mood in the last 7 days
  const moodCounts = { happy: 0, sad: 0, neutral: 0, angry: 0 };
  let totalMoods = 0;

  last7Days.forEach((date) => {
    if (moodData[date]) {
      moodCounts[moodData[date].mood]++;
      totalMoods++;
    }
  });

  // Update the counts display if elements exist
  const happyCount = document.getElementById("happyCount");
  const sadCount = document.getElementById("sadCount");
  const neutralCount = document.getElementById("neutralCount");
  const angryCount = document.getElementById("angryCount");

  if (happyCount) happyCount.textContent = moodCounts.happy;
  if (sadCount) sadCount.textContent = moodCounts.sad;
  if (neutralCount) neutralCount.textContent = moodCounts.neutral;
  if (angryCount) angryCount.textContent = moodCounts.angry;

  // Calculate the most frequent mood
  let mostFrequentMood = null;
  let maxCount = 0;

  for (const mood in moodCounts) {
    if (moodCounts[mood] > maxCount) {
      maxCount = moodCounts[mood];
      mostFrequentMood = mood;
    }
  }

  // Update the summary text
  const summaryElement = document.getElementById("summaryText");
  if (summaryElement) {
    if (totalMoods === 0) {
      summaryElement.textContent =
        "You haven't logged any moods this week. Start tracking today!";
    } else if (maxCount === 0) {
      summaryElement.textContent =
        "Your mood data for this week is not available.";
    } else {
      // Capitalize the mood
      const moodText =
        mostFrequentMood.charAt(0).toUpperCase() + mostFrequentMood.slice(1);

      // Add an appropriate emoji
      const emojiMap = {
        happy: "😊",
        sad: "😢",
        neutral: "😐",
        angry: "😠",
      };

      summaryElement.textContent = `You've been mostly ${moodText} this week! ${emojiMap[mostFrequentMood]}`;
    }
  }
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Set up navigation
function setupNavigation() {
  // Highlight current page in navigation
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", initializeApp);
