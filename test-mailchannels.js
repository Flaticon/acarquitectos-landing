// Test script for Mailchannels configuration
// Run this in a Cloudflare Workers environment or Pages Function

const testEmailData = {
  personalizations: [
    { 
      to: [{ email: "proyectos@acarquitectos.com.pe", name: "AC Arquitectos" }]
    }
  ],
  from: {
    email: "noreply@acarquitectos.com.pe",
    name: "Landing AVN & Techo Propio"
  },
  reply_to: {
    email: "test@example.com",
    name: "Test User"
  },
  subject: "Test - Configuración Mailchannels",
  content: [
    { 
      type: "text/plain", 
      value: "Este es un email de prueba para verificar la configuración de Mailchannels.\n\nSi recibes este email, la configuración está funcionando correctamente." 
    },
    { 
      type: "text/html", 
      value: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Test - Configuración Mailchannels</h2>
          <p>Este es un email de prueba para verificar la configuración de Mailchannels.</p>
          <p><strong>Si recibes este email, la configuración está funcionando correctamente.</strong></p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Enviado desde: acarquitectos.com.pe<br>
            DNS Records configurados: ✓<br>
            Mailchannels API: ✓
          </p>
        </div>
      `
    }
  ]
};

export async function testMailchannels() {
  try {
    // Debug info
    const domain = typeof CF_PAGES_URL !== 'undefined' ? new URL(CF_PAGES_URL).hostname : 'acarquitectos-landing.pages.dev';
    
    const resp = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { 
        "content-type": "application/json",
        "User-Agent": "Cloudflare-Workers"
      },
      body: JSON.stringify(testEmailData)
    });

    const responseText = await resp.text();
    
    return {
      success: resp.ok,
      status: resp.status,
      statusText: resp.statusText,
      response: responseText,
      testData: testEmailData
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      testData: testEmailData
    };
  }
}