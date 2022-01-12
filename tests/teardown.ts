import { getConnection } from '../src/database';
require('ts-node/register');

const teardown = async () => {
  await getConnection().destroy();
};

export default teardown;
