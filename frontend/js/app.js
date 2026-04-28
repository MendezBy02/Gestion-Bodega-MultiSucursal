// =============================
// CAMBIO DE SECCIONES
// =============================
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

// =============================
// SIDEBAR CONTROL
// =============================
const btn = document.getElementById("toggleBtn");
const sidebar = document.getElementById("sidebar");

btn.addEventListener("click", () => {

  // 📱 SI ES MÓVIL
  if (window.innerWidth <= 768) {

    sidebar.classList.toggle("show");

    btn.textContent = sidebar.classList.contains("show") ? "✖" : "☰";

  } 
  // 💻 SI ES PC
  else {

    sidebar.classList.toggle("hide");

    btn.textContent = sidebar.classList.contains("hide") ? "☰" : "✖";

  }

});