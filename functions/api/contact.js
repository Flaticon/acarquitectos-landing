// functions/api/contact.js
export async function onRequestPost({ request }) {
  try {
    // aceptar JSON o form-data
    const ct = request.headers.get('content-type') || '';
    let data;
    if (ct.includes('application/json')) {
      data = await request.json();
    } else {
      const form = await request.formData();
      data = Object.fromEntries(form);
    }

    const { nombre = '', empresa = '', contacto = '', asesoria = '', tramite = '' } = data;

    // validar campos mínimos
    if (!nombre || !empresa || !contacto) {
      return new Response(JSON.stringify({ success: false, message: 'Faltan campos obligatorios' }), { status: 400, headers:{ 'Content-Type':'application/json' }});
    }

    const message = `
Nuevo lead recibido desde la landing:

Nombre: ${nombre}
Empresa: ${empresa}
Contacto: ${contacto}
Asesoría: ${asesoria}
Trámite: ${tramite}
`;

    const emailData = {
      personalizations: [
        { to: [{ email: "proyectos@acarquitectos.com.pe", name: "AC Arquitectos" }] }
      ],
      from: {
        email: "noreply@acarquitectos.com.pe",
        name: "Landing AVN & Techo Propio"
      },
      subject: "Nuevo lead desde landing AVN y Techo Propio",
      content: [{ type: "text/plain", value: message }]
    };

    const resp = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(emailData)
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('MailChannels error:', errText);
      return new Response(JSON.stringify({ success: false, message: 'Error al enviar correo' }), { status: 502, headers:{ 'Content-Type':'application/json' }});
    }

    return new Response(JSON.stringify({ success: true, message: 'Enviado' }), { headers: { 'Content-Type':'application/json' }});
  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ success: false, message: 'Error interno' }), { status: 500, headers:{ 'Content-Type':'application/json' }});
  }
}
