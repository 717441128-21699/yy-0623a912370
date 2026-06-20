/**
 * local server entry file, for local development
 */
import app from './app.js';
import { runMigrations } from './db/index.js';
import { initMockData } from './db/init.js';

const PORT = process.env.PORT || 3001;

console.log('Initializing database...');
runMigrations();
console.log('Database migrations complete');

console.log('Initializing mock data...');
initMockData();
console.log('Mock data initialization complete');

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;