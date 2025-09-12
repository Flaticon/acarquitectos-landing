// Endpoint para validación de dominio MailChannels
// Según docs: https://support.mailchannels.com/hc/en-us/articles/4565898358413

export async function onRequest(context) {
  const { request } = context;
  
  // MailChannels require specific response for domain validation
  if (request.method === 'GET') {
    return new Response(JSON.stringify({
      domain: "acarquitectos.com.pe",
      status: "authorized",
      validation: "mailchannels-domain-verification",
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  return new Response('Method not allowed', { status: 405 });
}