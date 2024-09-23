// netlify/functions/generateImage.js

const axios = require('axios');

exports.handler = async function(event, context) {
  // Definir las cabeceras CORS
  const headers = {
    'Access-Control-Allow-Origin': '*', // Reemplaza '*' con tu dominio para mayor seguridad
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
      'https://api.openai.com/v3/images/generations',
      {
        model: "dall-e-3",
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
    // Registrar el error completo para obtener más detalles
    console.error('Error al generar la imagen:', error.response ? error.response.data : error.message);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: 'Error generando la imagen.' }),
    };
  }
};
