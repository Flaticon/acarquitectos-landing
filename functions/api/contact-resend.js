// functions/api/contact-resend.js - Alternativa con Resend
export async function onRequestPost({ request, env }) {
  try {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const data = await request.json();
    const { nombre, empresa, contacto, asesoria, tramite } = data;

    if (!nombre?.trim() || !empresa?.trim() || !contacto?.trim()) {
      return new Response(
        JSON.stringify({ success: false, message: 'Faltan campos obligatorios' }), 
        { status: 400, headers: corsHeaders }
      );
    }

    // Usar Resend API (requiere API key en variables de entorno)
    const emailData = {
      from: 'onboarding@resend.dev', // Email verificado de Resend
      to: ['proyectos@acarquitectos.com.pe'],
      subject: `Nuevo lead: ${nombre} de ${empresa}`,
      html: `
        <h2>Nuevo lead desde landing</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Empresa:</strong> ${empresa}</p>
        <p><strong>Contacto:</strong> ${contacto}</p>
        <p><strong>Asesoría:</strong> ${asesoria || 'No especificado'}</p>
        <p><strong>Trámite:</strong> ${tramite || 'No especificado'}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-PE')}</p>
      `,
      reply_to: contacto
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend error:', error);
      return new Response(
        JSON.stringify({ success: false, message: 'Error al enviar correo' }), 
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email enviado correctamente' }), 
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Error interno' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}