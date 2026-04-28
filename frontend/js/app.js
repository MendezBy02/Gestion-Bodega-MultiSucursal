document.addEventListener("DOMContentLoaded", () => {

  const sidebar = document.getElementById("sidebar");
  const btn = document.getElementById("toggleBtn");

  if (btn && sidebar) {
    btn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }

  /* cambiar vistas */
  window.mostrar = function(id) {
    document.querySelectorAll("main section").forEach(sec => {
      sec.style.display = "none";
    });

    document.getElementById(id).style.display = "block";
  }

  /* cambiar activo */
  window.setActive = function(element) {
    document.querySelectorAll(".sidebar li")
      .forEach(li => li.classList.remove("active"));

    element.classList.add("active");
  }

  /* logout */
  window.logout = function() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
  }

  const supabaseUrl = "https://qldarbwshdoghxwnjmye.supabase.co";
  const supabaseKey = "TU_KEY_AQUI";

  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  const user = JSON.parse(localStorage.getItem("user"));

  async function cargarBodega() {

    if (!user) return;

    const { data } = await supabase
      .from("sucursal")
      .select("nombre")
      .eq("idsucursal", user.idsucursal)
      .single();

    const titulo = document.getElementById("nombreBodega");
    const subtitulo = document.getElementById("subtituloBodega");

    if (!titulo || !subtitulo) return;

    if (user.idrol === 1) {
      titulo.textContent = "Bodega Central";
      subtitulo.textContent = "Administración";
    } else {
      titulo.textContent = "Bodega " + data.nombre;
      subtitulo.textContent = "Sucursal activa";
    }
  }

  cargarBodega();

  const nombreUser = document.getElementById("nombreUsuario");

if (nombreUser && user) {

  let rolTexto = user.idrol === 1 ? "Admin" : "Gerente";

  nombreUser.textContent = `${user.nombre} (${rolTexto})`;
}

});