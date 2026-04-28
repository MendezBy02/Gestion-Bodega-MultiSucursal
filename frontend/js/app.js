function mostrarSeccion(id, element) {

  // Ocultar todas las secciones
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("inventario").style.display = "none";
  document.getElementById("transferencias").style.display = "none";
  document.getElementById("sucursales").style.display = "none";

  // Mostrar la seleccionada
  document.getElementById(id).style.display = "block";

  // Quitar active a todos
  const items = document.querySelectorAll(".sidebar li");
  items.forEach(item => item.classList.remove("active"));

  // Activar el actual
  element.classList.add("active");

  // 📱 En móvil: cerrar sidebar al hacer click
  document.querySelector(".sidebar").classList.remove("show");
}