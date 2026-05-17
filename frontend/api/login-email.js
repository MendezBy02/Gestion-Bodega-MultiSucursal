import { Resend } from 'resend';

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export default async function handler(req, res){

  try{

    const {

      nombre,
      correo,
      rol,
      sucursal

    } = req.body;


    const fecha =
      new Date().toLocaleString(
        "es-SV",
        {
          timeZone:
            "America/El_Salvador",

          dateStyle:
            "full",

          timeStyle:
            "short"
        }
      );


    await resend.emails.send({

      from:
        'NexoTech <onboarding@resend.dev>',

      to:
        correo,

      subject:
        'Inicio de sesión detectado',

      html: `

      <div style="
        background:#f4f7fb;
        padding:40px;
        font-family:Arial,sans-serif;
      ">

        <div style="
          max-width:600px;
          margin:auto;
          background:white;
          border-radius:18px;
          overflow:hidden;
          box-shadow:0 10px 30px rgba(0,0,0,0.08);
        ">

          <!-- HEADER -->
          <div style="
            background:linear-gradient(
              135deg,
              #0f172a,
              #2563eb
            );

            padding:40px;
            text-align:center;
          ">

            <img
              src='https://raw.githubusercontent.com/MendezBy02/Gestion-Bodega-MultiSucursal/main/frontend/img/logo.png'
              width='120'
              style='margin-bottom:15px;'
            />

            <h1 style="
              color:white;
              margin:0;
              font-size:32px;
            ">
              NexoTech
            </h1>

          </div>


          <!-- BODY -->
          <div style="
            padding:40px;
            color:#1e293b;
          ">

            <h2 style="
              margin-top:0;
              font-size:28px;
            ">
              Hola ${nombre}
            </h2>

            <p style="
              font-size:18px;
              line-height:1.6;
              color:#475569;
            ">

              Se detectó un inicio
              de sesión en tu cuenta.

            </p>


            <!-- CARD -->
            <div style="
              background:#f8fafc;
              border:1px solid #e2e8f0;
              border-radius:14px;
              padding:25px;
              margin-top:30px;
            ">

              <p style="
                margin:10px 0;
                font-size:16px;
              ">

                <strong>
                  Usuario:
                </strong>

                ${nombre}

              </p>


              <p style="
                margin:10px 0;
                font-size:16px;
              ">

                <strong>
                  Rol:
                </strong>

                ${rol}

              </p>


              <p style="
                margin:10px 0;
                font-size:16px;
              ">

                <strong>
                  Sucursal:
                </strong>

                ${sucursal}

              </p>


              <p style="
                margin:10px 0;
                font-size:16px;
              ">

                <strong>
                  Fecha:
                </strong>

                ${fecha}

              </p>

            </div>


            <!-- ALERT -->
            <div style="
              margin-top:30px;
              padding:18px;
              background:#eff6ff;
              border-left:5px solid #2563eb;
              border-radius:10px;
              color:#1e3a8a;
            ">

              Si reconoces esta actividad,
              no necesitas hacer nada.

            </div>

          </div>


          <!-- FOOTER -->
          <div style="
            background:#f8fafc;
            padding:25px;
            text-align:center;
            color:#64748b;
            font-size:14px;
          ">

            © 2026 NexoTech · Sistema de Bodega Multisucursal

          </div>

        </div>

      </div>

      `

    });

    return res.status(200).json({
      ok:true
    });

  }

  catch(error){

    console.log(error);

    return res.status(500).json({
      error:error.message
    });

  }

}