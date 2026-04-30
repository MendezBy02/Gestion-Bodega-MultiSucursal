const toggleBtn = document.getElementById("toggleBtn");
const sidebar = document.getElementById("sidebar");
const layout = document.getElementById("layout");

toggleBtn.addEventListener("click", () => {

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    sidebar.classList.toggle("active");
    layout.classList.toggle("active");
  } else {
    layout.classList.toggle("collapsed");
  }

  /* 🔥 cambia icono bonito */
  toggleBtn.innerHTML = layout.classList.contains("collapsed") || sidebar.classList.contains("active")
    ? '<i data-lucide="x"></i>'
    : '<i data-lucide="menu"></i>';

  lucide.createIcons();

});