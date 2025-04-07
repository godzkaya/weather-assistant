import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userInput } = req.body;
  const today = new Date();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Sen bir hava durumu asistanısın. Bugünün tarihi ${today.toISOString().split('T')[0]}.
          Kullanıcının sorgusunu analiz et ve sadece JSON formatında yanıt ver. Başka açıklama ekleme.
          
          Kurallar:
          - Eğer kullanıcı bir tarih belirtmişse, bu tarihi YYYY-MM-DD formatında dönüştür
          - Tarih belirtilmemişse varsayılan olarak bugünün tarihini kullan
          - Geçmiş tarihler için gelecek yılın aynı gününü kullan
          - "bugün" için bugünün tarihini, "yarın" için yarının tarihini kullan
          - Maksimum 5 gün ileriye kadar tahmin yapılabilir
          
          Yanıt şu formatta OLMALI:
          {
            "type": "current" veya "forecast",
            "targetDate": "YYYY-MM-DD",
            "needsWeather": true veya false
          }`
        },
        {
          role: "user",
          content: userInput
        }
      ],
      temperature: 0.3,
      max_tokens: 150
    });

    const aiResult = JSON.parse(completion.choices[0].message.content.trim());

    return res.status(200).json({
      type: aiResult.type,
      targetDate: aiResult.targetDate,
      needsWeather: aiResult.needsWeather
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'Input analiz edilemedi' });
  }
}
