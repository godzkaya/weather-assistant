import { useState, useEffect } from 'react';
import Head from 'next/head';
import { WeatherProvider, useWeather } from '../contexts/WeatherContext';
import { WeatherProtocol } from '../protocols/WeatherProtocol';
import { AssistantModel } from '../models/AssistantModel';

const weatherProtocol = new WeatherProtocol();

function WeatherApp() {
  const { state, dispatch } = useWeather();
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        dispatch({
          type: 'SET_LOCATION',
          payload: {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          }
        });
      });
    }
  }, []);

  const handleUserInput = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_AI_RESPONSE', payload: null });

    try {
      // Analiz işlemi...
      const analysisResponse = await fetch('/api/analyze-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput }),
      });
      
      const analysis = await analysisResponse.json();
      console.log('Analysis Response:', analysis); // Debug log

      if (state.location) {
        const weatherData = await weatherProtocol[
          analysis.type === 'forecast' ? 'getForecast' : 'getCurrentWeather'
        ](
          state.location.lat,
          state.location.lon,
          analysis.targetDate
        );

        console.log('Weather Data before dispatch:', weatherData); // Debug log

        dispatch({
          type: 'SET_WEATHER',
          payload: {
            ...weatherData,
            type: analysis.type
          }
        });

        console.log('State after weather dispatch:', state.weather); // Debug log

        // AI yanıtı oluştur
        const assistantResponse = await fetch('/api/generate-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userInput,
            weatherData: weatherData
          }),
        });
        
        const aiData = await assistantResponse.json();
        console.log('AI Response:', aiData); // Debug için

        // AI yanıtını state'e kaydet
        dispatch({
          type: 'SET_AI_RESPONSE',
          payload: aiData.message
        });
      }
    } catch (error) {
      console.error('Error in handleUserInput:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      setUserInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-portal-dark to-portal-dark/90">
      <Head>
        <title>Portalgup Hava Durumu Asistanı</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
      </Head>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-portal-cyan mb-2">
            Portalgup Hava Durumu Asistanı
          </h1>
          <p className="text-portal-blue">
            Yapay zeka destekli hava durumu asistanınız
          </p>
        </div>

        {!state.location && (
          <div className="bg-portal-dark/50 border-l-4 border-portal-cyan p-4 mb-8 rounded-md">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-portal-cyan mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-portal-cyan">
                Konum bilgisi bekleniyor... Lütfen konum izni verin.
              </p>
            </div>
          </div>
        )}

        <div className="bg-portal-dark/30 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-portal-blue/20">
          <form onSubmit={handleUserInput} className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Hava durumunu sor... (örn: 'Yarın parti yapmak için hava nasıl?' veya 'yarın hava nasıl olacak?')"
              className="flex-1 px-4 py-3 rounded-lg bg-portal-dark/50 border border-portal-blue/20 text-white placeholder-portal-blue/50 focus:outline-none focus:ring-2 focus:ring-portal-cyan focus:border-transparent transition duration-200"
            />
            <button 
              type="submit"
              disabled={state.loading}
              className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                state.loading 
                  ? 'bg-portal-dark/50 text-portal-blue/50 cursor-not-allowed' 
                  : 'bg-portal-blue hover:bg-portal-cyan text-white shadow-md hover:shadow-lg'
              }`}
            >
              {state.loading ? (
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
        
        {state.weather && !state.loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hava durumu kartı */}
            <div className="bg-portal-dark/30 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-portal-blue/20">
              <div className="bg-gradient-to-r from-portal-blue to-portal-cyan px-6 py-4">
                <h2 className="text-xl font-semibold text-white">
                  {state.weather.type === 'forecast' ? 'Hava Durumu Tahmini' : 'Mevcut Hava Durumu'}
                </h2>
                {state.weather.date && (
                  <p className="text-sm text-white/80 mt-1">
                    {state.weather.date} {state.weather.time}
                  </p>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {state.weather.icon && (
                      <img 
                        src={`https://openweathermap.org/img/wn/${state.weather.icon}@2x.png`}
                        alt={state.weather.description}
                        className="w-16 h-16 mr-2"
                      />
                    )}
                    <div className="text-4xl font-bold text-portal-cyan">
                      {state.weather.temp !== undefined ? `${state.weather.temp}°C` : 'Yükleniyor...'}
                    </div>
                  </div>
                  <div className="text-portal-blue">
                    Nem: {state.weather.humidity !== undefined ? `%${state.weather.humidity}` : 'Yükleniyor...'}
                  </div>
                </div>
                <div className="text-lg text-portal-blue capitalize">
                  {state.weather.description || 'Yükleniyor...'}
                </div>
              </div>
            </div>

            {/* AI yanıt kartı */}
            {state.aiResponse && (
              <div className="bg-portal-dark/30 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-portal-green/20">
                <div className="bg-gradient-to-r from-portal-green to-portal-cyan px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">
                    Asistan Yanıtı
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-portal-blue leading-relaxed">
                    {state.aiResponse}
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

export default function Home() {
  return (
    <WeatherProvider>
      <WeatherApp />
    </WeatherProvider>
  );
}
