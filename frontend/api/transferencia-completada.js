import { Resend } from 'resend';

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export default async function handler(req, res){

  try{

    const {

      producto,
      destino,
      usuario,
      correoOrigen

    } = req.body;


    await resend.emails.send({

      from:
        'NexoTech <onboarding@resend.dev>',

      to:
        correoOrigen,

      subject:
        'Transferencia completada',

      html: `

        <h2>Transferencia completada</h2>

        <p>
          Tu transferencia fue recibida.
        </p>

        <hr>

        <p>
          <strong>Producto:</strong>
          ${producto}
        </p>

        <p>
          <strong>Destino:</strong>
          ${destino}
        </p>

        <p>
          <strong>Recibido por:</strong>
          ${usuario}
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