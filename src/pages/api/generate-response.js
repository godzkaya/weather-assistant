import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userInput, weatherData } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Sen bir hava durumu asistanısın. Kullanıcının sorusunu ve verilen hava durumu bilgilerini kullanarak
          doğal bir dilde yanıt ver. Yanıtın kısa ve öz olmalı. Tarih ve saat bilgisini de içer.`
        },
        {
          role: "user",
          content: `Soru: "${userInput}"
          
          Hava Durumu Verileri:
          Sıcaklık: ${weatherData.temp}°C
          Durum: ${weatherData.description}
          Nem: %${weatherData.humidity}
          Tarih: ${weatherData.date}
          Saat: ${weatherData.time}
          Tip: ${weatherData.type === 'forecast' ? 'Tahmin' : 'Mevcut durum'}`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return res.status(200).json({ 
      message: completion.choices[0].message.content.trim() 
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'Yanıt oluşturulamadı' });
  }
}
