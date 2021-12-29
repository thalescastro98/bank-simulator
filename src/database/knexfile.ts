// Update with your config settings.
require('dotenv').config({path:'../../.env'});

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host : process.env.POSTGRES_HOST || 'localhost',
      port : parseInt(process.env.POSTGRES_PORT || '5432'),
      user : process.env.POSTGRES_USER || 'postgres',
      password : process.env.POSTGRES_PASSWORD,
      database : process.env.POSTGRES_DATABASE
    }
  }
};
