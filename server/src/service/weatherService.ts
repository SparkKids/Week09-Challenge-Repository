import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
export interface Coordinates {
  latitude: number;
  longitude: number;
}
// TODO: Define a class for the Weather object
// class Weather {
//   cityName: string;
//   stateCode: string;
//   country: string;
//   latitude: number;
//   longitude: number;
//   //currentWeather: CurrentWeather;
//   geocodeBaseUrl: string;
//   constructor() {
//     this.cityName = '';
//     this.stateCode = '';
//     this.country = '';
//     this.latitude = 0;
//     this.longitude = 0;
//     //this.currentWeather = new CurrentWeather(0, 0, 0, '');
//     this.geocodeBaseUrl  = `https://api.openweathermap.org/geo/1.0/direct`;
//   }


//   // Example method to convert temperature to Fahrenheit
//   toFahrenheit(): number {
//     return (this.temperature * 9) / 5 + 32;
//   }
//   setCoordinates(cityName: string, apiKey: string): Coordinates {
//     const geocodeUrl = `${this.geocodeBaseUrl}?q=${cityName},CO,US&limit=1&appid=${apiKey}`;
//   }
// }

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private apiKey: string;
  private baseURL: string;
  private cityName: string;
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || ''; // Your API key
    this.baseURL = process.env.API_BASE_URL || 'https://api.openweathermap.org';
    this.cityName = ''; // Initialize city name
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
    if (lat === undefined || lon === undefined) {
      throw new Error('Invalid location data: Missing latitude or longitude.');
    }
  
    return { latitude: lat, longitude: lon }; // Return as a Coordinates object
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}`;
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

    if (!response.ok) {
      throw new Error(`Failed to fetch weather data for coordinates: ${JSON.stringify(coordinates)}`);
    }

    const data = await response.json();
    return data; // Return the raw weather data
  }
  // TODO: Build parseCurrentWeather method
  // private parseCurrentWeather(response: any) {}
  // TODO: Complete buildForecastArray method
  // private buildForecastArray(currentWeather: Weather, weatherData: any[]) {}
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.cityName = city;
    try {
      const coordinates = await this.fetchAndDestructureLocationData();
      console.log('Coordinates:', coordinates);
      return coordinates; // Return coordinates for now
      // Uncomment and implement the following lines when ready
      const weatherData = await this.fetchWeatherData(coordinates);
      console.log('Weather Data:', weatherData);
      //const currentWeather = this.parseCurrentWeather(weatherData);
      //return currentWeather;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error; // Rethrow the error for handling in the calling code
    }
  }
}

export default new WeatherService();
