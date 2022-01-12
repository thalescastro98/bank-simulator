import { pg } from '../src/database';
require('ts-node/register');

const teardown = async () => {
  await pg.destroy();
};

export default teardown;
