document.addEventListener("DOMContentLoaded", () => {

  const supabaseUrl = "https://qldarbwshdoghxwnjmye.supabase.co";
  const supabaseKey = "sb_publishable_i8ds47Xrje7E9L1XiHpI2g_IW480x8Q";

  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  const form = document.getElementById("loginForm");
  const pass = document.getElementById("password");

  /* toggle ojo */
        document.addEventListener("click", (e) => {

        const btn = e.target.closest("#togglePass");
        if (!btn) return;

        const pass = document.getElementById("password");

        if (pass.type === "password") {
            pass.type = "text";
            btn.setAttribute("data-lucide", "eye-off");
        } else {
            pass.type = "password";
            btn.setAttribute("data-lucide", "eye");
        }

        lucide.createIcons();
        });

  /* LOGIN REAL */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  let valid = true;

  if (!email) {
    document.getElementById("email").closest(".input-group").classList.add("error");
    valid = false;
  }

  if (!password) {
    document.getElementById("password").closest(".input-group").classList.add("error");
    valid = false;
  }

  if (!valid) return;

  // CONSULTA A SUPABASE
  const { data, error } = await supabase
    .from("usuario")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .single();

  if (error || !data) {
    alert("Credenciales incorrectas");
    return;
  }

  //GUARDAR USUARIO 
  localStorage.setItem("user", JSON.stringify(data));

  //REDIRECCIÓN
  window.location.href = "dashbord.html";
});
});