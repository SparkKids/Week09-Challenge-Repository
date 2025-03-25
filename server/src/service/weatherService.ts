import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
export interface Coordinates {
  latitude: number;
  longitude: number;
}
// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(
    city: string,
    date: string,
    icon: string,
    iconDescription: string,
    tempF: number,
    windSpeed: number,
    humidity: number
  ) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }

  // Example method to format temperature
  formatTemperature(): string {
    return `${this.tempF}°F`;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private apiKey: string;
  private apiBaseURL: string;
  private APIGeocodeBaseURL;
  private cityName: string;
  private state: string;
  private country: string;
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || ''; // Your API key
    this.apiBaseURL = process.env.API_BASE_URL || 'https://api.openweathermap.org/data/2.5';
    this.APIGeocodeBaseURL = process.env.API_GEOCODE_BASE_URL || 'https://api.openweathermap.org/geo/1.0/direct';
    this.cityName = ''; // Initialize city name
    this.state = 'Colorado'; // Initialize state Hardcode for now
    this.country = 'US'; // Initialize country Hardcode for now
  }
  // TODO: Create fetchLocationData method
  private async fetchLocationData(city: string): Promise<any[]> {
    const url = this.buildGeocodeQuery();
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch location data for city: ${city}`);
    }

    const data = await response.json();

    // Ensure the response is an array
    if (!Array.isArray(data)) {
      throw new Error('Unexpected response format: Expected an array.');
    }

    return data; // Return the raw array of location objects
  }// private async fetchLocationData(city: string): Promise<any> {

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any[]): Coordinates {
    if (!locationData || locationData.length === 0) {
      throw new Error('No location data found.');
    }
    const { lat, lon } = locationData[0]; // Extract latitude and longitude from the first result
    // Check if the first element has lat and lon properties
    if (lat === undefined || lon === undefined) {
      throw new Error('Invalid location data: Missing latitude or longitude.');
    }

    return { latitude: lat, longitude: lon }; // Return as a Coordinates object
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `${this.APIGeocodeBaseURL}?q=${this.cityName}&${this.state}&${this.country}&limit=1&appid=${this.apiKey}`;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.apiBaseURL}/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}&units=imperial`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  // 03/19/2025 SGray - Done
  // Fetches location data and destructures it into coordinates
  private async fetchAndDestructureLocationData() {
    const locationData = await this.fetchLocationData(this.cityName);
    return this.destructureLocationData(locationData);
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const url = this.buildWeatherQuery(coordinates);
    const response = await fetch(url);
    // Check if the response is OK (status code 200-299)
    // If not, throw an error
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data for coordinates: ${JSON.stringify(coordinates)}`);
    }

    const data = await response.json();
    return data; // Return the raw weather data
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid weather data');
    }

    // Extract and format the required fields
    const city = response.name; // City name
    const date = new Date().toLocaleDateString(); // Current date
    const icon = response.weather[0].icon; // Weather icon code
    const iconDescription = response.weather[0].description; // Weather description
    const tempF = response.main.temp; // Temperature in Fahrenheit
    const windSpeed = response.wind.speed; // Wind speed in MPH
    const humidity = response.main.humidity; // Humidity percentage

    // Return a Weather object with the required fields
    return new Weather(city, date, icon, iconDescription, tempF, windSpeed, humidity);
  };
  //Fetches forecast data for the given coordinates
  // 03/25/2025 SGray - Done
  private async fetchForecastData(coordinates: Coordinates): Promise<any[]> {
    const url = `${this.apiBaseURL}/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}&units=imperial`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch forecast data');
    }

    const data = await response.json();

    // Ensure the response contains a list of forecast data
    if (!data.list || !Array.isArray(data.list)) {
      throw new Error('Unexpected forecast data format');
    }

    return data.list; // Return the array of forecast data
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, forecastData: any[]): Weather[] {
    // Map the forecast data to Weather objects
    const forecastArray = forecastData.map((forecast) => {
      const date = forecast.dt_txt; // Date and time of the forecast
      const tempF = forecast.main.temp; // Temperature in Fahrenheit
      const windSpeed = forecast.wind.speed; // Wind speed
      const humidity = forecast.main.humidity; // Humidity percentage
      const icon = forecast.weather[0].icon; // Weather icon code
      const iconDescription = forecast.weather[0].description; // Weather description

      return new Weather(currentWeather.city, date, icon, iconDescription, tempF, windSpeed, humidity);
    });

    // Return an array with the current weather as the first element
    // followed by the forecast data
    return [currentWeather, ...forecastArray];
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.cityName = city;
    try {
      const coordinates = await this.fetchAndDestructureLocationData();
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);
      // Fetch forecast data
      const forecastData = await this.fetchForecastData(coordinates);
      // Build the combined array of current weather and forecast
      const weatherArray = this.buildForecastArray(currentWeather, forecastData);
      return weatherArray;// Return the Weather object
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error; // Rethrow the error for handling in the calling code
    }
  }
}

export default new WeatherService();
