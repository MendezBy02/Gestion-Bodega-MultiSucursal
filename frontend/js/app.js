// =========================
// ELEMENTOS
// =========================

const toggleBtn =
  document.getElementById("toggleBtn");

const sidebar =
  document.getElementById("sidebar");

const layout =
  document.getElementById("layout");

// =========================
// SESIÓN
// =========================

const user = JSON.parse(
  localStorage.getItem("user")
);

// verificar login
if (!user) {
  window.location.href = "index.html";
}

// mostrar nombre
document.getElementById(
  "nombreUsuario"
).innerText = user.nombre;

// =========================
// CARGAR SUCURSAL
// =========================

async function cargarSucursal() {

  const { data } = await db
    .from("sucursal")
    .select("nombre")
    .eq("idsucursal", user.sucursal)
    .single();

  if (data) {

    document.getElementById(
      "sucursalUsuario"
    ).innerText = data.nombre;

  }

}

cargarSucursal();

// =========================
// TOGGLE SIDEBAR
// =========================

toggleBtn.addEventListener("click", () => {

  const isMobile =
    window.innerWidth <= 768;

  // móvil
  if (isMobile) {

    sidebar.classList.toggle("active");

    layout.classList.toggle("active");

  } else {

    // pc
    layout.classList.toggle("collapsed");

  }

  // cambiar icono
  toggleBtn.innerHTML =

    layout.classList.contains("collapsed") ||
    sidebar.classList.contains("active")

      ? '<i data-lucide="x"></i>'
      : '<i data-lucide="menu"></i>';

  lucide.createIcons();

});

// =========================
// CAMBIAR VISTAS
// =========================

function mostrar(id) {

  // ocultar vistas
  document.querySelectorAll(".view")
    .forEach(v => {
      v.style.display = "none";
    });

  // mostrar vista
  document.getElementById(id)
    .style.display = "block";

if(id === "dashboard"){

  actualizarDashboard();

}
  // cerrar móvil
  if (window.innerWidth <= 768) {

    sidebar.classList.remove("active");

    layout.classList.remove("active");

    toggleBtn.innerHTML =
      '<i data-lucide="menu"></i>';

    lucide.createIcons();

  }

}

// =========================
// LOGOUT
// =========================

function logout() {

  localStorage.removeItem("user");

  window.location.href =
    "index.html";

}