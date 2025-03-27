import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Replicate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Define a City class with name and id properties
// 03/26/2025 SGray - Done
class City {
  id: string; // Unique identifier for the city
  name: string; // Name of the city

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}//class City {


// TODO: Complete the HistoryService class
// 03/26/2025 SGray - Done
class HistoryService {
  // TODO: Define a read method that reads from the searchHistory.json file
  // 03/26/2025 SGray - Done
  async read() {
    const filePath = path.join(__dirname, '../../data/searchHistory.json');
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  }//async read() {

  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  // 03/26/2025 SGray - Done
  async getCities(): Promise<City[]> {
    const cities = await this.read();
    return cities.map((city: any) => new City(city.id, city.name)); // Convert plain objects to City instances
  }//async getCities(): Promise<City[]> {

  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  // 03/26/2025 SGray - Done
  async write(cities: City[]) {
    const filePath = path.join(__dirname, '../../data/searchHistory.json');
    await fs.promises.writeFile(filePath, JSON.stringify(cities, null, 2));
  }//async write(cities: City[]) {
  
  // TODO Define an addCity method that adds a city to the searchHistory.json file
  // 03/26/2025 SGray - Done
  async addCity(name: string): Promise<void> {
    const cities = await this.getCities(); // Read existing cities
    const id = uuidv4(); // Generate a unique ID
    const newCity = new City(id, name);
    cities.push(newCity); // Add the new city
    await this.write(cities); // Save the updated list
  }//async addCity(name: string): Promise<void> {

  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  // 03/26/2025 SGray - Done
  async removeCity(id: string): Promise<void> {
    const cities = await this.getCities(); // Read existing cities
    const updatedCities = cities.filter((city) => city.id !== id); // Remove the city with the matching ID
    await this.write(updatedCities); // Save the updated list
  }//async removeCity(id: string): Promise<void> {
}//class HistoryService {

export default new HistoryService();
