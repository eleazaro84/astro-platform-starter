const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
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
    const imagePath = body.imagePath;

    const absoluteImagePath = path.resolve(__dirname, imagePath);
    if (!fs.existsSync(absoluteImagePath)) {
      throw new Error('La imagen no existe en el servidor.');
    }

    const form = new FormData();
    form.append('image', fs.createReadStream(absoluteImagePath));
    form.append('n', body.n || 1);
    form.append('size', body.size || '1024x1024');

    const openAiResponse = await fetch('https://api.openai.com/v1/images/variations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...form.getHeaders()
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
      body
