// =========================================
// VARIABLES
// =========================================

let inventarioGlobal = [];


// =========================================
// CARGAR INVENTARIO
// =========================================

async function cargarInventario(){

  const { data, error } = await db
    .from("inventario")
    .select(`
      idinventario,
      cantidad,

      producto(
        idproducto,
        nombre,
        stockminimo,

        categoria(
          nombre
        )
      ),

      ubicacion(
        idubicacion,

        bodega(
          nombre
        )
      )
    `);

  if(error){

    console.log(error);

    return;

  }

  inventarioGlobal = data.map(item => ({

    idinventario:
      item.idinventario,

    producto:
      item.producto?.nombre || "",

    categoria:
      item.producto?.categoria?.nombre
      || "Sin categoría",

    sucursal:
      item.ubicacion?.bodega?.nombre
        ?.replace("Bodega ", "")
      || "Sin sucursal",

    stock:
      item.cantidad,

    stockMinimo:
      item.producto?.stockminimo || 10

  }));

  renderInventario(inventarioGlobal);

  actualizarContador(inventarioGlobal);

}


// =========================================
// RENDER TABLA
// =========================================

function renderInventario(datos){

  const tabla =
    document.getElementById(
      "tablaInventario"
    );

  if(datos.length === 0){

    tabla.innerHTML = `
      <tr>

        <td colspan="5">

          No se encontraron productos

        </td>

      </tr>
    `;

    return;

  }

  let html = "";

  datos.forEach(item => {

    const estado =
      item.stock <= item.stockMinimo
        ? "Stock Bajo"
        : "Disponible";

    html += `

      <tr>

        <td>
          ${item.producto}
        </td>

        <td>
          ${item.categoria}
        </td>

        <td>
          ${item.sucursal}
        </td>

        <td>
          ${item.stock}
        </td>

        <td>

          <span class="
            ${estado === "Stock Bajo"
              ? "badge-danger"
              : "badge-success"}
          ">

            ${estado}

          </span>

        </td>

      </tr>

    `;

  });

  tabla.innerHTML = html;

}


// =========================================
// CONTADOR
// =========================================

function actualizarContador(datos){

  document.getElementById(
    "cantidadItems"
  ).innerText =

    `${datos.length} items encontrados`;

}


// =========================================
// FILTRO SUCURSALES
// =========================================

async function cargarSucursalesFiltro(){

  const { data } = await db
    .from("sucursal")
    .select("*");

  const select =
    document.getElementById(
      "filtroSucursal"
    );

  select.innerHTML = `
    <option value="">
      Todas las sucursales
    </option>
  `;

  data.forEach(sucursal => {

    select.innerHTML += `
      <option value="${sucursal.nombre}">
        ${sucursal.nombre}
      </option>
    `;

  });

}


// =========================================
// FILTRO CATEGORIAS
// =========================================

async function cargarCategoriasFiltro(){

  const { data } = await db
    .from("categoria")
    .select("*");

  const select =
    document.getElementById(
      "filtroCategoria"
    );

  select.innerHTML = `
    <option value="">
      Todas las categorías
    </option>
  `;

  data.forEach(cat => {

    select.innerHTML += `
      <option value="${cat.nombre}">
        ${cat.nombre}
      </option>
    `;

  });

}


// =========================================
// FILTROS
// =========================================

function aplicarFiltros(){

  const texto =
    document
      .getElementById("buscarProducto")
      .value
      .toLowerCase();

  const sucursal =
    document
      .getElementById("filtroSucursal")
      .value;

  const categoria =
    document
      .getElementById("filtroCategoria")
      .value;

  const filtrados =
    inventarioGlobal.filter(item => {

      return (

        item.producto
          .toLowerCase()
          .includes(texto)

        &&

        (
          !sucursal
          ||
          item.sucursal.toLowerCase().trim()
          ===
          sucursal.toLowerCase().trim()
        )

        &&

        (
          !categoria
          ||
          item.categoria.toLowerCase().trim()
          ===
          categoria.toLowerCase().trim()
        )

      );

    });

  renderInventario(filtrados);

  actualizarContador(filtrados);

}


// =========================================
// EVENTOS
// =========================================

document
  .getElementById("buscarProducto")
  .addEventListener(
    "input",
    aplicarFiltros
  );

document
  .getElementById("filtroSucursal")
  .addEventListener(
    "change",
    aplicarFiltros
  );

document
  .getElementById("filtroCategoria")
  .addEventListener(
    "change",
    aplicarFiltros
  );


// =========================================
// MODAL
// =========================================

function abrirModal(){

  document.getElementById(
    "modalInventario"
  ).style.display = "flex";

}

function cerrarModal(){

  document.getElementById(
    "modalInventario"
  ).style.display = "none";

}

// =========================================
// BUSCAR STOCK ACTUAL
// =========================================

async function buscarStockActual(){

  const producto =
    document.getElementById(
      "productoSelect"
    ).value;

  const bodega =
    document.getElementById(
      "sucursalSelect"
    ).value;

  if(!producto || !bodega){

    document.getElementById(
      "cantidadActual"
    ).value = 0;

    return;

  }

  // buscar ubicación
  const { data: ubicacion } = await db
    .from("ubicacion")
    .select("*")
    .eq("idbodega", bodega)
    .limit(1)
    .single();

  if(!ubicacion){

    document.getElementById(
      "cantidadActual"
    ).value = 0;

    return;

  }

  // buscar inventario
  const { data } = await db
    .from("inventario")
    .select("*")
    .eq("idproducto", producto)
    .eq("idubicacion", ubicacion.idubicacion)
    .limit(1)
    .single();

  document.getElementById(
    "cantidadActual"
  ).value = data?.cantidad || 0;

}

// =========================================
// ACTUALIZAR INVENTARIO
// =========================================

async function guardarInventario(){

  const producto =
    document.getElementById(
      "productoSelect"
    ).value;

  const bodega =
    document.getElementById(
      "sucursalSelect"
    ).value;

  const agregar =
    parseInt(
      document.getElementById(
        "cantidadAgregar"
      ).value
    );

  if(
    !producto
    ||
    !bodega
    ||
    !agregar
  ){

    mostrarToast(
      "Completa todos los campos"
    );

    return;

  }

  // buscar ubicación
  const { data: ubicacion } = await db
    .from("ubicacion")
    .select("*")
    .eq("idbodega", bodega)
    .limit(1)
    .single();

  if(!ubicacion){

    mostrarToast("No existe ubicación");

    return;

  }

  // buscar inventario actual
  const { data: inventario } = await db
    .from("inventario")
    .select("*")
    .eq("idproducto", producto)
    .eq("idubicacion", ubicacion.idubicacion)
    .limit(1)
    .single();

  // SI YA EXISTE
  if(inventario){

    const nuevaCantidad =
      inventario.cantidad + agregar;

    const { error } = await db
      .from("inventario")
      .update({

        cantidad: nuevaCantidad

      })
      .eq(
        "idinventario",
        inventario.idinventario
      );

    if(error){

      console.log(error);

      mostrarToast(
        "Error al actualizar"
      );

      return;

    }

  }

  // SI NO EXISTE
  else{

    const { error } = await db
      .from("inventario")
      .insert([{

        idproducto: producto,

        idubicacion:
          ubicacion.idubicacion,

        cantidad: agregar

      }]);

    if(error){

      console.log(error);

      mostrarToast(
        "Error al guardar"
      );

      return;

    }

  }

  mostrarToast(
  "Inventario actualizado"
);

cerrarModal();

await cargarInventario();


// actualizar dashboard
if(typeof actualizarDashboard === "function"){

  actualizarDashboard();

}

}


// =========================================
// CARGAR PRODUCTOS SELECT
// =========================================

async function cargarProductosSelect(){

  const { data, error } = await db
    .from("producto")
    .select("*");

  if(error){

    console.log(error);

    return;

  }

  const select =
    document.getElementById(
      "productoSelect"
    );

  select.innerHTML = `
    <option value="">
      Seleccionar producto...
    </option>
  `;

  data.forEach(producto => {

    select.innerHTML += `
      <option value="${producto.idproducto}">
        ${producto.nombre}
      </option>
    `;

  });

}


// =========================================
// CARGAR SUCURSALES SELECT
// =========================================

async function cargarSucursalesSelect(){

  const { data, error } = await db
    .from("bodega")
    .select("*");

  if(error){

    console.log(error);

    return;

  }

  const select =
    document.getElementById(
      "sucursalSelect"
    );

  select.innerHTML = `
    <option value="">
      Seleccionar sucursal...
    </option>
  `;

  data.forEach(bodega => {

    select.innerHTML += `
      <option value="${bodega.idbodega}">
        ${bodega.nombre}
      </option>
    `;

  });

}


// =========================================
// GUARDAR INVENTARIO
// =========================================


// =========================================
// INICIO
// =========================================

async function iniciarInventario(){

  await cargarInventario();

  await cargarSucursalesFiltro();

  await cargarCategoriasFiltro();

  await cargarProductosSelect();

  await cargarSucursalesSelect();

}

iniciarInventario();

