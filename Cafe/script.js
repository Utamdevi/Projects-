// Menu Toggle Functionality
document.addEventListener("DOMContentLoaded", function () {
  const categoryBtns = document.querySelectorAll(".category-btn");
  const menuSections = document.querySelectorAll(".menu-section");

  // Function to switch between menu categories
  function switchMenu(category) {
    // Hide all menu sections
    menuSections.forEach((section) => {
      section.classList.remove("active");
    });

    // Remove active class from all buttons
    categoryBtns.forEach((btn) => {
      btn.classList.remove("active");
    });

    // Show the selected menu section
    const activeSection = document.getElementById(category + "-menu");
    if (activeSection) {
      activeSection.classList.add("active");
    }

    // Add active class to clicked button
    const activeBtn = document.querySelector(
      `.category-btn[data-category="${category}"]`
    );
    if (activeBtn) {
      activeBtn.classList.add("active");
    }

    // Smooth scroll to menu section if not already in view
    const menuSection = document.getElementById("menu");
    const headerHeight = document.querySelector("header").offsetHeight;
    const menuSectionTop = menuSection.offsetTop - headerHeight - 20;

    if (
      window.scrollY > menuSectionTop + 100 ||
      window.scrollY < menuSectionTop - 100
    ) {
      window.scrollTo({
        top: menuSectionTop,
        behavior: "smooth",
      });
    }
  }

  // Add click event listeners to category buttons
  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const category = this.getAttribute("data-category");
      switchMenu(category);
    });
  });

  // Check URL hash on page load
  const hash = window.location.hash;
  if (hash === "#pizza-menu" || hash === "#pizza") {
    // Small delay to ensure DOM is fully loaded
    setTimeout(() => {
      switchMenu("pizza");
    }, 100);
  }

  // Contact form submission
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form values
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const message = document.getElementById("message").value;

      // In a real application, you would send this data to a server
      // For this demo, we'll just show an alert
      alert(
        `Thank you, ${name}! Your message has been received. We'll get back to you at ${email} soon.`
      );

      // Reset form
      contactForm.reset();
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      // Handle menu category switching
      if (targetId === "#menu" || targetId === "#pizza-menu") {
        if (targetId === "#pizza-menu") {
          switchMenu("pizza");
        }
        return;
      }

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerHeight = document.querySelector("header").offsetHeight;
        window.scrollTo({
          top: targetElement.offsetTop - headerHeight - 20,
          behavior: "smooth",
        });
      }
    });
  });

  // Mobile menu functionality
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileNav = document.getElementById("mobileNav");
  const mobileMenuClose = document.getElementById("mobileMenuClose");

  // Create mobile nav if it doesn't exist
  if (!mobileNav && mobileMenuBtn) {
    const navLinks = document.querySelector(".nav-links");
    if (navLinks) {
      const mobileNavContainer = document.createElement("div");
      mobileNavContainer.className = "mobile-nav";
      mobileNavContainer.id = "mobileNav";

      const closeBtn = document.createElement("button");
      closeBtn.className = "mobile-menu-close";
      closeBtn.id = "mobileMenuClose";
      closeBtn.innerHTML = '<i class="fas fa-times"></i>';

      mobileNavContainer.appendChild(closeBtn);
      mobileNavContainer.appendChild(navLinks.cloneNode(true));

      document.body.appendChild(mobileNavContainer);
    }
  }

  // Initialize mobile menu if elements exist
  if (mobileMenuBtn) {
    const mobileNav = document.getElementById("mobileNav");
    const mobileMenuClose = document.getElementById("mobileMenuClose");

    mobileMenuBtn.addEventListener("click", () => {
      if (mobileNav) mobileNav.classList.add("active");
    });

    if (mobileMenuClose) {
      mobileMenuClose.addEventListener("click", () => {
        if (mobileNav) mobileNav.classList.remove("active");
      });
    }

    // Close mobile menu when clicking on a link
    const mobileNavLinks = document.querySelectorAll(".mobile-nav a");
    mobileNavLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileNav) mobileNav.classList.remove("active");
      });
    });
  }
});
