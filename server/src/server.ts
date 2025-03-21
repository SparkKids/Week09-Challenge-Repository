// 03/16/2025 SGray - Done
import dotenv from 'dotenv';
import express from 'express';
import path from 'path'; // Import path module
import { fileURLToPath } from 'url';

dotenv.config();


const app = express();

const PORT = process.env.PORT || 3001;

// Replicate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Serve static files of entire client dist folder
app.use(express.static(path.join(__dirname, '../../client/dist')));

// TODO: Implement middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import and use routes
import routes from './routes/index.js';
app.use(routes);

// Start the server on the port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
