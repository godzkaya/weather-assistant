export default async function handler(req, res) {
  const { lat, lon, targetDate } = req.query;
  
  if (!process.env.OPENWEATHER_API_KEY) {
    return res.status(500).json({ error: 'API anahtarı bulunamadı' });
  }

  try {
    // Debug için
    console.log('Requested target date:', targetDate);

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=tr`
    );
    
    const data = await response.json();
    
    if (!data.list || data.list.length === 0) {
      return res.status(500).json({ error: 'Hava durumu verisi alınamadı' });
    }

    // Debug için
    console.log('First forecast in list:', data.list[0]);

    // Basit tarih kontrolü
    const targetDateObj = new Date(targetDate);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 5);

    // Debug için
    console.log('Target date:', targetDateObj);
    console.log('Today:', today);
    console.log('Max date:', maxDate);

    if (targetDateObj < today) {
      return res.status(400).json({ error: 'Geçmiş tarihler için tahmin yapılamaz' });
    }

    if (targetDateObj > maxDate) {
      return res.status(400).json({ error: '5 günden daha uzak tarihler için tahmin yapılamıyor' });
    }

    // Hedef güne ait tahminleri bul
    const targetDayForecasts = data.list.filter(item => {
      const itemDate = new Date(item.dt * 1000);
      return itemDate.toDateString() === targetDateObj.toDateString();
    });

    // Debug için
    console.log('Found forecasts count:', targetDayForecasts.length);

    if (targetDayForecasts.length === 0) {
      return res.status(404).json({ error: 'Belirtilen tarih için tahmin bulunamadı' });
    }

    // En uygun tahmini seç (gün ortası)
    const forecast = targetDayForecasts[Math.floor(targetDayForecasts.length / 2)];
    const forecastDate = new Date(forecast.dt * 1000);

    // Debug için
    console.log('Selected forecast:', forecast);

    const response_data = {
      temp: Math.round(forecast.main.temp),
      description: forecast.weather[0].description,
      humidity: forecast.main.humidity,
      icon: forecast.weather[0].icon, // İkon kodunu ekledik
      date: forecastDate.toLocaleDateString('tr-TR'),
      time: forecastDate.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    // Debug için
    console.log('Response data:', response_data);

    return res.status(200).json(response_data);

  } catch (error) {
    console.error('Forecast API error:', error);
    return res.status(500).json({ error: 'Hava durumu tahmini alınamadı' });
  }
}
