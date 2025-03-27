import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
// 03/19/2025 SGray - Done
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// TODO: Define a class for the Weather object
// 03/24/2025 SGray - Done
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
}// class Weather {

// TODO: Complete the WeatherService class
// 03/25/2025 SGray - Done
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  // 03/25/2025 SGray - Done
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
  // 03/25/2025 SGray - Done
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
  // 03/25/2025 SGray - Done
  // Destructures location data and returns the coordinates
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
  // 03/25/2025 SGray - Done
  // Builds a query string for the OpenWeather Geocoding API
  private buildGeocodeQuery(): string {
    return `${this.APIGeocodeBaseURL}?q=${this.cityName}&${this.state}&${this.country}&limit=1&appid=${this.apiKey}`;
  }

  // TODO: Create buildWeatherQuery method
  // 03/25/2025 SGray - Done
  // Builds a query string for the OpenWeather Weather API
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
  // 03/25/2025 SGray - Done
  // Fetches weather data for the given coordinates
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
  // 03/25/2025 SGray - Done
  // Parses the current weather data and returns a Weather object
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
  // 03/25/2025 SGray - Done
  //Fetches forecast data for the given coordinates
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
  // 03/25/2025 SGray - Done
  // Builds an array of Weather objects from the current weather and forecast data
  private buildForecastArray(currentWeather: Weather, forecastData: any[]): Weather[] {
    // Create a map to store one forecast per day
    const dailyForecastMap = new Map<string, any>();
  
    // Iterate over the forecast data
    forecastData.forEach((forecast) => {
      const date = forecast.dt_txt.split(' ')[0]; // Extract the date (YYYY-MM-DD)
      const time = forecast.dt_txt.split(' ')[1]; // Extract the time (HH:mm:ss)
  
      // Only keep the forecast closest to 12:00:00 for each day
      if (!dailyForecastMap.has(date) || time === '12:00:00') {
        dailyForecastMap.set(date, forecast);
      }
    });
  
    // Convert the map values to an array and map them to Weather objects
    const forecastArray = Array.from(dailyForecastMap.values()).map((forecast) => {
      const date = forecast.dt_txt; // Date and time of the forecast
      const tempF = forecast.main.temp; // Temperature in Fahrenheit
      const windSpeed = forecast.wind.speed; // Wind speed
      const humidity = forecast.main.humidity; // Humidity percentage
      const icon = forecast.weather[0].icon; // Weather icon code
      const iconDescription = forecast.weather[0].description; // Weather description
  
      return new Weather(currentWeather.city, date, icon, iconDescription, tempF, windSpeed, humidity);
    });
  
    // Return an array with the current weather as the first element
    // followed by the filtered forecast data
    return [currentWeather, ...forecastArray];
  }// private buildForecastArray(currentWeather: Weather, forecastData: any[]): Weather[] {

  // TODO: Complete getWeatherForCity method
  // 03/25/2025 SGray - Done
  // Fetches weather data for the given city and returns a Weather object
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
  }// async getWeatherForCity(city: string) {
}

export default new WeatherService();
