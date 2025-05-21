// Tab navigation
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const targetTab = link.getAttribute("data-tab");

    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active-tab"));

    link.classList.add("active");
    document.getElementById(targetTab).classList.add("active-tab");
  });
});
