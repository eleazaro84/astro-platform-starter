// netlify/functions/generateImage.js

const axios = require('axios');

exports.handler = async function(event, context) {
  // Configurar las cabeceras CORS
  const headers = {
    'Access-Control-Allow-Origin': '*', // Permite cualquier origen. Para mayor seguridad, reemplaza '*' con el dominio específico de tu frontend.
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Manejar solicitudes preflight (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: headers,
      body: '', // Respuesta vacía para preflight
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: headers,
      body: 'Método no permitido. Usa POST.',
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: prompt,
        n: 1,
        size: '1024x1024',
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const imageUrl = response.data.data[0].url;

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ imageUrl }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: 'Error generando la imagen.' }),
    };
  }
};
