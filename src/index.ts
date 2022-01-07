import { setupDatabase } from './database';
import { buildApp } from './app';

setupDatabase();

const app = buildApp();

app.listen(process.env.APP_PORT || 8080, () => {
  console.log(`Server listening on ${process.env.APP_PORT || 8080}`);
});
