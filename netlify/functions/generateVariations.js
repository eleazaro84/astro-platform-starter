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
    const imageBuffer = Buffer.from(body
