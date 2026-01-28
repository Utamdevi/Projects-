// Add click handlers for the entire cards
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".instrument-card").forEach((card) => {
    card.addEventListener("click", function () {
      const link = this.querySelector("a").href;
      window.location.href = link;
    });
  });
});
