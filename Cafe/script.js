// Mobile Navigation
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenuClose = document.getElementById("mobileMenuClose");
const mobileNav = document.getElementById("mobileNav");
const mobileNavLinks = mobileNav.querySelectorAll("a");

// Create overlay for mobile menu
const overlay = document.createElement("div");
overlay.className = "mobile-overlay";
document.body.appendChild(overlay);

// Toggle mobile menu
function toggleMobileMenu() {
  mobileNav.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.style.overflow = mobileNav.classList.contains("active")
    ? "hidden"
    : "";
}

// Open mobile menu
mobileMenuBtn.addEventListener("click", toggleMobileMenu);

// Close mobile menu
mobileMenuClose.addEventListener("click", toggleMobileMenu);
overlay.addEventListener("click", toggleMobileMenu);

// Close mobile menu when clicking on links
mobileNavLinks.forEach((link) => {
  link.addEventListener("click", toggleMobileMenu);
});

// Menu Category Switching
const categoryBtns = document.querySelectorAll(".category-btn");
const menuSections = document.querySelectorAll(".menu-section");

categoryBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove active class from all buttons
    categoryBtns.forEach((b) => b.classList.remove("active"));

    // Add active class to clicked button
    btn.classList.add("active");

    // Get category from data attribute
    const category = btn.getAttribute("data-category");

    // Hide all menu sections
    menuSections.forEach((section) => {
      section.classList.remove("active");
    });

    // Show selected menu section
    const targetSection = document.getElementById(`${category}-menu`);
    if (targetSection) {
      targetSection.classList.add("active");
    }
  });
});

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    if (targetId === "#") return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      // Close mobile menu if open
      if (mobileNav.classList.contains("active")) {
        toggleMobileMenu();
      }

      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: "smooth",
      });
    }
  });
});

// Contact Form Submission
// Contact Form Submission with Formspree
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector(".submit-btn");
    const originalBtnText = submitBtn.textContent;
    const formMessage = document.getElementById("formMessage");

    // Disable submit button and show loading state
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;
    formMessage.style.display = "none";

    try {
      const formData = new FormData(this);
      const response = await fetch(this.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        // Success
        formMessage.textContent =
          "Thank you for your message! We will get back to you soon.";
        formMessage.style.backgroundColor = "#d4edda";
        formMessage.style.color = "#155724";
        formMessage.style.display = "block";
        this.reset();
      } else {
        // Error
        const error = await response.json();
        throw new Error(error.error || "Something went wrong");
      }
    } catch (error) {
      // Show error message
      formMessage.textContent =
        "Sorry, there was an error sending your message. Please try again later.";
      formMessage.style.backgroundColor = "#f8d7da";
      formMessage.style.color = "#721c24";
      formMessage.style.display = "block";
      console.error("Form submission error:", error);
    } finally {
      // Re-enable submit button
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;

      // Hide message after 5 seconds
      setTimeout(() => {
        formMessage.style.display = "none";
      }, 5000);
    }
  });
}

// Sticky Header
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (window.scrollY > 100) {
    header.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
  } else {
    header.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  }
});

// Social Media Links - Updated with actual URLs
document.addEventListener("DOMContentLoaded", () => {
  // Update phone numbers to be clickable
  const phoneNumbers = document.querySelectorAll('[href*="tel:"]');
  phoneNumbers.forEach((phone) => {
    // Ensure phone numbers have proper format
    const currentHref = phone.getAttribute("href");
    if (currentHref.includes("03140339545")) {
      phone.setAttribute("href", "tel:03140339545");
    }
  });

  // Social media links functionality
  const socialLinks = {
    facebook: "https://www.facebook.com/chaigptofficial/",
    instagram: "https://www.instagram.com/chaigpt__/?hl=en",
    whatsapp: "https://wa.me/03140339545", // Updated WhatsApp link
  };

  // Attach social media links
  const facebookLink = document.querySelector(
    '.social-icons a[href*="facebook"]'
  );
  const instagramLink = document.querySelector(
    '.social-icons a[href*="instagram"]'
  );
  const whatsappLink = document.querySelector(
    '.social-icons a[href*="whatsapp"]'
  );

  if (facebookLink) facebookLink.setAttribute("href", socialLinks.facebook);
  if (instagramLink) instagramLink.setAttribute("href", socialLinks.instagram);
  if (whatsappLink) whatsappLink.setAttribute("href", socialLinks.whatsapp);

  // Add target="_blank" to social links
  document.querySelectorAll(".social-icons a").forEach((link) => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });
});

// Close mobile menu when pressing Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileNav.classList.contains("active")) {
    toggleMobileMenu();
  }
});
