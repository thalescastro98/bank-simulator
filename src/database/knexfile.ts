// Update with your config settings.

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host : 'localhost',
      port : 5432,
      user : 'postgres',
      password : 'password',
      database : 'bank_simulator'
    }
  }
};
