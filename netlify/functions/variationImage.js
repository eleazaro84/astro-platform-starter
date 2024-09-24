const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Agregar esta función para generar variaciones
exports.handler = async (event) => {
  
  // Definir las cabeceras CORS
  const headers = {
    'Access-Control-Allow-Origin': '*', // Reemplaza '*' con tu dominio para mayor seguridad
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  try {
    // Verifica que sea una solicitud POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Método no permitido' }),
      };
    }

    // Obtener los parámetros de la solicitud
    const { imagePath, n = 1, size = '1024x1024' } = JSON.parse(event.body);

    // Verificar que el archivo de imagen exista
    const filePath = path.resolve(__dirname, imagePath);
    if (!fs.existsSync(filePath)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Imagen no encontrada' }),
      };
    }

    // Leer la imagen y convertirla a base64
    const imageData = fs.readFileSync(filePath);

    const formData = new FormData();
    formData.append('image', imageData, {
      filename: path.basename(imagePath),
      contentType: 'image/png',
    });

    // Realiza la solicitud a la API de OpenAI para generar variaciones
    const response = await axios.post(
      'https://api.openai.com/v1/images/variations',
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
        params: {
          n: n,
          size: size,
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error al generar variaciones de imagen:', error);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
