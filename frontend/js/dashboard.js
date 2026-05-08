// =========================
// ACTUALIZAR TODO DASHBOARD
// =========================

async function actualizarDashboard(){

  await cargarDashboard();

  await cargarStockBajo();

  await cargarTransferencias();

  await cargarResumenSucursales();

}

// =========================
// DASHBOARD
// =========================

async function cargarDashboard(){

  // PRODUCTOS
  const { count: productos } = await db
    .from("producto")
    .select("*", {
      count: "exact",
      head: true
    });

  document.getElementById(
    "totalProductos"
  ).innerText = productos;


  // SUCURSALES
  const { count: sucursales } = await db
    .from("sucursal")
    .select("*", {
      count: "exact",
      head: true
    });

  document.getElementById(
    "totalSucursales"
  ).innerText = sucursales;


  // STOCK TOTAL
  const { data: inventario } = await db
    .from("inventario")
    .select("cantidad");

  let total = 0;

  inventario.forEach(item => {

    total += item.cantidad;

  });

  document.getElementById(
    "stockTotal"
  ).innerText = total;

}




// =========================
// STOCK BAJO
// =========================

async function cargarStockBajo(){

  const { data, error } = await db
    .from("inventario")
    .select(`
      cantidad,

      producto(
        nombre
      ),

      ubicacion(
        bodega(
          sucursal(
            nombre
          )
        )
      )
    `)
    .lte("cantidad", 10);

  if(error){
    console.log(error);
    return;
  }

  const lista =
    document.getElementById(
      "stockBajoLista"
    );

  lista.innerHTML = "";

  data.forEach(item => {

    lista.innerHTML += `

      <div class="stock-item">

        <div>

          <h4>
            ${item.producto.nombre}
          </h4>

          <small>
            ${item.ubicacion.bodega.sucursal.nombre}
          </small>

        </div>

        <span>
          ${item.cantidad} unidades
        </span>

      </div>

    `;

  });

}




// =========================
// TRANSFERENCIAS
// =========================

async function cargarTransferencias(){

  const { data, error } = await db
    .from("transferencia")
    .select(`
      idtransferencia,
      fecha,

      estadotransferencia(
        nombre
      )
    `)
    .limit(5);

  if(error){
    console.log(error);
    return;
  }

  const lista =
    document.getElementById(
      "transferenciasLista"
    );

  lista.innerHTML = "";

  data.forEach(item => {

    lista.innerHTML += `

      <div class="transfer-item">

        <div>

          <h4>
            Transferencia #${item.idtransferencia}
          </h4>

          <small>
            ${new Date(item.fecha)
              .toLocaleDateString()}
          </small>

        </div>

        <span class="estado">
          ${item.estadotransferencia.nombre}
        </span>

      </div>

    `;

  });

}




// =========================
// RESUMEN SUCURSALES
// =========================

async function cargarResumenSucursales(){

  const { data, error } = await db
    .from("sucursal")
    .select(`
      nombre,

      bodega(
        ubicacion(
          inventario(
            cantidad,
            idproducto
          )
        )
      )
    `);

  if(error){
    console.log(error);
    return;
  }

  const tabla =
    document.getElementById(
      "tablaSucursales"
    );

  tabla.innerHTML = "";

  data.forEach(sucursal => {

    let total = 0;

    let productos = new Set();

    sucursal.bodega.forEach(bodega => {

      bodega.ubicacion.forEach(ubicacion => {

        ubicacion.inventario.forEach(item => {

          total += item.cantidad;

          productos.add(
            item.idproducto
          );

        });

      });

    });

    tabla.innerHTML += `

      <tr>

        <td>
          ${sucursal.nombre}
        </td>

        <td>
          ${productos.size}
        </td>

        <td>
          ${total}
        </td>

      </tr>

    `;

  });

}

// iniciar dashboard
actualizarDashboard();