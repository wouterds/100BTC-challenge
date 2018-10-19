//@flow
import { config } from 'dotenv';
import App from './src/app';

// Setup .env
config();

// Start app
new App();
