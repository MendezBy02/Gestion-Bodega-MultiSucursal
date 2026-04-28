function mostrarSeccion(id) {

  // Ocultar todas las secciones
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("inventario").style.display = "none";
  document.getElementById("transferencias").style.display = "none";
  document.getElementById("sucursales").style.display = "none";

  // Mostrar la seleccionada
  document.getElementById(id).style.display = "block";

  // Manejar activo del menú
  const items = document.querySelectorAll(".sidebar li");
  items.forEach(item => item.classList.remove("active"));

  event.currentTarget.classList.add("active");
}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");

  sidebar.classList.toggle("oculto");
}