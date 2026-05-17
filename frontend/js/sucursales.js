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

  if(error){

    console.log(error);

    return;

  }

  renderSucursales(data);

}


// =========================================
// RENDER
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

    sucursal.bodega.forEach(bodega => {

      bodega.ubicacion.forEach(ubicacion => {

        ubicacion.inventario.forEach(item => {

          stockTotal += item.cantidad;

          productos.add(
            item.producto.idproducto
          );

          if(
            item.cantidad
            <=
            item.producto.stockminimo
          ){

            stockBajo++;

          }

        });

      });

    });
    lucide.createIcons();
    grid.innerHTML += `
    

      <div class="sucursal-card">

        <!-- TOP -->
        <div class="sucursal-top">

          <div class="sucursal-icon"></div>

          <div class="sucursal-info">

            <h3>
              ${sucursal.nombre}
            </h3>

            <p>
              📍 ${sucursal.direccion}
            </p>

          </div>

        </div>


        <!-- BODY -->
        <div class="sucursal-body">

          <div class="sucursal-stats">

            <div class="stat">

              <h4>SKUs</h4>

              <p>
                ${productos.size}
              </p>

            </div>

            <div class="stat">

              <h4>Stock Total</h4>

              <p>
                ${stockTotal}
              </p>

            </div>

          </div>


          ${
            stockBajo > 0
            ?
            `
              <div class="stock-alert">

                ${stockBajo}
                productos con stock bajo

              </div>
            `
            :
            ""
          }


        <div class="sucursal-actions">

            <button
                class="btn-edit"
                onclick="editarSucursal(${sucursal.idsucursal})"
            >

                <i data-lucide="pencil"></i>

                Editar

            </button>

            <button
                class="btn-delete"
                onclick="eliminarSucursal(${sucursal.idsucursal})"
            >

                <i data-lucide="trash-2"></i>

                Eliminar

            </button>

        </div>

    `;

  });

}

// =========================================
// EDITAR
// =========================================

function editarSucursal(id){

  alert(
    "Editar sucursal ID: " + id
  );

}


// =========================================
// ELIMINAR
// =========================================

async function eliminarSucursal(id){

  const confirmar =
    confirm(
      "¿Eliminar sucursal?"
    );

  if(!confirmar) return;

  const { error } = await db
    .from("sucursal")
    .delete()
    .eq("idsucursal", id);

  if(error){

    console.log(error);

    alert("Error al eliminar");

    return;

  }

  alert("Sucursal eliminada");

  cargarSucursales();

  cargarDashboard();

}

// =========================================
// INICIO
// =========================================

cargarSucursales();