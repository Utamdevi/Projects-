// Statistics-specific JavaScript
let currentPeriod = "week";
let moodPieChart, moodLineChart, weeklyChart, monthlyChart;

document.addEventListener("DOMContentLoaded", function () {
  // Load mood data
  loadMoodData();

  // Set up event listeners
  setupStatsListeners();

  // Initialize charts
  initializeCharts();
  updateStats();
});

function setupStatsListeners() {
  // Period filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      // Update active button
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      // Update period
      currentPeriod = this.getAttribute("data-period");

      // Update stats
      updateStats();
    });
  });
}

function initializeCharts() {
  // Get canvas contexts
  const pieCtx = document.getElementById("moodPieChart").getContext("2d");
  const lineCtx = document.getElementById("moodLineChart").getContext("2d");
  const weeklyCtx = document.getElementById("weeklyChart").getContext("2d");
  const monthlyCtx = document.getElementById("monthlyChart").getContext("2d");

  // Initialize Pie Chart
  moodPieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: ["Happy", "Sad", "Neutral", "Angry"],
      datasets: [
        {
          data: [0, 0, 0, 0],
          backgroundColor: [
            "var(--happy)",
            "var(--sad)",
            "var(--neutral)",
            "var(--angry)",
          ],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage =
                total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    },
  });

  // Initialize Line Chart
  moodLineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Mood Score",
          data: [],
          borderColor: "var(--primary)",
          backgroundColor: "rgba(106, 103, 206, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 4,
          ticks: {
            callback: function (value) {
              const moods = ["Angry", "Sad", "Neutral", "Happy"];
              return moods[value] || "";
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const moods = ["Angry", "Sad", "Neutral", "Happy"];
              return `Mood: ${moods[context.raw] || context.raw}`;
            },
          },
        },
      },
    },
  });

  // Initialize Weekly Chart
  weeklyChart = new Chart(weeklyCtx, {
    type: "bar",
    data: {
      labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      datasets: [
        {
          label: "Average Mood",
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: "var(--primary)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 4,
          ticks: {
            callback: function (value) {
              const moods = ["Angry", "Sad", "Neutral", "Happy"];
              return moods[value] || "";
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const moods = ["Angry", "Sad", "Neutral", "Happy"];
              return `Avg Mood: ${moods[context.raw] || context.raw}`;
            },
          },
        },
      },
    },
  });

  // Initialize Monthly Chart
  monthlyChart = new Chart(monthlyCtx, {
    type: "bar",
    data: {
      labels: [
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
      ],
      datasets: [
        {
          label: "Happy",
          data: new Array(12).fill(0),
          backgroundColor: "var(--happy)",
        },
        {
          label: "Sad",
          data: new Array(12).fill(0),
          backgroundColor: "var(--sad)",
        },
        {
          label: "Neutral",
          data: new Array(12).fill(0),
          backgroundColor: "var(--neutral)",
        },
        {
          label: "Angry",
          data: new Array(12).fill(0),
          backgroundColor: "var(--angry)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          beginAtZero: true,
        },
      },
    },
  });
}

function updateStats() {
  // Get entries for current period
  const entries = getEntriesForPeriod(currentPeriod);

  // Update summary stats
  updateSummaryStats(entries);

  // Update charts
  updatePieChart(entries);
  updateLineChart(entries);
  updateWeeklyChart(entries);
  updateMonthlyChart(entries);

  // Update insights
  updateInsights(entries);
}

function getEntriesForPeriod(period) {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case "all":
      startDate = new Date(0); // Beginning of time
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }

  // Filter entries by date
  const filteredEntries = [];
  for (const dateKey in moodData) {
    const entryDate = new Date(dateKey);
    if (entryDate >= startDate && entryDate <= now) {
      filteredEntries.push({
        ...moodData[dateKey],
        date: dateKey,
        dateObj: entryDate,
      });
    }
  }

  // Sort by date
  filteredEntries.sort((a, b) => a.dateObj - b.dateObj);

  return filteredEntries;
}

function updateSummaryStats(entries) {
  // Total entries
  document.getElementById("totalEntries").textContent = entries.length;

  // Current streak
  const streak = calculateStreak();
  document.getElementById("currentStreak").textContent = streak;

  // Average mood
  if (entries.length > 0) {
    // Convert moods to numerical values for averaging
    const moodValues = {
      angry: 1,
      sad: 2,
      neutral: 3,
      happy: 4,
    };

    const avgValue =
      entries.reduce((sum, entry) => {
        return sum + (moodValues[entry.mood] || 0);
      }, 0) / entries.length;

    // Convert back to mood name
    const moodNames = ["Angry", "Sad", "Neutral", "Happy"];
    const moodIndex = Math.round(avgValue) - 1;
    document.getElementById("avgMood").textContent =
      moodNames[moodIndex] || "-";
  } else {
    document.getElementById("avgMood").textContent = "-";
  }
}

function calculateStreak() {
  const today = formatDate(new Date());
  let currentDate = new Date();
  let streak = 0;

  // Check if today has an entry
  if (moodData[today]) {
    streak = 1;
    currentDate.setDate(currentDate.getDate() - 1);
  } else {
    // Start from yesterday
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Count consecutive days with entries
  while (true) {
    const dateKey = formatDate(currentDate);
    if (moodData[dateKey]) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function updatePieChart(entries) {
  const moodCounts = {
    happy: 0,
    sad: 0,
    neutral: 0,
    angry: 0,
  };

  entries.forEach((entry) => {
    moodCounts[entry.mood]++;
  });

  // Update pie chart data
  moodPieChart.data.datasets[0].data = [
    moodCounts.happy,
    moodCounts.sad,
    moodCounts.neutral,
    moodCounts.angry,
  ];

  // Update legend
  const pieLegend = document.getElementById("pieLegend");
  if (pieLegend) {
    const total = entries.length;
    let legendHtml = "";

    for (const mood in moodCounts) {
      const count = moodCounts[mood];
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      const moodName = mood.charAt(0).toUpperCase() + mood.slice(1);

      legendHtml += `
            <div class="legend-item">
                <div class="legend-color mood-${mood}"></div>
                <span class="legend-text">${moodName}: ${count} (${percentage}%)</span>
            </div>
            `;
    }

    pieLegend.innerHTML = legendHtml;
  }

  moodPieChart.update();
}

function updateLineChart(entries) {
  // Group entries by date for the selected period
  const dates = [];
  const moodValues = [];

  // Mood to numeric value mapping
  const moodValueMap = {
    angry: 1,
    sad: 2,
    neutral: 3,
    happy: 4,
  };

  // Depending on period, group differently
  if (currentPeriod === "week") {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = formatDate(date);
      const dateLabel = date.toLocaleDateString("en-US", { weekday: "short" });

      dates.push(dateLabel);

      if (moodData[dateKey]) {
        moodValues.push(moodValueMap[moodData[dateKey].mood]);
      } else {
        moodValues.push(null); // No entry for this day
      }
    }
  } else if (currentPeriod === "month") {
    // Last 30 days, grouped by week
    const weeks = [];
    const weekMoods = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = formatDate(date);

      // Group by week
      const weekNum = Math.floor(i / 7);
      if (!weeks[weekNum]) {
        weeks[weekNum] = `Week ${4 - weekNum}`;
        weekMoods[weekNum] = [];
      }

      if (moodData[dateKey]) {
        weekMoods[weekNum].push(moodValueMap[moodData[dateKey].mood]);
      }
    }

    // Calculate average mood for each week
    weeks.forEach((week, index) => {
      if (weekMoods[index].length > 0) {
        const avg =
          weekMoods[index].reduce((a, b) => a + b, 0) / weekMoods[index].length;
        dates.push(week);
        moodValues.push(avg);
      }
    });
  } else {
    // For year or all time, show monthly averages
    const monthData = {};

    entries.forEach((entry) => {
      const month = entry.dateObj.getMonth();
      if (!monthData[month]) {
        monthData[month] = [];
      }
      monthData[month].push(moodValueMap[entry.mood]);
    });

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
      if (monthData[month] && monthData[month].length > 0) {
        const avg =
          monthData[month].reduce((a, b) => a + b, 0) / monthData[month].length;
        dates.push(monthNames[month]);
        moodValues.push(avg);
      }
    }
  }

  // Update line chart
  moodLineChart.data.labels = dates;
  moodLineChart.data.datasets[0].data = moodValues;
  moodLineChart.update();
}

function updateWeeklyChart(entries) {
  // Calculate average mood for each day of the week
  const dayAverages = [0, 0, 0, 0, 0, 0, 0]; // Sunday to Saturday
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  // Mood to numeric value mapping
  const moodValueMap = {
    angry: 1,
    sad: 2,
    neutral: 3,
    happy: 4,
  };

  entries.forEach((entry) => {
    const dayOfWeek = entry.dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
    dayAverages[dayOfWeek] += moodValueMap[entry.mood];
    dayCounts[dayOfWeek]++;
  });

  // Calculate averages
  const averages = dayAverages.map((sum, index) => {
    return dayCounts[index] > 0 ? sum / dayCounts[index] : 0;
  });

  // Update weekly chart
  weeklyChart.data.datasets[0].data = averages;
  weeklyChart.update();
}

function updateMonthlyChart(entries) {
  // Count moods by month
  const monthData = {};

  // Initialize data structure
  for (let month = 0; month < 12; month++) {
    monthData[month] = {
      happy: 0,
      sad: 0,
      neutral: 0,
      angry: 0,
    };
  }

  // Count moods
  entries.forEach((entry) => {
    const month = entry.dateObj.getMonth();
    monthData[month][entry.mood]++;
  });

  // Update monthly chart data
  const happyData = [];
  const sadData = [];
  const neutralData = [];
  const angryData = [];

  for (let month = 0; month < 12; month++) {
    happyData.push(monthData[month].happy);
    sadData.push(monthData[month].sad);
    neutralData.push(monthData[month].neutral);
    angryData.push(monthData[month].angry);
  }

  monthlyChart.data.datasets[0].data = happyData;
  monthlyChart.data.datasets[1].data = sadData;
  monthlyChart.data.datasets[2].data = neutralData;
  monthlyChart.data.datasets[3].data = angryData;

  monthlyChart.update();
}

function updateInsights(entries) {
  const insightsContainer = document.getElementById("insightsContent");

  if (entries.length === 0) {
    insightsContainer.innerHTML = `
            <div class="insight">
                <h4>No data yet</h4>
                <p>Start tracking your moods to see insights and patterns.</p>
            </div>
        `;
    return;
  }

  // Calculate some basic insights
  const moodCounts = {
    happy: 0,
    sad: 0,
    neutral: 0,
    angry: 0,
  };

  entries.forEach((entry) => {
    moodCounts[entry.mood]++;
  });

  // Find most and least common moods
  let mostCommonMood = null;
  let leastCommonMood = null;
  let maxCount = 0;
  let minCount = Infinity;

  for (const mood in moodCounts) {
    if (moodCounts[mood] > maxCount) {
      maxCount = moodCounts[mood];
      mostCommonMood = mood;
    }
    if (moodCounts[mood] < minCount && moodCounts[mood] > 0) {
      minCount = moodCounts[mood];
      leastCommonMood = mood;
    }
  }

  // Calculate percentage of each mood
  const total = entries.length;
  const percentages = {};
  for (const mood in moodCounts) {
    percentages[mood] = Math.round((moodCounts[mood] / total) * 100);
  }

  // Generate insights
  let insightsHTML = "";

  // Insight 1: Most common mood
  if (mostCommonMood) {
    const moodName =
      mostCommonMood.charAt(0).toUpperCase() + mostCommonMood.slice(1);
    insightsHTML += `
        <div class="insight">
            <h4>Most Common Mood</h4>
            <p>Your most frequent mood has been <strong>${moodName}</strong> (${percentages[mostCommonMood]}% of entries).</p>
        </div>
        `;
  }

  // Insight 2: Mood diversity
  const moodTypes = Object.values(moodCounts).filter(
    (count) => count > 0,
  ).length;
  if (moodTypes > 1) {
    insightsHTML += `
        <div class="insight">
            <h4>Mood Diversity</h4>
            <p>You've experienced <strong>${moodTypes} different moods</strong> in this period, showing emotional variety.</p>
        </div>
        `;
  }

  // Insight 3: Consistency
  const consistencyScore = Math.max(...Object.values(percentages));
  if (consistencyScore > 50) {
    insightsHTML += `
        <div class="insight">
            <h4>Emotional Consistency</h4>
            <p>You show consistent emotional patterns, with one mood appearing in over 50% of entries.</p>
        </div>
        `;
  }

  // Insight 4: Entry frequency
  const daysInPeriod =
    currentPeriod === "week"
      ? 7
      : currentPeriod === "month"
        ? 30
        : currentPeriod === "year"
          ? 365
          : total;
  const entryRate = Math.round((entries.length / daysInPeriod) * 100);

  insightsHTML += `
    <div class="insight">
        <h4>Tracking Consistency</h4>
        <p>You've logged moods for <strong>${entryRate}%</strong> of days in this period.</p>
    </div>
    `;

  insightsContainer.innerHTML = insightsHTML;
}
