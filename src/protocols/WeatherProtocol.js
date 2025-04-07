import { WeatherModel } from '../models/WeatherModel';

export class WeatherProtocol {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async getCurrentWeather(lat, lon) {
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const data = await response.json();
      console.log('Weather API Response:', data); // Debug log
      const weatherModel = new WeatherModel(data);
      console.log('Weather Model:', weatherModel); // Debug log
      return weatherModel;
    } catch (error) {
      console.error('getCurrentWeather error:', error);
      throw new Error('Hava durumu verisi alınamadı');
    }
  }

  async getForecast(lat, lon, targetDate) {
    try {
      const response = await fetch(
        `/api/forecast?lat=${lat}&lon=${lon}&targetDate=${targetDate}`
      );
      const data = await response.json();
      console.log('Forecast API Response:', data); // Debug log
      const weatherModel = new WeatherModel(data);
      console.log('Forecast Model:', weatherModel); // Debug log
      return weatherModel;
    } catch (error) {
      console.error('getForecast error:', error);
      throw new Error('Hava durumu tahmini alınamadı');
    }
  }
}
