// =========================
// VARIABLES
// =========================

const modalUsuario =
  document.getElementById(
    "modalUsuario"
  );


// =========================
// ABRIR MODAL
// =========================

async function abrirModalUsuario(){

  modalUsuario.style.display = "flex";

  await cargarRoles();

  await cargarSucursales();

}


// =========================
// CERRAR MODAL
// =========================

function cerrarModalUsuario(){

  modalUsuario.style.display = "none";

  // limpiar inputs
  document.getElementById(
    "usuarioNombre"
  ).value = "";

  document.getElementById(
    "usuarioEmail"
  ).value = "";

  document.getElementById(
    "usuarioPassword"
  ).value = "";

}


// =========================
// CARGAR ROLES
// =========================

async function cargarRoles(){

  const select =
    document.getElementById(
      "usuarioRol"
    );

  select.innerHTML = "";

  const { data } = await db
    .from("rol")
    .select("*");

  data.forEach(rol => {

    select.innerHTML += `

      <option value="${rol.idrol}">
        ${rol.nombre}
      </option>

    `;

  });

}


// =========================
// CARGAR SUCURSALES
// =========================

async function cargarSucursales(){

  const select =
    document.getElementById(
      "usuarioSucursal"
    );

  select.innerHTML = "";

  const { data } = await db
    .from("sucursal")
    .select("*");

  data.forEach(sucursal => {

    select.innerHTML += `

      <option value="${sucursal.idsucursal}">
        ${sucursal.nombre}
      </option>

    `;

  });

}


// =========================
// GUARDAR USUARIO
// =========================

async function guardarUsuario(){

  const nombre =
    document.getElementById(
      "usuarioNombre"
    ).value;

  const email =
    document.getElementById(
      "usuarioEmail"
    ).value;

  const password =
    document.getElementById(
      "usuarioPassword"
    ).value;

  const idrol =
    document.getElementById(
      "usuarioRol"
    ).value;

  const idsucursal =
    document.getElementById(
      "usuarioSucursal"
    ).value;


  // VALIDACIONES
  if(
    !nombre ||
    !email ||
    !password
  ){

    alert(
      "Completa todos los campos"
    );

    return;
  }


  // EMAIL REPETIDO
  const {
    data: existe
  } = await db
    .from("usuario")
    .select("*")
    .eq("email", email);

  if(existe.length > 0){

    alert(
      "El correo ya existe"
    );

    return;
  }


  // INSERT
  const { error } = await db
    .from("usuario")
    .insert([{

      nombre,
      email,
      password,
      idrol,
      idsucursal

    }]);


  if(error){

    console.log(error);

    alert(
      "Error al guardar usuario"
    );

    return;
  }


  alert(
    "Usuario registrado"
  );

  cerrarModalUsuario();

  cargarUsuarios();

}

// =========================
// CARGAR USUARIOS
// =========================

async function cargarUsuarios(){

  const tabla =
    document.getElementById(
      "tablaUsuarios"
    );

  tabla.innerHTML = "";


  // usuarios
  const {
    data: usuarios,
    error
  } = await db

    .from("usuario")

    .select("*");


  if(error){

    console.log(error);

    return;

  }


  // roles
  const {
    data: roles
  } = await db

    .from("rol")

    .select("*");


  // sucursales
  const {
    data: sucursales
  } = await db

    .from("sucursal")

    .select("*");


  usuarios.forEach(usuario => {

    // buscar rol
    const rol =
      roles.find(
        r => r.idrol == usuario.idrol
      );

    // buscar sucursal
    const sucursal =
      sucursales.find(
        s =>
          s.idsucursal ==
          usuario.idsucursal
      );

    tabla.innerHTML += `

      <tr>

        <td>
          ${usuario.nombre}
        </td>

        <td>
          ${usuario.email}
        </td>

        <td>
          ${rol?.nombre || "Sin rol"}
        </td>

        <td>
          ${sucursal?.nombre || "Sin sucursal"}
        </td>

        <td>

          <button
            class="btn-delete"
            onclick="eliminarUsuario(${usuario.idusuario})"
          >

            <i data-lucide="trash-2"></i>

          </button>

        </td>

      </tr>

    `;

  });

  lucide.createIcons();

}


// =========================
// ELIMINAR
// =========================

async function eliminarUsuario(id){

  const confirmar =
    confirm(
      "¿Eliminar usuario?"
    );

  if(!confirmar) return;

  await db
    .from("usuario")
    .delete()
    .eq("idusuario", id);

  cargarUsuarios();

}


// =========================
// INICIO
// =========================

cargarUsuarios();