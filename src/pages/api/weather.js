export default async function handler(req, res) {
  const { lat, lon } = req.query;
  
  if (!process.env.OPENWEATHER_API_KEY) {
    return res.status(500).json({ error: 'API anahtarı bulunamadı' });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=tr`
    );
    
    const data = await response.json();
    
    res.status(200).json({
      temp: data.main.temp,
      description: data.weather[0].description,
      humidity: data.main.humidity
    });
  } catch (error) {
    res.status(500).json({ error: 'Hava durumu bilgisi alınamadı' });
  }
}