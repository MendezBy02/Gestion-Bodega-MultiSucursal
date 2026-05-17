// =========================================
// TOAST
// =========================================

function mostrarToast(texto){

  const toast =
    document.getElementById(
      "toast"
    );

  toast.innerText = texto;

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove("show");

  }, 3000);

}


// =========================================
// CONFIRMACION
// =========================================

function mostrarConfirmacion(
  mensaje,
  callback
){

  const modal =
    document.getElementById(
      "confirmModal"
    );

  const texto =
    document.getElementById(
      "confirmTexto"
    );

  const btn =
    document.getElementById(
      "btnConfirmar"
    );

  texto.innerText = mensaje;

  modal.style.display = "flex";


  // limpiar evento anterior
  btn.replaceWith(
    btn.cloneNode(true)
  );

  const nuevoBtn =
    document.getElementById(
      "btnConfirmar"
    );


  nuevoBtn.addEventListener(
    "click",
    async () => {

      cerrarConfirmacion();

      await callback();

    }
  );

}


// =========================================
// CERRAR CONFIRMACION
// =========================================

function cerrarConfirmacion(){

  document.getElementById(
    "confirmModal"
  ).style.display = "none";

}