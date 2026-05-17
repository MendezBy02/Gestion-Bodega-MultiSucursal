import { Resend } from 'resend';

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export default async function handler(req, res){

  try{

    const {

      producto,
      cantidad,
      origen,
      destino,
      correoDestino,
      usuario

    } = req.body;


    await resend.emails.send({

      from:
        'NexoTech <onboarding@resend.dev>',

      to:
        correoDestino,

      subject:
        'Nueva transferencia recibida',

      html: `

        <h2>Nueva transferencia</h2>

        <p>
          Has recibido una nueva transferencia.
        </p>

        <hr>

        <p>
          <strong>Producto:</strong>
          ${producto}
        </p>

        <p>
          <strong>Cantidad:</strong>
          ${cantidad}
        </p>

        <p>
          <strong>Origen:</strong>
          ${origen}
        </p>

        <p>
          <strong>Enviado por:</strong>
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