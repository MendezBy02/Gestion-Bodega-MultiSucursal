// ================================
// LOGIN SIMULADO
// ================================

// Esperar a que cargue el DOM
document.addEventListener("DOMContentLoaded", () => {

  const loginBtn = document.getElementById("loginBtn");

  loginBtn.addEventListener("click", login);

});


// ================================
// FUNCIÓN LOGIN
// ================================
function login() {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Validación básica
  if (!email || !password) {
    alert("Completa todos los campos");
    return;
  }

  // 🔥 SIMULACIÓN DE USUARIOS
  if (email === "admin" && password === "admin123") {

    guardarSesion("Admin", "admin");

  } 
  else if (email === "user" && password === "123") {

    guardarSesion("Supervisor", "supervisor");

  } 
  else {
    alert("Credenciales incorrectas");
  }

}


// ================================
// GUARDAR SESIÓN
// ================================
function guardarSesion(nombre, rol) {

  const usuario = {
    nombre: nombre,
    rol: rol
  };

  localStorage.setItem("usuario", JSON.stringify(usuario));

  // Redirigir al sistema
  window.location.href = "index.html";

}