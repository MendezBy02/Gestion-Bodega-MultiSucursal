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


    await resend.emails.send({

      from:
        'NexoTech <onboarding@resend.dev>',

      to:
        correo,

      subject:
        'Inicio de sesión detectado',

      html: `

        <h2>Hola ${nombre}</h2>

        <p>
          Se detectó un inicio de sesión
          en tu cuenta.
        </p>

        <p>
          <strong>Rol:</strong>
          ${rol}
        </p>

        <p>
          <strong>Sucursal:</strong>
          ${sucursal}
        </p>

        <p>
          <strong>Fecha:</strong>
          ${new Date().toLocaleString()}
        </p>

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