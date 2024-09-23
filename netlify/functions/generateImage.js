const axios = require('axios');

exports.handler = async function(event, context) {
  const { prompt } = JSON.parse(event.body);

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: prompt,
        n: 1, 
        size: '1024x1024'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const imageUrl = response.data.data[0].url;

    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrl })
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'Error generando la imagen.'
    };
  }
};
