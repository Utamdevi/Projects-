/* =========================
   PROFILE PAGE JAVASCRIPT
   ========================= */

// Selectors
const editBtn = document.getElementById("editProfileBtn");
const saveBtn = document.getElementById("saveProfileBtn");
const updatePasswordBtn = document.getElementById("updatePasswordBtn");

const inputs = document.querySelectorAll(
  ".profile-form input, .profile-form select",
);

const securityInputs = document.querySelectorAll(
  "#currentPassword, #newPassword, #confirmPassword",
);

const notificationInputs = document.querySelectorAll(
  ".notification-settings input",
);
// Profile display fields
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profilePhone = document.getElementById("profilePhone");
const profileLocation = document.getElementById("profileLocation");
const profileAvatar = document.getElementById("profileAvatar");

// Password strength
const strengthFill = document.getElementById("passwordStrength");
const strengthText = document.getElementById("passwordStrengthText");

/* =========================
   LOAD SAVED DATA
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("userProfile"));

  if (data) {
    fullName.value = data.fullName;
    email.value = data.email;
    phone.value = data.phone;
    location.value = data.location;
    currency.value = data.currency;
    monthStart.value = data.monthStart;

    emailNotifications.checked = data.emailNotifications;
    weeklyReports.checked = data.weeklyReports;
    budgetAlerts.checked = data.budgetAlerts;
    balanceAlerts.checked = data.balanceAlerts;

    updateSidebar();
  }

  const resetBtn = document.getElementById("resetDemoBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            BudgetUtils.resetApp();
        });
    }
});

/* =========================
   EDIT PROFILE
   ========================= */
editBtn.addEventListener("click", () => {
  toggleInputs(false);
  saveBtn.style.display = "inline-block";
  updatePasswordBtn.disabled = false;
});

/* =========================
   SAVE PROFILE
   ========================= */
saveBtn.addEventListener("click", () => {
  const userData = {
    fullName: fullName.value,
    email: email.value,
    phone: phone.value,
    location: location.value,
    currency: currency.value,
    monthStart: monthStart.value,
    emailNotifications: emailNotifications.checked,
    weeklyReports: weeklyReports.checked,
    budgetAlerts: budgetAlerts.checked,
    balanceAlerts: balanceAlerts.checked,
  };

  localStorage.setItem("userProfile", JSON.stringify(userData));

  toggleInputs(true);
  saveBtn.style.display = "none";
  updateSidebar();

  alert("Profile updated successfully!");
});

/* =========================
   TOGGLE INPUTS
   ========================= */
function toggleInputs(disabled) {
  inputs.forEach((input) => (input.disabled = disabled));
  securityInputs.forEach((input) => (input.disabled = disabled));
  notificationInputs.forEach((input) => (input.disabled = disabled));
}

/* =========================
   UPDATE SIDEBAR
   ========================= */
function updateSidebar() {
  profileName.textContent = fullName.value;
  profileEmail.textContent = email.value;
  profilePhone.textContent = phone.value;
  profileLocation.textContent = location.value;

  const initials = fullName.value
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  profileAvatar.textContent = initials;
}

/* =========================
   PASSWORD STRENGTH
   ========================= */
newPassword.addEventListener("input", () => {
  const value = newPassword.value;
  let strength = 0;

  if (value.length >= 8) strength++;
  if (/[A-Z]/.test(value)) strength++;
  if (/[0-9]/.test(value)) strength++;
  if (/[^A-Za-z0-9]/.test(value)) strength++;

  const percent = (strength / 4) * 100;
  strengthFill.style.width = percent + "%";

  if (strength === 0) {
    strengthText.textContent = "Not set";
  } else if (strength <= 2) {
    strengthText.textContent = "Weak";
  } else if (strength === 3) {
    strengthText.textContent = "Medium";
  } else {
    strengthText.textContent = "Strong";
  }
});

/* =========================
   UPDATE PASSWORD
   ========================= */
updatePasswordBtn.addEventListener("click", () => {
  if (!currentPassword.value || !newPassword.value) {
    alert("Please fill all password fields");
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    alert("Passwords do not match");
    return;
  }

  alert("Password updated successfully!");

  currentPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
  strengthFill.style.width = "0%";
  strengthText.textContent = "Not set";
});

/* =========================
   DATA MANAGEMENT
   ========================= */
function exportUserData() {
  const data = localStorage.getItem("userProfile");
  if (!data) {
    alert("No data to export");
    return;
  }

  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "spendora-profile-data.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importUserData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      localStorage.setItem("userProfile", reader.result);
      alert("Data imported successfully! Reload page.");
    };

    reader.readAsText(file);
  };

  input.click();
}


