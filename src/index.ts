import { App } from './app.js';

const app = new App();
app.start().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});