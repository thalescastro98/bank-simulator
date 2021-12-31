import { pg } from './database';
import { buildApp } from './app';

(async () => {
  await pg.migrate.latest();
})();

const app = buildApp();

app.listen(process.env.APP_PORT || 8080, () => {
  console.log(`Server listening on ${process.env.APP_PORT || 8080}`);
});
