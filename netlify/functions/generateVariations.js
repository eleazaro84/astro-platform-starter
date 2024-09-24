const fetch = require('node-fetch');
const FormData = require('form-data'); // Para enviar el archivo como multipart/form-data
const fs = require('fs');
const path = require('path');

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
    // Parsear el cuerpo de la solicitud (FormData no puede ser parseado como JSON)
    const body = JSON.parse(event.body);
    const imagePath = body.imagePath;

    // Verificar que la imagen exista en el sistema de archivos
    const absoluteImagePath = path.resolve(__dirname, imagePath);
    if (!fs.existsSync(absoluteImagePath)) {
      throw new Error('La imagen no existe en el servidor.');
    }

    // Crear un objeto FormData y agregar la imagen
    const form = new FormData();
    form.append('image', fs.createReadStream(absoluteImagePath)); // Leer la imagen desde el archivo
    form.append('n', body.n || 1);  // Número de variaciones
    form.append('size', body.size || '1024x1024');  // Tamaño de la imagen

    // Llamar a la API de OpenAI para generar variaciones de imagen
    const openAiResponse = await fetch('https://api.openai.com/v1/images/variations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...form.getHeaders() // Asegurarse de incluir los headers correctos para multipart/form-data
      },
      body: form
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
