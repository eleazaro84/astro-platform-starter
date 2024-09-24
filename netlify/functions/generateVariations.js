const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Manejar preflight request (solicitud OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: ''
    };
  }

  // Verificar que la solicitud sea POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Método no permitido, solo se permite POST' })
    };
  }

  try {
    const body = JSON.parse(event.body);

    // Llamar a la API de OpenAI para generar variaciones de imagen
    const openAiResponse = await fetch('https://api.openai.com/v1/images/variations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        image: body.imagePath,
        n: body.n,
        size: body.size
      })
    });

    const data = await openAiResponse.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Error en la solicitud', details: error.message }),
    };
  }
};
