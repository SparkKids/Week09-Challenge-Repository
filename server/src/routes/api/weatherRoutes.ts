import { Router, type Request, type Response } from 'express';
const router = Router();

// import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', (req: Request, res: Response) => {
  // TODO: GET weather data from city name
  console.log('Received request to get weather data');
  console.log('Request body:', req.body);
  const cityName = req.body.cityName;
  console.log('City name:', cityName);
  WeatherService.getWeatherForCity(cityName)
    .then((weatherData) => {
      res.json(weatherData);
    })
    .catch((error) => {
      console.error('Error retrieving weather data:', error);
      res.status(500).json({ error: 'Failed to retrieve weather data' });
    });
  // TODO: save city to search history
});

// TODO: GET search history
//router.get('/history', async (req: Request, res: Response) => {});

// * BONUS TODO: DELETE city from search history
//router.delete('/history/:id', async (req: Request, res: Response) => {});

export default router;
