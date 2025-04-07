export class WeatherModel {
  constructor(data) {
    this.temp = data.temp;
    this.description = data.description;
    this.humidity = data.humidity;
    this.date = data.date;
    this.time = data.time;
    this.type = data.type;
    this.icon = data.icon; // Yeni ikon kodu alanı
  }

  getWeatherIconUrl() {
    return this.icon 
      ? `https://openweathermap.org/img/wn/${this.icon}@2x.png`
      : null;
  }

  isExtremeCold() {
    return this.temp < 0;
  }

  isExtremeHot() {
    return this.temp > 35;
  }
}
