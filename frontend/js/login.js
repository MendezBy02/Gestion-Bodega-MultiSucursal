document.addEventListener("DOMContentLoaded", () => {

  // formulario
  const form = document.getElementById("loginForm");

  // password
  const pass = document.getElementById("password");

  // toggle password
  document.addEventListener("click", (e) => {

    const btn = e.target.closest("#togglePass");

    if (!btn) return;

    if (pass.type === "password") {

      pass.type = "text";

      btn.setAttribute(
        "data-lucide",
        "eye-off"
      );

    } else {

      pass.type = "password";

      btn.setAttribute(
        "data-lucide",
        "eye"
      );

    }

    lucide.createIcons();

  });

  // login
  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    // inputs
    const email =
      document.getElementById("email").value;

    const password =
      document.getElementById("password").value;

    let valid = true;

    // validar email
    if (!email) {

      document
        .getElementById("email")
        .closest(".input-group")
        .classList.add("error");

      valid = false;
    }

    // validar password
    if (!password) {

      document
        .getElementById("password")
        .closest(".input-group")
        .classList.add("error");

      valid = false;
    }

    if (!valid) return;

    // consulta supabase
    const { data, error } = await db
      .from("usuario")
      .select(`
        *,
        rol(nombre)
      `)
      .eq("email", email)
      .eq("password", password)
      .single();

    // credenciales incorrectas
    if (error || !data) {

      mostrarToast("Credenciales incorrectas");

      return;
    }

    // guardar sesión
const usuario = {

  id: data.idusuario,

  nombre: data.nombre,

  email: data.email,

  rol: data.rol.nombre,

  sucursal: data.idsucursal

};


// verificar
console.log(usuario);


// guardar
localStorage.setItem(
  "user",
  JSON.stringify(usuario)
);


//Correo

try {

  await emailjs.send(

    "service_taidoow",

    "template_ngl808b",

    {

      to_email:
        data.email,

      nombre:
        data.nombre,

      fecha:
        new Date().toLocaleString(

          "es-SV",

          {

            timeZone:
              "America/El_Salvador"

          }

        )

    }

  );

}

catch(error){

  console.log(
    "Error correo:",
    error
  );

}




    // redirección
    
    window.location.href = "dashboard.html";

  });

});
