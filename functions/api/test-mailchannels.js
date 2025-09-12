import { testMailchannels } from '../../test-mailchannels.js';

export async function onRequest(context) {
  try {
    const result = await testMailchannels();
    
    return new Response(JSON.stringify({
      success: true,
      mailchannels_test: result
    }, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}