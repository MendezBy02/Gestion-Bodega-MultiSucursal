// =========================================
// CARGAR SUCURSALES
// =========================================

async function cargarSucursales(){

  const { data, error } = await db

    .from("sucursal")

    .select(`
      idsucursal,
      nombre,
      direccion,
      contacto,

      usuario(
        idusuario,
        nombre,
        idrol
      ),

      bodega(
        idbodega,

        ubicacion(
          inventario(
            cantidad,

            producto(
              idproducto,
              stockminimo
            )
          )
        )
      )
    `);


  // error
  if(error){

    console.log(error);

    return;

  }


  // render
  renderSucursales(data);

}


// =========================================
// RENDER SUCURSALES
// =========================================

function renderSucursales(data){

  const grid =
    document.getElementById(
      "sucursalesGrid"
    );

  grid.innerHTML = "";


  data.forEach(sucursal => {

    let stockTotal = 0;

    let productos = new Set();

    let stockBajo = 0;


    // =====================================
    // GERENTE
    // =====================================

    const gerente =
      sucursal.usuario?.find(
        user => user.idrol === 2
      );


    // =====================================
    // INVENTARIO
    // =====================================

    sucursal.bodega?.forEach(bodega => {

      bodega.ubicacion?.forEach(ubicacion => {

        ubicacion.inventario?.forEach(item => {

          // stock total
          stockTotal += item.cantidad;

          // productos únicos
          productos.add(
            item.producto.idproducto
          );

          // stock bajo
          if(
            item.cantidad <=
            item.producto.stockminimo
          ){

            stockBajo++;

          }

        });

      });

    });


    // =====================================
    // CARD
    // =====================================

    grid.innerHTML += `

      <div class="sucursal-card">


        <!-- HEADER -->
        <div class="sucursal-header">

          <div class="sucursal-icon">

            <i data-lucide="warehouse"></i>

          </div>


          <div class="sucursal-header-info">

            <h2>
              ${sucursal.nombre}
            </h2>

            <p>

              <i data-lucide="map-pin"></i>

              ${sucursal.direccion}

            </p>

          </div>

        </div>


        <!-- BODY -->
        <div class="sucursal-body">


          <!-- GERENTE -->
          <div class="sucursal-gerente">

            <div class="contact-item">

              <i data-lucide="user"></i>

              <span>
                ${
                  gerente
                    ? gerente.nombre
                    : "Sin gerente"
                }
              </span>

            </div>

          </div>


          <!-- CONTACTO -->
          <div class="sucursal-contacto">

            <div class="contact-item">

              <i data-lucide="phone"></i>

              <span>
                ${
                  sucursal.contacto
                  || "Sin contacto"
                }
              </span>

            </div>

          </div>


          <!-- LINEA -->
          <div class="linea"></div>


          <!-- STATS -->
          <div class="sucursal-stats">


            <!-- SKUS -->
            <div class="stat-box">

              <small>
                SKUs
              </small>

              <h3>
                ${productos.size}
              </h3>

            </div>


            <!-- STOCK -->
            <div class="stat-box">

              <small>
                Stock Total
              </small>

              <h3>
                ${stockTotal}
              </h3>

            </div>

          </div>


          <!-- ALERTA -->
          ${
            stockBajo > 0
            ?
            `
              <div class="stock-alert">

                <i data-lucide="alert-triangle"></i>

                ${stockBajo}
                productos con stock bajo

              </div>
            `
            :
            ""
          }


          <!-- LINEA -->
          <div class="linea"></div>


          <!-- BOTONES -->
          <div class="sucursal-actions">


            <!-- EDITAR -->
            <button
              class="btn-edit"
              onclick="editarSucursal(${sucursal.idsucursal})"
            >

              <i data-lucide="pencil"></i>

              Editar

            </button>


            <!-- ELIMINAR -->
            ${
  JSON.parse(localStorage.getItem("user"))?.rol
  ===
  "Administrador"

  ?

  `
    <button
      class="btn-delete"
      onclick="eliminarSucursal(${sucursal.idsucursal})"
    >

      <i data-lucide="trash-2"></i>

      Eliminar

    </button>
  `

  :

  ""

}

          </div>

        </div>

      </div>

    `;

  });


  // =====================================
  // ICONOS
  // =====================================

  lucide.createIcons();

}



// =========================================
// VARIABLES
// =========================================

let sucursalEditando = null;



// =========================================
// EDITAR SUCURSAL
// =========================================

async function editarSucursal(id){

  const usuario =
    JSON.parse(
      localStorage.getItem("user")
    );

  // =====================================
  // VALIDAR GERENTE
  // =====================================

  if(
    usuario.rol === "Gerente" &&
    usuario.sucursal != id
  ){

    mostrarToast(
      "Solo puedes editar tu sucursal"
    );

    return;

  }

  sucursalEditando = id;

  const modal =
    document.getElementById(
      "modalEditarSucursal"
    );

  modal.style.display = "flex";

  // buscar sucursal
  const { data, error } = await db

    .from("sucursal")

    .select("*")

    .eq(
      "idsucursal",
      id
    )

    .single();

  // error
  if(error){

    console.log(error);

    mostrarToast(
      "Error al cargar sucursal"
    );

    return;

  }

  // llenar inputs
  document.getElementById(
    "editNombreSucursal"
  ).value = data.nombre;

  document.getElementById(
    "editDireccionSucursal"
  ).value = data.direccion;

  document.getElementById(
    "editContactoSucursal"
  ).value =
    data.contacto || "";

}



// =========================================
// CERRAR MODAL
// =========================================

function cerrarModalSucursal(){

  document.getElementById(
    "modalEditarSucursal"
  ).style.display = "none";

}



// =========================================
// GUARDAR EDICION
// =========================================

async function guardarEdicionSucursal(){

  const nombre =
    document.getElementById(
      "editNombreSucursal"
    ).value;

  const direccion =
    document.getElementById(
      "editDireccionSucursal"
    ).value;

  const contacto =
    document.getElementById(
      "editContactoSucursal"
    ).value;


  // validaciones
  if(
    !nombre ||
    !direccion
  ){

    mostrarToast(
      "Completa todos los campos"
    );

    return;

  }


  // actualizar
  const { error } = await db

    .from("sucursal")

    .update({

      nombre,
      direccion,
      contacto

    })

    .eq(
      "idsucursal",
      sucursalEditando
    );


  // error
  if(error){

    console.log(error);

    mostrarToast(
      "Error al actualizar"
    );

    return;

  }


  // éxito
  mostrarToast(
    "Sucursal actualizada"
  );


  cerrarModalSucursal();

  cargarSucursales();

}





  
// =========================================
// ELIMINAR SUCURSAL
// =========================================

async function eliminarSucursal(id){

  const usuario =
    JSON.parse(
      localStorage.getItem("user")
    );

  // SOLO ADMINISTRADOR
  if(
    !usuario ||
    usuario.rol !== "Administrador"
  ){

    mostrarToast(
      "No tienes permisos para eliminar sucursales"
    );

    return;

  }

  mostrarConfirmacion(

    "¿Eliminar sucursal?",

    async () => {

      const { error } = await db

        .from("sucursal")

        .delete()

        .eq(
          "idsucursal",
          id
        );

      // error
      if(error){

        console.log(error);

        mostrarToast(
          "Error al eliminar"
        );

        return;

      }

      // éxito
      mostrarToast(
        "Sucursal eliminada"
      );

      // recargar
      cargarSucursales();

      if(
        typeof cargarDashboard
        ===
        "function"
      ){

        cargarDashboard();

      }

    }

  );

}



// =========================================
// INICIO
// =========================================

cargarSucursales();
