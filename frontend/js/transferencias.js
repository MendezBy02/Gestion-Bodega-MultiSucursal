let transferenciasGlobal = [];



// =========================
// MODAL
// =========================

function abrirModalTransferencia(){

  document
    .getElementById(
      "modalTransferencia"
    )
    .style.display = "flex";



  verificarStockTransferencia();

}



function cerrarModalTransferencia(){

  document
    .getElementById(
      "modalTransferencia"
    )
    .style.display = "none";



  // ======================
  // USUARIO
  // ======================

  const usuario =
    JSON.parse(
      localStorage.getItem("user")
    );



  // ======================
  // CAMPOS
  // ======================

  document.getElementById(
    "transferProducto"
  ).value = "";



  const origen =
    document.getElementById(
      "transferOrigen"
    );



  // ADMIN
  if(usuario?.rol === "admin"){

    origen.value = "";

  }

  // GERENTE
  else{

    origen.value =
      usuario.sucursal;

  }



  document.getElementById(
    "transferDestino"
  ).value = "";



  document.getElementById(
    "transferCantidad"
  ).value = 1;



  document.getElementById(
    "transferNotas"
  ).value = "";



  // ======================
  // ESTADO STOCK
  // ======================

  const estadoDiv =
    document.getElementById(
      "estadoStockTransfer"
    );



  estadoDiv.className =
    "stock-status info";



  estadoDiv.innerHTML =
    "Selecciona producto y sucursal";



  // ======================
  // RESET STOCK
  // ======================

  window.stockDisponibleActual = 0;



  verificarStockTransferencia();

}



// =========================
// CARGAR SELECTS
// =========================

async function cargarTransferSelects(){

  // ======================
  // PRODUCTOS
  // ======================

  const {
    data: productos
  } = await db

    .from("producto")

    .select("*")

    .order("nombre");



  const productoSelect =
    document.getElementById(
      "transferProducto"
    );



  productoSelect.innerHTML = `
    <option value="">
      Seleccionar producto...
    </option>
  `;



  productos.forEach(producto => {

    productoSelect.innerHTML += `
      <option value="${producto.idproducto}">
        ${producto.nombre}
      </option>
    `;

  });




  // ======================
  // USUARIO
  // ======================

  const usuario =
    JSON.parse(
      localStorage.getItem("user")
    );



  const esAdmin =
    usuario?.rol === "admin";



  // ======================
  // SUCURSALES
  // ======================

  const {
    data: sucursales
  } = await db

    .from("sucursal")

    .select("*")

    .order("nombre");



  const origen =
    document.getElementById(
      "transferOrigen"
    );



  const destino =
    document.getElementById(
      "transferDestino"
    );



  origen.innerHTML = `
    <option value="">
      Seleccionar...
    </option>
  `;



  destino.innerHTML = `
    <option value="">
      Seleccionar...
    </option>
  `;



  // ======================
  // ADMIN
  // ======================

  if(esAdmin){

    origen.disabled = false;



    sucursales.forEach(sucursal => {

      origen.innerHTML += `
        <option value="${sucursal.idsucursal}">
          ${sucursal.nombre}
        </option>
      `;



      destino.innerHTML += `
        <option value="${sucursal.idsucursal}">
          ${sucursal.nombre}
        </option>
      `;

    });

  }



  // ======================
  // GERENTE
  // ======================

  else{

    origen.disabled = true;



    const sucursalGerente =
      sucursales.find(s => {

        return (
          s.idsucursal
          ==
          usuario.sucursal
        );

      });



    // SUCURSAL ORIGEN

    if(sucursalGerente){

      origen.innerHTML += `
        <option
          value="${sucursalGerente.idsucursal}"
          selected
        >
          ${sucursalGerente.nombre}
        </option>
      `;

    }



    // DESTINOS

    sucursales.forEach(sucursal => {

      if(
        sucursal.idsucursal
        !=
        usuario.sucursal
      ){

        destino.innerHTML += `
          <option value="${sucursal.idsucursal}">
            ${sucursal.nombre}
          </option>
        `;

      }

    });

  }

}

cargarTransferSelects();



// =========================
// FILTRAR
// =========================

function filtrarTransferencias(estado){

  document
    .querySelectorAll(".filter-btn")
    .forEach(btn => {

      btn.classList.remove(
        "active"
      );

    });



  event.target.classList.add(
    "active"
  );



  // TODAS

  if(estado === "todas"){

    renderTransferencias(
      transferenciasGlobal
    );

    return;
  }



  // FILTRADAS

  const filtradas =
    transferenciasGlobal.filter(t => {

      return (
        t.estadotransferencia.nombre
        ===
        estado
      );

    });



  renderTransferencias(
    filtradas
  );

}



// =========================
// VERIFICAR STOCK
// =========================

async function verificarStockTransferencia(){

  const producto =
    document.getElementById(
      "transferProducto"
    ).value;



  const sucursal =
    document.getElementById(
      "transferOrigen"
    ).value;



  const estadoDiv =
    document.getElementById(
      "estadoStockTransfer"
    );



  // VALIDAR

  if(!producto || !sucursal){

    estadoDiv.className =
      "stock-status info";



    estadoDiv.innerHTML =
      "Selecciona producto y sucursal";



    return;
  }



  // ======================
  // UBICACIONES
  // ======================

  const {
    data: ubicaciones
  } = await db

    .from("ubicacion")

    .select(`
      idubicacion,

      bodega(
        idsucursal
      )
    `);



  const ubicacion =
    ubicaciones.find(u => {

      return (
        u.bodega.idsucursal
        ==
        sucursal
      );

    });



  // NO UBICACIÓN

  if(!ubicacion){

    estadoDiv.className =
      "stock-status sin";



    estadoDiv.innerHTML =
      "Sin ubicación";



    return;
  }



  // ======================
  // INVENTARIO
  // ======================

  const {
    data: inventario
  } = await db

    .from("inventario")

    .select(`
      cantidad,

      producto(
        stockminimo
      )
    `)

    .eq(
      "idproducto",
      producto
    )

    .eq(
      "idubicacion",
      ubicacion.idubicacion
    )

    .maybeSingle();



  // SIN STOCK

  if(!inventario){

    estadoDiv.className =
      "stock-status sin";



    estadoDiv.innerHTML =
      "❌ Sin existencias";



    return;
  }



  const stock =
    inventario.cantidad;



  window.stockDisponibleActual =
    stock;



  const minimo =
    inventario.producto.stockminimo;



  // DISPONIBLE

  if(stock > minimo){

    estadoDiv.className =
      "stock-status disponible";



    estadoDiv.innerHTML = `
      ✅ Disponible
      (${stock} unidades)
    `;



    return;
  }



  // BAJO STOCK

  if(stock > 0){

    estadoDiv.className =
      "stock-status bajo";



    estadoDiv.innerHTML = `
      ⚠️ Bajo stock
      (${stock} unidades)
    `;



    return;
  }



  // SIN STOCK

  estadoDiv.className =
    "stock-status sin";



  estadoDiv.innerHTML =
    "❌ Sin existencias";

}



// =========================
// CREAR TRANSFERENCIA
// =========================

async function crearTransferencia(){

  const producto =
    document.getElementById(
      "transferProducto"
    ).value;



  const origen =
    document.getElementById(
      "transferOrigen"
    ).value;



  const destino =
    document.getElementById(
      "transferDestino"
    ).value;



  const cantidad =
    parseInt(
      document.getElementById(
        "transferCantidad"
      ).value
    );



  const notas =
    document.getElementById(
      "transferNotas"
    ).value;



  // VALIDACIONES

  if(
    !producto ||
    !origen ||
    !destino
  ){

    alert(
      "Completa todos los campos"
    );

    return;
  }



  if(origen === destino){

    alert(
      "Origen y destino no pueden ser iguales"
    );

    return;
  }



  if(
    cantidad >
    window.stockDisponibleActual
  ){

    alert(
      "No hay suficiente stock"
    );

    return;
  }



  // ======================
  // CREAR
  // ======================

  const {
    data: transferencia
  } = await db

    .from("transferencia")

    .insert([{

      idsucursalorigen:
        parseInt(origen),

      idsucursaldestino:
        parseInt(destino),

      idestado: 1,

      notas: notas

    }])

    .select()

    .single();



  // DETALLE

  await db

    .from("detalletransferencia")

    .insert([{

      idtransferencia:
        transferencia.idtransferencia,

      idproducto:
        parseInt(producto),

      cantidad:
        cantidad

    }]);



  cerrarModalTransferencia();

  cargarTransferencias();

  actualizarDashboard();



  alert(
    "Transferencia creada"
  );

}



// =========================
// CAMBIAR ESTADO
// =========================

async function cambiarEstado(id, estado){

  await db

    .from("transferencia")

    .update({
      idestado: estado
    })

    .eq(
      "idtransferencia",
      id
    );



  cargarTransferencias();

  actualizarDashboard();

}



// =========================
// COMPLETAR
// =========================

async function completarTransferencia(id){

  // ======================
  // TRANSFERENCIA
  // ======================

  const {
    data: transferencia
  } = await db

    .from("transferencia")

    .select(`
      *,
      detalletransferencia(
        cantidad,
        idproducto
      )
    `)

    .eq(
      "idtransferencia",
      id
    )

    .single();



  const detalle =
    transferencia
    .detalletransferencia[0];



  const producto =
    detalle.idproducto;



  const cantidad =
    detalle.cantidad;



  // ======================
  // UBICACIONES
  // ======================

  const {
    data: ubicaciones
  } = await db

    .from("ubicacion")

    .select(`
      idubicacion,
      bodega(
        idsucursal
      )
    `);



  const origen =
    ubicaciones.find(u => {

      return (
        u.bodega.idsucursal
        ==
        transferencia.idsucursalorigen
      );

    });



  const destino =
    ubicaciones.find(u => {

      return (
        u.bodega.idsucursal
        ==
        transferencia.idsucursaldestino
      );

    });



  // ======================
  // INVENTARIO ORIGEN
  // ======================

  const {
    data: inventarioOrigen
  } = await db

    .from("inventario")

    .select("*")

    .eq(
      "idproducto",
      producto
    )

    .eq(
      "idubicacion",
      origen.idubicacion
    )

    .single();



  // RESTAR

  await db

    .from("inventario")

    .update({

      cantidad:
        inventarioOrigen.cantidad
        -
        cantidad

    })

    .eq(
      "idinventario",
      inventarioOrigen.idinventario
    );



  // ======================
  // INVENTARIO DESTINO
  // ======================

  const {
    data: inventarioDestino
  } = await db

    .from("inventario")

    .select("*")

    .eq(
      "idproducto",
      producto
    )

    .eq(
      "idubicacion",
      destino.idubicacion
    )

    .maybeSingle();



  // SUMAR

  if(inventarioDestino){

    await db

      .from("inventario")

      .update({

        cantidad:
          inventarioDestino.cantidad
          +
          cantidad

      })

      .eq(
        "idinventario",
        inventarioDestino.idinventario
      );

  }

  else{

    await db

      .from("inventario")

      .insert([{

        idproducto:
          producto,

        idubicacion:
          destino.idubicacion,

        cantidad:
          cantidad

      }]);

  }



  // ======================
  // COMPLETAR
  // ======================

  await db

    .from("transferencia")

    .update({
      idestado: 2
    })

    .eq(
      "idtransferencia",
      id
    );



  // ======================
  // ACTUALIZAR
  // ======================

  cargarTransferencias();

  actualizarDashboard();

  cargarInventario();



  alert(
    "Transferencia completada"
  );

}



// =========================
// CARGAR TRANSFERENCIAS
// =========================

async function cargarTransferencias(){

  const {
    data
  } = await db

    .from("transferencia")

    .select(`
      *,
      estadotransferencia(
        nombre
      ),

      detalletransferencia(
        cantidad,

        producto(
          nombre,
          sku
        )
      ),

      sucursal_origen:sucursal!transferencia_idsucursalorigen_fkey(
        nombre
      ),

      sucursal_destino:sucursal!transferencia_idsucursaldestino_fkey(
        nombre
      )
    `)

    .order(
      "idtransferencia",
      {
        ascending:false
      }
    );



  transferenciasGlobal = data;

  renderTransferencias(data);

}

cargarTransferencias();



// =========================
// RENDER
// =========================

function renderTransferencias(datos){

  const lista =
    document.getElementById(
      "listaTransferencias"
    );



  lista.innerHTML = "";



  // ======================
  // USUARIO
  // ======================

  const usuario =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    );



  const esAdmin =
    usuario?.rol === "admin";



  const sucursalUsuario =
    usuario?.sucursal;



  datos.forEach(item => {

    const detalle =
      item.detalletransferencia?.[0];



    if(!detalle){
      return;
    }



    const estado =
      item.estadotransferencia.nombre;

    let clase = "";



    if(estado === "Pendiente"){
      clase = "status-pendiente";
    }

    if(estado === "En transito"){
      clase = "status-transito";
    }

    if(estado === "Completado"){
      clase = "status-completado";
    }

    if(estado === "Cancelado"){
      clase = "status-cancelado";
    }



    // ======================
    // PERMISOS
    // ======================

    const puedeCompletarGerente =
      sucursalUsuario
      ==
      item.idsucursaldestino;



    const puedeCancelar =
      sucursalUsuario
      ==
      item.idsucursalorigen;



    // ======================
    // HTML
    // ======================

    lista.innerHTML += `

      <div class="transfer-card">

        <!-- HEADER -->
        <div class="transfer-top">

          <div>

            <div class="transfer-product">
              ${detalle.producto.nombre}
            </div>

            <div class="transfer-info">
              SKU:
              ${detalle.producto.sku}
              -
              ${detalle.cantidad}
              unidades
            </div>

          </div>

          <div class="
            transfer-status
            ${clase}
          ">
            ${estado}
          </div>

        </div>



        <!-- SUCURSALES -->
        <div class="transfer-middle">

          <div class="transfer-box">

            <small>Origen</small>

            <h4>
              ${item.sucursal_origen.nombre}
            </h4>

          </div>

          <div class="transfer-arrow">

            <i data-lucide="arrow-left-right"></i>

          </div>

          <div class="transfer-box">

            <small>Destino</small>

            <h4>
              ${item.sucursal_destino.nombre}
            </h4>

          </div>

        </div>



        <!-- NOTAS -->
        <div class="transfer-notes">

          <strong>Notas:</strong>

          ${item.notas || "Sin notas"}

        </div>



        <!-- BOTONES -->
        <div class="transfer-actions">

          ${
            estado === "Pendiente"
            &&
            (
              esAdmin
              ||
              puedeCancelar
            )
            ?
            `
              <button
                class="btn-blue"
                onclick="
                  cambiarEstado(
                    ${item.idtransferencia},
                    4
                  )
                "
              >
                En tránsito
              </button>
            `
            :
            ""
          }



          ${
            estado === "En transito"
            &&
            (
              esAdmin
              ||
              puedeCompletarGerente
            )
            ?
            `
              <button
                class="btn-green"
                onclick="
                  completarTransferencia(
                    ${item.idtransferencia}
                  )
                "
              >
                Completar
              </button>
            `
            :
            ""
          }



          ${
            (
              estado === "Pendiente"
              ||
              estado === "En transito"
            )
            &&
            (
              esAdmin
              ||
              puedeCancelar
            )
            ?
            `
              <button
                class="btn-red"
                onclick="
                  cambiarEstado(
                    ${item.idtransferencia},
                    3
                  )
                "
              >
                Cancelar
              </button>
            `
            :
            ""
          }

        </div>

      </div>

    `;

  });



  lucide.createIcons();

}