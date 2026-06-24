
import { config } from './config.js';
import { init, setupEventListeners } from './events.js';

setupEventListeners();
init(config.DEFAULT_ACCOUNT);
