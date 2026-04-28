// CAMBIO DE SECCIONES
function mostrarSeccion(id, element) {

  const secciones = ["dashboard", "inventario", "transferencias", "sucursales"];

  secciones.forEach(sec => {
    document.getElementById(sec).style.display = "none";
  });

  document.getElementById(id).style.display = "block";

  document.querySelectorAll(".sidebar li").forEach(item =>
    item.classList.remove("active")
  );

  if (element) element.classList.add("active");

  // cerrar sidebar en móvil
  document.getElementById("sidebar").classList.remove("show");
}

// BOTÓN SIDEBAR
const btn = document.getElementById("toggleBtn");
const sidebar = document.getElementById("sidebar");

btn.addEventListener("click", () => {

  sidebar.classList.toggle("hide");

  // cambiar icono
  if (sidebar.classList.contains("hide")) {
    btn.textContent = "☰";
  } else {
    btn.textContent = "✖";
  }

});