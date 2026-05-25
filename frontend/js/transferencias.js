// =========================================
// VARIABLES
// =========================================

let transferenciasGlobal = [];



// =========================================
// AJUSTAR HORA EL SALVADOR
// =========================================

function convertirHoraSV(fecha){

  const fechaUTC =
    new Date(fecha);

  // El Salvador UTC-6
  fechaUTC.setHours(
    fechaUTC.getHours() - 6
  );

  return fechaUTC;

}



// =========================================
// FORMATEAR FECHA
// =========================================

function formatearFecha(fecha){

  if(!fecha) return "-";

  const fechaSV =
    convertirHoraSV(fecha);

  return fechaSV.toLocaleDateString(
    "es-SV"
  );

}



// =========================================
// FORMATEAR HORA
// =========================================

function formatearHora(fecha){

  if(!fecha) return "-";

  const fechaSV =
    convertirHoraSV(fecha);

  return fechaSV.toLocaleTimeString(
    "es-SV",
    {

      hour: "2-digit",

      minute: "2-digit",

      hour12: true

    }
  );

}



// =========================================
// MODAL
// =========================================

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


  const usuario =
    JSON.parse(
      localStorage.getItem("user")
    );


  document.getElementById(
    "transferProducto"
  ).value = "";


  const origen =
    document.getElementById(
      "transferOrigen"
    );


  // admin
  if(usuario?.rol === "Administrador"){

    origen.value = "";

  }

  // gerente
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


  const estadoDiv =
    document.getElementById(
      "estadoStockTransfer"
    );


  estadoDiv.className =
    "stock-status info";


  estadoDiv.innerHTML =
    "Selecciona producto y sucursal";


  window.stockDisponibleActual = 0;

}



// =========================================
// CARGAR SELECTS
// =========================================

async function cargarTransferSelects(){

  // productos
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



  // usuario
  const usuario =
    JSON.parse(
      localStorage.getItem("user")
    );


  const esAdmin =
    usuario?.rol === "Administrador";


  // sucursales
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


  // admin
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


  // gerente
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


    // origen
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


    // destinos
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



// =========================================
// FILTRAR
// =========================================

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


  // todas
  if(estado === "todas"){

    renderTransferencias(
      transferenciasGlobal
    );

    return;

  }


  // filtradas
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



// =========================================
// VERIFICAR STOCK
// =========================================

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


  // validar
  if(!producto || !sucursal){

    estadoDiv.className =
      "stock-status info";


    estadoDiv.innerHTML =
      "Selecciona producto y sucursal";

    return;

  }


  // ubicaciones
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


  // sin ubicación
  if(!ubicacion){

    estadoDiv.className =
      "stock-status sin";

    estadoDiv.innerHTML =
      "❌ Sin ubicación";

    return;

  }


  // inventario
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


  // sin stock
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


  // disponible
  if(stock > minimo){

    estadoDiv.className =
      "stock-status disponible";

    estadoDiv.innerHTML = `
      ✅ Disponible
      (${stock} unidades)
    `;

    return;

  }


  // bajo stock
  if(stock > 0){

    estadoDiv.className =
      "stock-status bajo";

    estadoDiv.innerHTML = `
      ⚠️ Bajo stock
      (${stock} unidades)
    `;

    return;

  }


  // sin existencias
  estadoDiv.className =
    "stock-status sin";

  estadoDiv.innerHTML =
    "❌ Sin existencias";

}



// =========================================
// CREAR TRANSFERENCIA
// =========================================

async function crearTransferencia(){

  const usuario =
    JSON.parse(
      localStorage.getItem("user")
    );


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


  // validaciones
  if(
    !producto ||
    !origen ||
    !destino
  ){

    mostrarToast(
      "Completa todos los campos"
    );

    return;

  }


  if(origen === destino){

    mostrarToast(
      "Origen y destino no pueden ser iguales"
    );

    return;

  }


  if(
    cantidad >
    window.stockDisponibleActual
  ){

    mostrarToast(
      "No hay suficiente stock"
    );

    return;

  }


  // transferencia
  const {
    data: transferencia,
    error
  } = await db

    .from("transferencia")

    .insert([{

      idsucursalorigen:
        parseInt(origen),

      idsucursaldestino:
        parseInt(destino),

      idestado: 1,

      notas: notas,

      idusuarioenvio:
        usuario.id,

      fecha_creacion:
        new Date().toISOString()

    }])

    .select()

    .single();


  if(error){

    console.log(error);

    mostrarToast(
      "Error al crear transferencia"
    );

    return;

  }


  // detalle
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


  mostrarToast(
    "Transferencia creada"
  );

}



// =========================================
// CAMBIAR ESTADO
// =========================================

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



// =========================================
// COMPLETAR
// =========================================

async function completarTransferencia(id){

  const usuario =
    JSON.parse(
      localStorage.getItem("user")
    );


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


  // ubicaciones
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


  // inventario origen
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


  // restar
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


  // inventario destino
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


  // sumar
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


  // completar
  await db

    .from("transferencia")

    .update({

      idestado: 2,

      idusuariorecibe:
        usuario.id,

      fecha_completada:
        new Date().toISOString()

    })

    .eq(
      "idtransferencia",
      id
    );


  cargarTransferencias();

  actualizarDashboard();

  cargarInventario();


  mostrarToast(
    "Transferencia completada"
    
  );

  await cargarInventario();
}



// =========================================
// CARGAR TRANSFERENCIAS
// =========================================

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

      usuario_envio:usuario!fk_usuario_envio(
        nombre
      ),

      usuario_recibe:usuario!fk_usuario_recibe(
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



// =========================================
// RENDER
// =========================================

function renderTransferencias(datos){

  const lista =
    document.getElementById(
      "listaTransferencias"
    );


  lista.innerHTML = "";


  const usuario =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    );


  const esAdmin =
    usuario?.rol === "Administrador";


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


    // permisos
    const puedeCompletarGerente =
      sucursalUsuario
      ==
      item.idsucursaldestino;


    const puedeCancelar =
      sucursalUsuario
      ==
      item.idsucursalorigen;


    // fechas
    const fechaSolicitud =
      item.fecha_creacion;

    const fechaCompletada =
      item.fecha_completada;


    // html
    lista.innerHTML += `

      <div class="transfer-card">

        <!-- TOP -->
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


          <div class="transfer-right">

            <div class="
              transfer-status
              ${clase}
            ">
              ${estado}
            </div>


            <div class="transfer-dates">

              ${
                fechaSolicitud
                ?
                `
                  <small>

                    Solicitud:
                    ${formatearFecha(
                      fechaSolicitud
                    )}

                  </small>

                  <small>

                    ${formatearHora(
                      fechaSolicitud
                    )}

                  </small>
                `
                :
                ""
              }


              ${
                fechaCompletada
                ?
                `
                  <small>

                    Completada:
                    ${formatearFecha(
                      fechaCompletada
                    )}

                  </small>

                  <small>

                    ${formatearHora(
                      fechaCompletada
                    )}

                  </small>
                `
                :
                ""
              }

            </div>

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



        <!-- USUARIOS -->
        <div class="transfer-users">

          <small>

            <strong>
              Enviado por:
            </strong>

            ${
              item.usuario_envio?.nombre
              || "No disponible"
            }

          </small>

          <small>

            <strong>
              Recibido por:
            </strong>

            ${
              item.usuario_recibe?.nombre
              || "Pendiente"
            }

          </small>

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

// =========================================
// EXPORTAR PDF
// =========================================

async function exportarPDFTransferencias(){

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();


  // título
  doc.setFontSize(18);

  doc.text(
    "Reporte de Transferencias",
    14,
    20
  );


  // fecha
  doc.setFontSize(11);

  doc.text(
    `Generado: ${new Date().toLocaleString()}`,
    14,
    28
  );


  // filas
  const filas = [];


  transferenciasGlobal.forEach(t => {

    const detalle =
      t.detalletransferencia?.[0];

    filas.push([

      detalle?.producto?.nombre || "-",

      detalle?.producto?.sku || "-",

      detalle?.cantidad || 0,

      t.sucursal_origen?.nombre || "-",

      t.sucursal_destino?.nombre || "-",

      t.estadotransferencia?.nombre || "-",

      t.usuario_envio?.nombre || "-",

      t.usuario_recibe?.nombre || "-",

      formatearFecha(
        t.fecha_creacion
      ),

      formatearHora(
        t.fecha_creacion
      )

    ]);

  });


  // tabla
  doc.autoTable({

    startY: 35,

    head: [[

      "Producto",
      "SKU",
      "Cantidad",
      "Origen",
      "Destino",
      "Estado",
      "Enviado por",
      "Recibido por",
      "Fecha",
      "Hora"

    ]],

    body: filas,

    styles: {

      fontSize: 8

    },

    headStyles: {

      fillColor: [37, 99, 235]

    }

  });


  // descargar
  doc.save(
    "transferencias.pdf"
  );


  mostrarToast(
    "PDF exportado"
  );

}