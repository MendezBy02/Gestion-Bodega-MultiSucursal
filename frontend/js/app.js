const toggleBtn = document.getElementById("toggleBtn");
const sidebar = document.getElementById("sidebar");
const layout = document.getElementById("layout");

/* toggle sidebar */
toggleBtn.addEventListener("click", () => {

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    sidebar.classList.toggle("active");
    layout.classList.toggle("active");
  } else {
    layout.classList.toggle("collapsed");
  }

  /* cambiar icono */
  toggleBtn.innerHTML =
    layout.classList.contains("collapsed") || sidebar.classList.contains("active")
      ? '<i data-lucide="x"></i>'
      : '<i data-lucide="menu"></i>';

  lucide.createIcons();

});

/* logout */
function logout(){
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

/* cambiar vistas */
function mostrar(id){

  // ocultar todas
  document.querySelectorAll(".view").forEach(v => {
    v.style.display = "none";
  });

  // mostrar la seleccionada
  document.getElementById(id).style.display = "block";

}

function mostrar(id){

  // ocultar todas las vistas
  document.querySelectorAll(".view").forEach(v => {
    v.style.display = "none";
  });

  // mostrar la seleccionada
  document.getElementById(id).style.display = "block";

  // 🔥 cerrar sidebar en móvil
  if (window.innerWidth <= 768) {
    sidebar.classList.remove("active");
    layout.classList.remove("active");

    // 🔥 cambiar icono a menú (☰)
    toggleBtn.innerHTML = '<i data-lucide="menu"></i>';
    lucide.createIcons();
  }

}