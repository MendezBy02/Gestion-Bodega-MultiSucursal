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

// si no existe sesión
if (!user) {

  // bloquear historial
  window.location.replace(
    "index.html"
  );

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

  const usuario =
  JSON.parse(
    localStorage.getItem("user")
  );

if(
  id === "usuarios" &&
  usuario.rol !== "admin"
){

  alert(
    "No tienes permisos"
  );

  return;
}

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

// actualizar inventario
if(id === "inventario"){

  if(typeof iniciarInventario === "function"){

    iniciarInventario();

  }

}

// actualizar transferencias
if(id === "transferencias"){

  if(typeof cargarTransferencias === "function"){

    cargarTransferencias();

  }

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

  window.location.replace(
  "index.html"
);

}

// =========================
// CONTROL DE ROLES
// =========================

const usuarioSesion =
  JSON.parse(
    localStorage.getItem("user")
  );

if(usuarioSesion){

  // elementos
  const menuUsuarios =
    document.getElementById(
      "menuUsuarios"
    );

  const btnExportPDF =
    document.getElementById(
      "btnExportPDF"
    );


  // ======================
  // ADMIN
  // ======================

  if(
    usuarioSesion.rol ===
    "admin"
  ){

    // menú usuarios
    if(menuUsuarios){

      menuUsuarios.style.display =
        "block";

    }

    // botón exportar
    if(btnExportPDF){

      btnExportPDF.style.display =
        "flex";

    }

  }


  // ======================
  // GERENTE
  // ======================

  else{

    // ocultar usuarios
    if(menuUsuarios){

      menuUsuarios.style.display =
        "none";

    }

    // ocultar pdf
    if(btnExportPDF){

      btnExportPDF.style.display =
        "none";

    }

  }

}
