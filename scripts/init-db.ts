import { initDB } from '../src/lib/db';

console.log('Initializing database...');
try {
  initDB();
  console.log('Database initialized successfully.');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}
