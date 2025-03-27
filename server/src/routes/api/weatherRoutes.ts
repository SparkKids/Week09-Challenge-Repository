import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
// 03/26/2025 SGray - Done
router.post('/', (req: Request, res: Response) => {
  // TODO: GET weather data from city name
  // 03/26/2025 SGray - Done
  const cityName = req.body.cityName;
  WeatherService.getWeatherForCity(cityName)
    .then((weatherData) => {
      res.json(weatherData);
    })
    .catch((error) => {
      console.error('Error retrieving weather data:', error);
      res.status(500).json({ error: 'Failed to retrieve weather data' });
    });

  // TODO: save city to search history
  // 03/26/2025 SGray - Done
  HistoryService.addCity(cityName).catch((error) => {
    console.error('Error saving city to search history:', error);
  });
});

// TODO: GET search history
// 03/26/2025 SGray - Done
router.get('/history', async (_, res: Response) => {
  try {
    const cities = await HistoryService.getCities(); // Fetch cities from the history service
    res.json(cities); // Send the cities as a JSON response
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
});

// * BONUS TODO: DELETE city from search history
// 03/26/2025 SGray - Done
router.delete('/history/:id', async (req: Request, res: Response) => {
  const cityId = req.params.id;
  try {
    await HistoryService.removeCity(cityId);
    res.json({ message: 'City removed from search history' });
  } catch (error) {
    console.error('Error removing city from search history:', error);
    res.status(500).json({ error: 'Failed to remove city from search history' });
  }
});

export default router;
