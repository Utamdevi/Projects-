// Profile Management
let userProfile = JSON.parse(localStorage.getItem("userProfile")) || {
  id: 1,
  fullName: "John Smith",
  email: "john.smith@example.com",
  phone: "+234 812 345 6789",
  location: "Lagos, Nigeria",
  currency: "NGN",
  monthStart: 1,
  notifications: {
    email: true,
    weeklyReports: true,
    budgetAlerts: false,
    balanceAlerts: false,
  },
  createdAt: "2023-01-01",
  avatarInitials: "JS",
};

let isEditMode = false;

// Initialize profile page
document.addEventListener("DOMContentLoaded", function () {
  initPage();
});

// Initialize mobile menu
initMobileMenu();

// Initialize the page
function initPage() {
  loadProfileData();
  loadStatistics();
  setupEventListeners();
}

// Load profile data from localStorage
function loadProfileData() {
  // Update form fields
  document.getElementById("fullName").value = userProfile.fullName;
  document.getElementById("email").value = userProfile.email;
  document.getElementById("phone").value = userProfile.phone;
  document.getElementById("location").value = userProfile.location;
  document.getElementById("currency").value = userProfile.currency;
  document.getElementById("monthStart").value = userProfile.monthStart;

  // Update avatar and display
  document.getElementById("profileAvatar").textContent =
    userProfile.avatarInitials;
  document.getElementById("profileName").textContent = userProfile.fullName;
  document.getElementById("profileEmail").textContent = userProfile.email;
  document.getElementById("profilePhone").textContent = userProfile.phone;
  document.getElementById("profileLocation").textContent = userProfile.location;
  document.getElementById("memberSince").textContent = formatDate(
    userProfile.createdAt,
  );

  // Update currency
  document.getElementById("currency").value = userProfile.currency;

  // Update notification toggles
  document.getElementById("emailNotifications").checked =
    userProfile.notifications.email;
  document.getElementById("weeklyReports").checked =
    userProfile.notifications.weeklyReports;
  document.getElementById("budgetAlerts").checked =
    userProfile.notifications.budgetAlerts;
  document.getElementById("balanceAlerts").checked =
    userProfile.notifications.balanceAlerts;
}
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

// Load statistics
function loadStatistics() {
  const transactions =
    JSON.parse(localStorage.getItem("budgetTransactions")) || [];
  const categories = JSON.parse(localStorage.getItem("budgetCategories")) || [];

  // Calculate statistics
  const totalTransactions = transactions.length;
  const totalCategories = categories.length;

  // Calculate savings rate
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyIncome = transactions
    .filter((t) => {
      const date = new Date(t.date);
      return (
        t.type === "income" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter((t) => {
      const date = new Date(t.date);
      return (
        t.type === "expense" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate =
    monthlyIncome > 0
      ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)
      : 0;

  // Update UI
  document.getElementById("totalTransactionsStat").textContent =
    totalTransactions;
  document.getElementById("totalCategoriesStat").textContent = totalCategories;
  document.getElementById("savingsRateStat").textContent = `${savingsRate}%`;

  // Update color based on savings rate
  const savingsElement = document.getElementById("savingsRateStat");
  if (savingsRate >= 20) {
    savingsElement.className = "stat-value success";
  } else if (savingsRate >= 10) {
    savingsElement.className = "stat-value warning";
  } else {
    savingsElement.className = "stat-value danger";
  }
}

// Setup event listeners
function setupEventListeners() {
  // Edit profile button
  const editProfileBtn = document.getElementById("editProfileBtn");
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", toggleEditMode);
  }

  // Save profile button
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", saveProfile);
  }

  // Password update
  const updatePasswordBtn = document.getElementById("updatePasswordBtn");
  if (updatePasswordBtn) {
    updatePasswordBtn.addEventListener("click", updatePassword);
  }

  // Password strength checker
  const newPasswordInput = document.getElementById("newPassword");
  if (newPasswordInput) {
    newPasswordInput.addEventListener("input", checkPasswordStrength);
  }

  // Notification toggles
  const emailNotifications = document.getElementById("emailNotifications");
  const weeklyReports = document.getElementById("weeklyReports");
  const budgetAlerts = document.getElementById("budgetAlerts");
  const balanceAlerts = document.getElementById("balanceAlerts");

  if (emailNotifications) {
    emailNotifications.addEventListener("change", updateNotifications);
  }
  if (weeklyReports) {
    weeklyReports.addEventListener("change", updateNotifications);
  }
  if (budgetAlerts) {
    budgetAlerts.addEventListener("change", updateNotifications);
  }
  if (balanceAlerts) {
    balanceAlerts.addEventListener("change", updateNotifications);
  }

  // Currency change
  const currencySelect = document.getElementById("currency");
  if (currencySelect) {
    currencySelect.addEventListener("change", updateCurrency);
  }

  // Month start change
  const monthStartSelect = document.getElementById("monthStart");
  if (monthStartSelect) {
    monthStartSelect.addEventListener("change", updateMonthStart);
  }
}

// Toggle edit mode
function toggleEditMode() {
  isEditMode = !isEditMode;

  // Toggle form fields
  const formFields = [
    "fullName",
    "email",
    "phone",
    "location",
    "currency",
    "monthStart",
    "currentPassword",
    "newPassword",
    "confirmPassword",
  ];

  formFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.disabled = !isEditMode;
    }
  });

  // Toggle notification switches
  const notificationSwitches = [
    "emailNotifications",
    "weeklyReports",
    "budgetAlerts",
    "balanceAlerts",
  ];

  notificationSwitches.forEach((switchId) => {
    const toggle = document.getElementById(switchId);
    if (toggle) {
      toggle.disabled = !isEditMode;
    }
  });

  // Toggle buttons
  const editBtn = document.getElementById("editProfileBtn");
  const saveBtn = document.getElementById("saveProfileBtn");
  const updatePasswordBtn = document.getElementById("updatePasswordBtn");

  if (isEditMode) {
    editBtn.style.display = "none";
    saveBtn.style.display = "flex";
    if (updatePasswordBtn) {
      updatePasswordBtn.disabled = false;
    }
  } else {
    editBtn.style.display = "flex";
    saveBtn.style.display = "none";
    if (updatePasswordBtn) {
      updatePasswordBtn.disabled = true;
    }
    // Reset form to saved values
    loadProfileData();
  }
}

// Save profile changes
function saveProfile() {
  // Get updated values
  const updatedProfile = {
    ...userProfile,
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    location: document.getElementById("location").value.trim(),
    currency: document.getElementById("currency").value,
    monthStart: parseInt(document.getElementById("monthStart").value),
    avatarInitials: generateInitials(
      document.getElementById("fullName").value.trim(),
    ),
  };

  // Validate email
  if (!isValidEmail(updatedProfile.email)) {
    showNotification("Please enter a valid email address", "error");
    return;
  }

  // Validate phone
  if (!isValidPhone(updatedProfile.phone)) {
    showNotification("Please enter a valid phone number", "error");
    return;
  }

  // Update user profile
  userProfile = updatedProfile;

  // Save to localStorage
  localStorage.setItem("userProfile", JSON.stringify(userProfile));

  // Update display
  loadProfileData();

  // Exit edit mode
  toggleEditMode();

  showNotification("Profile updated successfully", "success");
}

// Update notifications
function updateNotifications() {
  userProfile.notifications = {
    email: document.getElementById("emailNotifications").checked,
    weeklyReports: document.getElementById("weeklyReports").checked,
    budgetAlerts: document.getElementById("budgetAlerts").checked,
    balanceAlerts: document.getElementById("balanceAlerts").checked,
  };

  localStorage.setItem("userProfile", JSON.stringify(userProfile));
  showNotification("Notification settings updated", "success");
}

// Update currency
function updateCurrency() {
  const currency = document.getElementById("currency").value;
  userProfile.currency = currency;
  localStorage.setItem("selectedCurrency", currency);
  localStorage.setItem("userProfile", JSON.stringify(userProfile));

  // Update all pages that use currency
  if (typeof updateChart === "function") {
    updateChart();
  }
  if (typeof updateCurrencyDisplay === "function") {
    updateCurrencyDisplay();
  }
}

// Update month start
function updateMonthStart() {
  const monthStart = parseInt(document.getElementById("monthStart").value);
  userProfile.monthStart = monthStart;
  localStorage.setItem("userProfile", JSON.stringify(userProfile));
  showNotification("Month start date updated", "success");
}

// Update password
function updatePassword() {
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Validate current password
  const storedPassword = localStorage.getItem("userPassword");
  if (storedPassword && currentPassword !== storedPassword) {
    showNotification("Current password is incorrect", "error");
    return;
  }

  // Validate new password
  if (!newPassword) {
    showNotification("Please enter a new password", "error");
    return;
  }

  if (newPassword.length < 8) {
    showNotification("Password must be at least 8 characters long", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showNotification("Passwords do not match", "error");
    return;
  }

  // Save new password
  localStorage.setItem("userPassword", newPassword);

  // Clear password fields
  document.getElementById("currentPassword").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";

  // Reset password strength
  document.getElementById("passwordStrength").style.width = "0%";
  document.getElementById("passwordStrengthText").textContent = "Not set";

  showNotification("Password updated successfully", "success");
}

// Check password strength
function checkPasswordStrength() {
  const password = document.getElementById("newPassword").value;
  const strengthBar = document.getElementById("passwordStrength");
  const strengthText = document.getElementById("passwordStrengthText");

  if (!password) {
    strengthBar.style.width = "0%";
    strengthText.textContent = "Not set";
    strengthBar.style.backgroundColor = "";
    return;
  }

  let strength = 0;

  // Length check
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 10;

  // Complexity checks
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^A-Za-z0-9]/.test(password)) strength += 10;

  // Prevent overflow
  strength = Math.min(strength, 100);

  // Update display
  strengthBar.style.width = `${strength}%`;

  // Set color and text based on strength
  if (strength < 40) {
    strengthBar.style.backgroundColor = "#f44336";
    strengthText.textContent = "Weak";
  } else if (strength < 70) {
    strengthBar.style.backgroundColor = "#ff9800";
    strengthText.textContent = "Fair";
  } else if (strength < 90) {
    strengthBar.style.backgroundColor = "#4caf50";
    strengthText.textContent = "Good";
  } else {
    strengthBar.style.backgroundColor = "#2196f3";
    strengthText.textContent = "Strong";
  }
}

// Export user data
window.exportUserData = function () {
  // Collect all user data
  const userData = {
    profile: userProfile,
    transactions: JSON.parse(localStorage.getItem("budgetTransactions")) || [],
    categories: JSON.parse(localStorage.getItem("budgetCategories")) || [],
    exportDate: new Date().toISOString(),
  };

  // Create JSON string
  const jsonString = JSON.stringify(userData, null, 2);

  // Create download link
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `budget_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification("Data exported successfully", "success");
};

// Import user data
window.importUserData = function () {
  const modalHTML = `
        <div class="modal active" id="importModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-upload"></i> Import Data</h3>
                    <button class="modal-close" onclick="closeImportModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="import-instructions">
                        <p><strong>Import Instructions:</strong></p>
                        <ol>
                            <li>Select a JSON backup file</li>
                            <li>Choose what to import:
                                <ul>
                                    <li><input type="checkbox" id="importProfile" checked> Profile Settings</li>
                                    <li><input type="checkbox" id="importTransactions" checked> Transactions</li>
                                    <li><input type="checkbox" id="importCategories" checked> Categories</li>
                                </ul>
                            </li>
                            <li>Click Import to load your data</li>
                        </ol>
                        <div class="form-group">
                            <label for="importFile">Select Backup File</label>
                            <input type="file" class="form-control" id="importFile" accept=".json">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeImportModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="processImport()">Import</button>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
};

// Close import modal
window.closeImportModal = function () {
  const modal = document.getElementById("importModal");
  if (modal) {
    modal.remove();
  }
};

// Process import
window.processImport = function () {
  const fileInput = document.getElementById("importFile");
  const importProfile = document.getElementById("importProfile").checked;
  const importTransactions =
    document.getElementById("importTransactions").checked;
  const importCategories = document.getElementById("importCategories").checked;

  if (!fileInput.files[0]) {
    showNotification("Please select a file to import", "error");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      // Validate file structure
      if (!data.profile && !data.transactions && !data.categories) {
        showNotification("Invalid backup file format", "error");
        return;
      }

      // Import selected data
      if (importProfile && data.profile) {
        localStorage.setItem("userProfile", JSON.stringify(data.profile));
        userProfile = data.profile;
      }

      if (importTransactions && data.transactions) {
        localStorage.setItem(
          "budgetTransactions",
          JSON.stringify(data.transactions),
        );
      }

      if (importCategories && data.categories) {
        localStorage.setItem(
          "budgetCategories",
          JSON.stringify(data.categories),
        );
      }

      // Close modal
      closeImportModal();

      // Reload page data
      loadProfileData();
      loadStatistics();

      // Update other pages if needed
      if (typeof loadTransactions === "function") loadTransactions();
      if (typeof loadCategories === "function") loadCategories();
      if (typeof updateChart === "function") updateChart();

      showNotification("Data imported successfully", "success");
    } catch (error) {
      showNotification("Error reading file: " + error.message, "error");
    }
  };

  reader.onerror = function () {
    showNotification("Error reading file", "error");
  };

  reader.readAsText(file);
};

// Delete account
window.deleteAccount = function () {
  const modalHTML = `
        <div class="modal active" id="deleteAccountModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> Delete Account</h3>
                    <button class="modal-close" onclick="closeDeleteModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="warning-message">
                        <div class="warning-icon">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <h4>Warning: This action cannot be undone!</h4>
                        <p>All your data will be permanently deleted, including:</p>
                        <ul>
                            <li>Your profile information</li>
                            <li>All transactions</li>
                            <li>Budget categories</li>
                            <li>Settings and preferences</li>
                        </ul>
                        <p>This action is irreversible.</p>
                        
                        <div class="form-group">
                            <label for="confirmDelete">Type "DELETE" to confirm</label>
                            <input type="text" class="form-control" id="confirmDelete" placeholder="DELETE">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeDeleteModal()">Cancel</button>
                    <button class="btn btn-danger" onclick="confirmDeleteAccount()">Delete Account</button>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
};

// Close delete modal
window.closeDeleteModal = function () {
  const modal = document.getElementById("deleteAccountModal");
  if (modal) {
    modal.remove();
  }
};

// Confirm account deletion
window.confirmDeleteAccount = function () {
  const confirmationText = document.getElementById("confirmDelete").value;

  if (confirmationText !== "DELETE") {
    showNotification('Please type "DELETE" to confirm', "error");
    return;
  }

  // Clear all user data from localStorage
  localStorage.removeItem("userProfile");
  localStorage.removeItem("budgetTransactions");
  localStorage.removeItem("budgetCategories");
  localStorage.removeItem("selectedCurrency");
  localStorage.removeItem("userPassword");

  // Reset to default profile
  userProfile = {
    id: 1,
    fullName: "John Smith",
    email: "john.smith@example.com",
    phone: "+234 812 345 6789",
    location: "Lagos, Nigeria",
    currency: "NGN",
    monthStart: 1,
    notifications: {
      email: true,
      weeklyReports: true,
      budgetAlerts: false,
      balanceAlerts: false,
    },
    createdAt: new Date().toISOString().split("T")[0],
    avatarInitials: "JS",
  };

  // Save default profile
  localStorage.setItem("userProfile", JSON.stringify(userProfile));

  // Close modal
  closeDeleteModal();

  // Reload page
  loadProfileData();
  loadStatistics();

  showNotification("Account has been reset to default", "success");
};

// Helper functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function generateInitials(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  // Basic phone validation - can be enhanced based on requirements
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
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
        .notification-info {
            border-left: 4px solid #2196F3;
            color: #1565C0;
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

// Initialize password strength
document.getElementById("passwordStrength").style.width = "0%";
