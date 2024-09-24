// netlify/functions/generateVariations.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  // Manejo de solicitudes OPTIONS (preflight request)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Permitir solicitudes desde cualquier origen
        'Access-Control-Allow-Methods': 'POST, OPTIONS', // Métodos permitidos
        'Access-Control-Allow-Headers': 'Content-Type', // Cabeceras permitidas
      },
    };
  }

  try {
    // Validación del método HTTP
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Only POST method allowed' }),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      };
    }

    const body = JSON.parse(event.body);

    // Validación de datos
    if (!body.image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Image is required' }),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      };
    }

    // Decodificar la imagen en base64 para guardarla temporalmente
    const imageBuffer = Buffer.from(body.image, 'base64');
    const tempImagePath = `/tmp/temp_image.png`;

    fs.writeFileSync(tempImagePath, imageBuffer);

    // Crear el FormData para la API de OpenAI
    const formData = new FormData();
    formData.append('image', fs.createReadStream(tempImagePath));
    formData.append('n', '1'); // Número de variaciones
    formData.append('size', '1024x1024'); // Tamaño de la imagen

    // Hacer la petición a OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/images/variations',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    // Eliminar la imagen temporal una vez procesada
    fs.unlinkSync(tempImagePath);

    // Responder con la URL de la imagen generada
    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrl: response.data.data[0].url }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Error generating variations:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error generating image variations' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    };
  }
};
