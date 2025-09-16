import type { APIContext } from 'astro';

export async function GET() {
  return new Response(
    JSON.stringify({
      success: true,
      message: "API funcionando correctamente. Usa POST para enviar un contacto."
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
};

export async function POST({ request, locals }: APIContext) {
  try {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const data = await request.json();
    const { nombre, empresa, email, telefono, asesoria, tramite } = data;

    // Validar que al menos uno de los contactos esté presente
    if (!nombre?.trim() || !empresa?.trim() || (!email?.trim() && !telefono?.trim())) {
      return new Response(
        JSON.stringify({ success: false, message: "Faltan campos obligatorios. Debe proporcionar al menos email o teléfono." }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Construir contacto para el email
    const contacto = email?.trim() || telefono?.trim();

    // Usar Resend API
    const emailData = {
      from: "onboarding@resend.dev",
      to: ["proyectos@acarquitectos.com.pe"],
      subject: `Nuevo lead: ${nombre} de ${empresa}`,
      html: `
        <h2>Nuevo lead desde landing</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Empresa:</strong> ${empresa}</p>
        ${email?.trim() ? `<p><strong>Email:</strong> ${email}</p>` : ''}
        ${telefono?.trim() ? `<p><strong>Teléfono:</strong> ${telefono}</p>` : ''}
        <p><strong>Asesoría:</strong> ${asesoria || "No especificado"}</p>
        <p><strong>Trámite:</strong> ${tramite || "No especificado"}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString("es-PE", { timeZone: "America/Lima" })}</p>
      `,
      reply_to: contacto
    };

    // Acceso tipado a la API key de Resend (secreto de Cloudflare)
    const resendApiKey = locals.runtime.env.RESEND_API_KEY_AC_FORMULARIO || import.meta.env.RESEND_API_KEY_AC_FORMULARIO;
    
    // Si no hay API key, simular el envío (modo desarrollo/demo)
    if (!resendApiKey) {
      console.log('Email simulado (sin API key):', emailData);
      return new Response(
        JSON.stringify({ success: true, message: "Email simulado enviado (demo)" }),
        { headers: corsHeaders }
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ success: false, message: "Error al enviar correo" }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email enviado correctamente" }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error interno" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};