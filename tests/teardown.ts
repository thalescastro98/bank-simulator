import * as dotenv from 'dotenv';
import { pg } from '../src/database';
dotenv.config();
require('ts-node/register');

const teardown = async () => {
  await pg.destroy();
};

export default teardown;
