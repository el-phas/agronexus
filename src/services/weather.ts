import { api } from "./api";

/**
 * Weather Service
 * Provides weather data based on user location
 * Uses OpenWeatherMap API (free tier)
 */

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  feelsLike: number;
  icon: string;
  forecast: ForecastDay[];
}

export interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  precipitation: number;
  humidity: number;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

class WeatherService {
  private apiKey = import.meta.env.VITE_WEATHER_API_KEY || "";
  private baseUrl = "https://api.openweathermap.org/data/2.5";

  /**
   * Get current weather by coordinates
   */
  async getWeatherByCoords(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatWeatherData(data);
    } catch (error) {
      console.error("Weather fetch error:", error);
      throw error;
    }
  }

  /**
   * Get current weather by city name
   */
  async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatWeatherData(data);
    } catch (error) {
      console.error("Weather fetch error:", error);
      throw error;
    }
  }

  /**
   * Get weather forecast for 5 days
   */
  async getForecast(latitude: number, longitude: number): Promise<ForecastDay[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatForecast(data);
    } catch (error) {
      console.error("Forecast fetch error:", error);
      throw error;
    }
  }

  /**
   * Get user's current location
   */
  async getCurrentLocation(): Promise<LocationCoords> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * Get agricultural recommendations based on weather
   */
  getAgricultureRecommendations(weather: WeatherData): string[] {
    const recommendations: string[] = [];
    const temp = weather.temperature;
    const humidity = weather.humidity;
    const windSpeed = weather.windSpeed;

    // Temperature-based recommendations
    if (temp < 10) {
      recommendations.push("⚠️ Cold alert: Protect seedlings and tender crops");
    } else if (temp > 35) {
      recommendations.push("🌡️ Heat alert: Increase irrigation frequency");
    } else if (temp >= 20 && temp <= 25) {
      recommendations.push("✅ Optimal temperature for most crops");
    }

    // Humidity-based recommendations
    if (humidity > 80) {
      recommendations.push("💧 High humidity: Monitor for fungal diseases");
      recommendations.push("🍃 Consider spraying fungicide if needed");
    } else if (humidity < 30) {
      recommendations.push("🏜️ Low humidity: Risk of quick soil moisture loss");
      recommendations.push("💦 Schedule irrigation early morning or evening");
    }

    // Wind-based recommendations
    if (windSpeed > 20) {
      recommendations.push("💨 Strong winds: Secure stakes and supports for tall plants");
    }

    // Weather condition recommendations
    if (weather.condition.includes("rain")) {
      recommendations.push("🌧️ Rain expected: Skip irrigation, check drainage");
      recommendations.push("⏸️ Delay pesticide/fertilizer application");
    } else if (weather.condition.includes("clear") || weather.condition.includes("sunny")) {
      recommendations.push("☀️ Sunny conditions: Good for harvesting and drying");
    }

    return recommendations.length > 0
      ? recommendations
      : ["📊 Monitor weather patterns for farming decisions"];
  }

  /**
   * Format raw weather API response
   */
  private formatWeatherData(data: any): WeatherData {
    return {
      location: `${data.name}${data.sys.country ? ", " + data.sys.country : ""}`,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 10) / 10,
      pressure: data.main.pressure,
      feelsLike: Math.round(data.main.feels_like),
      icon: data.weather[0].icon,
      forecast: [],
    };
  }

  /**
   * Format forecast data
   */
  private formatForecast(data: any): ForecastDay[] {
    const forecastMap = new Map<string, any>();

    // Group by date
    data.list.forEach((item: any) => {
      const date = item.dt_txt.split(" ")[0];
      if (!forecastMap.has(date)) {
        forecastMap.set(date, {
          date,
          temps: [item.main.temp],
          conditions: [item.weather[0].main],
          precipitation: item.rain?.["3h"] || 0,
          humidity: item.main.humidity,
        });
      } else {
        const existing = forecastMap.get(date);
        existing.temps.push(item.main.temp);
        existing.conditions.push(item.weather[0].main);
      }
    });

    // Format and return
    return Array.from(forecastMap.values()).slice(0, 5).map((item: any) => ({
      date: item.date,
      tempMax: Math.round(Math.max(...item.temps)),
      tempMin: Math.round(Math.min(...item.temps)),
      condition: item.conditions[0],
      precipitation: Math.round(item.precipitation * 10) / 10,
      humidity: item.humidity,
    }));
  }
}

export default new WeatherService();
