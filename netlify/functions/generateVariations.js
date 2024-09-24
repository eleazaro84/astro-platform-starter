const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  }

  // Aquí iría tu lógica de procesamiento de la imagen, llamada a la API, etc.
  // Ejemplo de la respuesta:
  
  try {
    const body = JSON.parse(event.body);

    // Llamar al servicio de OpenAI para generar variaciones
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
        'Access-Control-Allow-Origin': '*', // Permitir solicitudes desde cualquier origen
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Error en la solicitud' }),
    };
  }
};
