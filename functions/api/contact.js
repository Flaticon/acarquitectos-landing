// functions/api/contact.js
export async function onRequestPost({ request }) {
  try {
    // Validar origen (CORS)
    const origin = request.headers.get('Origin');
    const allowedOrigins = ['http://localhost:4321', 'http://localhost:8788', 'https://acarquitectos-landing.pages.dev', 'https://acarquitectos.com.pe'];
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Manejar preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Aceptar JSON o form-data
    const ct = request.headers.get('content-type') || '';
    let data;
    if (ct.includes('application/json')) {
      data = await request.json();
    } else {
      const form = await request.formData();
      data = Object.fromEntries(form);
    }

    const { nombre = '', empresa = '', contacto = '', asesoria = '', tramite = '' } = data;

    // Validar campos mínimos
    if (!nombre.trim() || !empresa.trim() || !contacto.trim()) {
      return new Response(
        JSON.stringify({ success: false, message: 'Faltan campos obligatorios: nombre, empresa y contacto' }), 
        { status: 400, headers: corsHeaders }
      );
    }

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contacto)) {
      return new Response(
        JSON.stringify({ success: false, message: 'El contacto debe ser un email válido' }), 
        { status: 400, headers: corsHeaders }
      );
    }

    const message = `
Nuevo lead recibido desde la landing:

Nombre: ${nombre}
Empresa: ${empresa}
Contacto: ${contacto}
Asesoría: ${asesoria || 'No especificado'}
Trámite: ${tramite || 'No especificado'}

Fecha: ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}
`;

    const emailData = {
      personalizations: [
        { 
          to: [{ email: "proyectos@acarquitectos.com.pe", name: "AC Arquitectos" }]
        }
      ],
      from: {
        email: "noreply@acarquitectos-landing.pages.dev",
        name: "Landing AVN & Techo Propio"
      },
      reply_to: {
        email: contacto,
        name: nombre
      },
      subject: `Nuevo lead: ${nombre} de ${empresa}`,
      content: [
        { type: "text/plain", value: message },
        { 
          type: "text/html", 
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <h2>Nuevo lead desde landing</h2>
              <table style="border-collapse: collapse; width: 100%;">
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Nombre:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${nombre}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Empresa:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${empresa}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Contacto:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${contacto}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Asesoría:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${asesoria || 'No especificado'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Trámite:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${tramite || 'No especificado'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Fecha:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}</td></tr>
              </table>
            </div>
          `
        }
      ]
    };

    const resp = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { 
        "content-type": "application/json",
        "User-Agent": "Cloudflare-Workers"
      },
      body: JSON.stringify(emailData)
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('MailChannels error:', errText);
      
      // En desarrollo, simular éxito para testing
      if (origin?.includes('localhost')) {
        console.log('Development mode - simulating email success');
        return new Response(
          JSON.stringify({ success: true, message: 'Email enviado (simulado en desarrollo)', data: emailData }), 
          { headers: corsHeaders }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, message: 'Error al enviar correo', error: errText }), 
        { status: 502, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email enviado correctamente' }), 
      { headers: corsHeaders }
    );
    
  } catch (err) {
    console.error('Function error:', err);
    return new Response(
      JSON.stringify({ success: false, message: 'Error interno del servidor' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
