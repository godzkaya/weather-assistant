import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      });
    }
  }, []);

  const getWeatherData = async (type, lat, lon, targetDate = null) => {
    try {
      const endpoint = type === 'forecast' ? 'forecast' : 'weather';
      const url = new URL(`/api/${endpoint}`, window.location.origin);
      url.searchParams.append('lat', lat);
      url.searchParams.append('lon', lon);
      
      // targetDate varsa ve boş string değilse ekle
      if (targetDate) {
        url.searchParams.append('targetDate', targetDate);
        console.log('Target date added to request:', targetDate); // Debug için
      }
      
      console.log('Requesting weather data:', url.toString()); // Debug için
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Weather API response:', data); // Debug için
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Weather data error:', error);
      throw error;
    }
  };

  const handleUserInput = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);
    try {
      // 1. Kullanıcı girdisini analiz et
      const analysisResponse = await fetch('/api/analyze-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput }),
      });
      
      const analysis = await analysisResponse.json();
      
      if (!analysis.needsWeather) {
        setAiResponse("Hava durumu ile ilgili bir soru sormadınız. Nasıl yardımcı olabilirim?");
        setLoading(false);
        return;
      }

      // 2. Hava durumu verisini al
      if (location) {
        try {
          const weatherData = await getWeatherData(
            analysis.type,
            location.lat,
            location.lon,
            analysis.targetDate // OpenAI'dan gelen tarih bilgisini kullan
          );

          // 3. OpenAI ile yanıt oluştur
          const aiResponse = await fetch('/api/generate-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userInput,
              weatherData: {
                ...weatherData,
                type: analysis.type
              }
            }),
          });
          
          const aiData = await aiResponse.json();
          setAiResponse(aiData.message);
          setWeather({
            ...weatherData,
            type: analysis.type
          });
        } catch (error) {
          console.error('Weather data error:', error);
          setAiResponse(error.message || 'Hava durumu bilgisi alınamadı');
        }
      }
    } catch (error) {
      console.error('Hata:', error);
      setAiResponse('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      setUserInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Head>
        <title>Portalgup Hava Durumu Asistanı</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
      </Head>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Portalgup Hava Durumu Asistanı
          </h1>
          <p className="text-gray-600">
            Yapay zeka destekli hava durumu asistanınız
          </p>
        </div>

        {!location && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-md">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-yellow-700">
                Konum bilgisi bekleniyor... Lütfen konum izni verin.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleUserInput} className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Hava durumunu sor... (örn: 'hava nasıl?' veya 'yarın hava nasıl olacak?')"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
            <button 
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                loading 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sorgulanıyor...
                </div>
              ) : (
                'Sor'
              )}
            </button>
          </form>
        </div>
        
        {weather && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">
                  {weather.type === 'forecast' ? 'Hava Durumu Tahmini' : 'Mevcut Hava Durumu'}
                </h2>
                {weather.type === 'forecast' && weather.date && (
                  <p className="text-sm text-blue-100 mt-1">
                    {weather.date}
                  </p>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl font-bold text-gray-800">
                    {weather.temp}°C
                  </div>
                  <div className="text-gray-500">
                    Nem: %{weather.humidity}
                  </div>
                </div>
                <div className="text-lg text-gray-600 capitalize">
                  {weather.description}
                </div>
              </div>
            </div>

            {aiResponse && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">
                    Asistan Yanıtı
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed">
                    {aiResponse}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
