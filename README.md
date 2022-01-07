# Bank Simulator API

## Description

Aiming to become a back-end developer and test my skills, I developed this API that simulates a bank in a simplified way, where an administrator can manipulate user's accounts to check their balance and make deposits, withdraws and transfers. It is possible to register new users and new administrators. Also, you must be an administrator to access all endpoints.

## Knowledge applied to API

- TypeScript
- Node
- Express
- Docker
- PostgreSQL
- Jest
- ESLint
- Prettier

## Scripts

- `npm ci` - installs all dependencies

- `npm run dev` - starts the local server

- `npm run build` - transpile the typescript into JavaScript on **dist** folder

- `npm run start` - starts the local server from the file transpiled by the command `npm run build`

- `npm run test` - runs all test on **tests** folder

- `npm run docker-postgres` - starts a local PostgreSQL instance for tests/local development

## .env file

- POSTGRES_HOST: the value of postgres host. Ex: localhost.

- POSTGRES_PASSWORD: the value of postgres password. Ex: password.

- POSTGRES_PORT: listening port for postgres database. Ex: 5432.

- POSTGRES_DB: name of database. Ex: bank_simulator

- POSTGRES_USER: name of postgres user. Ex: postgres.

- ENVIROMENT: defines if it is in the `dev` environment or in the `production` environment. Ex: production

- APP_PORT: port on which the server is listening. Ex: 8080.

## How start the local server

There are two ways to start the server properly. For both, you will need a `.env` file as described above.

The first method to start the server needs a `.env` file like `.env.example`. Once that's done, run the command `docker-compose up db` to start a local PostgreSQL instance. Run the command `npm run test` to run the tests or run the command `npm run dev` to start the local server. You can also change `.env` file, setting `ENVIROMENT` as `production` (`ENVIROMENT=production`), and run the commands `npm run build` and `npm run start`, in that order, to start the local server. To stop and remove the PostgreSQL container, run the command `docker-compose down db`.

The second method to start the server needs a `.env` file like `.env.example`. Once that's done, just run the command `docker-compose up`, which will create and start the necessary containers. Wait a while until the local server is started. To stop and remove running containers, run the command `docker-compose down`.

## Endpoints

First, remember that accessing any endpoint requires a Basic Authorization `login:password`. By default, `admin:admin` is a valid authorization.

In the postman folder there is a file with the endpoints examples.

All information sent goes through a Joi Validator. If the information format is different from the expected format, an error will be returned.

### `GET /`

This endpoint is just to test if the server is working without problems. It should return `Working`.

### `POST /register`

An endpoint for registering new users. You need to send a json with the fields `name`, `cpf` and `email`. An example of a valid json:

```
{
    "name":"john",
    "cpf":"77180560073",
    "email":"example@gmail.com"
}
```

If the registration is successful, a json with `id`, `name`, `cpf` and `email` of the registered user will be returned. Something like:

```
{
    "id": "5340777d-b739-45e4-8660-8819c04030fa",
    "name": "john",
    "cpf": "77180560073",
    "email": "example@gmail.com"
}
```

### `POST /register/admin`

An endpoint to register a new administrator. An administrator has only an ID (uuid), a login and a password, where the login and password are used by Basic Authorization. As said, the login `admin` with the password `admin` is already an administrator by default. On this endpoint, a json with the `login` and `password` fields must be sent. For example:

```
{
    "login":"example",
    "password":"123456"
}
```

If the registration is successful, a json with `id`, `login` and `password` of the registered administrator will be returned. Something like:

```
{
     "id": "aebd53c0-57ad-4876-ba82-1cf0aaa5419c",
     "login": "example",
     "password": "123456"
}
```

As a result of registration, Basic Authorization will allow `example:123456` as a valid `login:password`.

### `POST /transactions`

This endpoint will be where deposit, withdraw and transfer transactions occur.

To make a deposit, you need to send a json with `type` (this must be `deposit`), `fromId` (uuid of the user who will perform the operation) and `amount`. For example:

```
{
    "type":"deposit",
    "fromId":"5340777d-b739-45e4-8660-8819c04030fa",
    "amount":"123.45"
}
```

If a deposit succeeds, a json will be returned with `id` (uuid of the operation), `type` (in this case it will be `credit`), `fromId` (uuid of the user who deposited money), `amount`, `date` (UTC) and `description` (a brief description of the operation). Something like:

```
{
    "id": "35c86836-347d-4454-ac23-01f14061374e",
    "type": "credit",
    "fromId": "5340777d-b739-45e4-8660-8819c04030fa",
    "amount": "123.45",
    "date": "2022-01-02T18:00:44.842Z",
    "description": "john deposited R$123.45."
}
```

To make a withdraw, you need to send a json with `type` (this must be `withdraw`), `fromId` (uuid of the user who will perform the operation) and `amount`. For example:

```
{
    "type":"withdraw",
    "fromId":"5340777d-b739-45e4-8660-8819c04030fa",
    "amount":"10.99"
}
```

If a withdraw succeeds, a json will be returned with `id` (uuid of the operation), `type` (in this case it will be `debit`), `fromId` (uuid of the user who withdrew money), `amount` (in this case `amount` will be negative), `date` and `description`. Something like:

```
{
    "id": "a8f3d55c-5acd-4329-852d-52fdc79f16ff",
    "type": "debit",
    "fromId": "5340777d-b739-45e4-8660-8819c04030fa",
    "amount": "-10.99",
    "date": "2022-01-02T18:02:57.464Z",
    "description": "john withdrew R$10.99."
}
```

To make a transfer, `type` must be `transfer` and json must contain a `toId` (uuid of the user who will receive the money). For example:

```
{
    "type":"transfer",
    "fromId":"5340777d-b739-45e4-8660-8819c04030fa",
    "amount":"98.76",
    "toId":"b80a9d08-35fa-49eb-98a1-fad32da85c81"
}
```

If the transfer is successful, a json will be returned with `from` and `to`, where `from` is similar to the object returned by a `withdraw` operation and `to` is similar to the object returned by a `deposit` operation, changing only the `description`. Something like:

```
{
    "from": {
        "id": "4fd34e94-f65c-4070-abdc-9912c4fcfbb9",
        "type": "debit",
        "fromId": "5340777d-b739-45e4-8660-8819c04030fa",
        "amount": "-98.76",
        "date": "2022-01-02T18:07:15.391Z",
        "description": "john transferred R$98.76 to antony."
    },
    "to": {
        "id": "7d3fe624-a9c9-48dd-b598-117a3014f946",
        "type": "credit",
        "fromId": "b80a9d08-35fa-49eb-98a1-fad32da85c81",
        "amount": "98.76",
        "date": "2022-01-02T18:07:15.391Z",
        "description": "john transferred R$98.76 to antony."
    }
}
```

### `GET /transactions`

This endpoint has `id` as an optional parameter. If no parameters are passed, an array with all transactions made will be returned in json. Each element of the array is an object with `id`, `type`, `fromId`, `amount`, `date` and `description`. For example:

```
[
    {
        "id": "4fd34e94-f65c-4070-abdc-9912c4fcfbb9",
        "type": "debit",
        "fromId": "5340777d-b739-45e4-8660-8819c04030fa",
        "amount": "-98.76",
        "date": "2022-01-02T18:07:15.391Z",
        "description": "john transferred R$98.76 to antony."
    },
    {
        "id": "7d3fe624-a9c9-48dd-b598-117a3014f946",
        "type": "credit",
        "fromId": "b80a9d08-35fa-49eb-98a1-fad32da85c81",
        "amount": "98.76",
        "date": "2022-01-02T18:07:15.391Z",
        "description": "john transferred R$98.76 to antony."
    },
    {
        "id": "a8f3d55c-5acd-4329-852d-52fdc79f16ff",
        "type": "debit",
        "fromId": "5340777d-b739-45e4-8660-8819c04030fa",
        "amount": "-10.99",
        "date": "2022-01-02T18:02:57.464Z",
        "description": "john withdrew R$10.99."
    },
    {
        "id": "35c86836-347d-4454-ac23-01f14061374e",
        "type": "credit",
        "fromId": "5340777d-b739-45e4-8660-8819c04030fa",
        "amount": "123.45",
        "date": "2022-01-02T18:00:44.842Z",
        "description": "john deposited R$123.45."
    }
]
```

If an id is passed as a parameter (for example `/transactions?id=5340777d-b739-45e4-8660-8819c04030fa`) an array will be returned with all transactions made by the user whose id was informed. For example:

```
[
    {
        "id": "4fd34e94-f65c-4070-abdc-9912c4fcfbb9",
        "type": "debit",
        "fromId": "5340777d-b739-45e4-8660-8819c04030fa",
        "amount": "-98.76",
        "date": "2022-01-02T18:07:15.391Z",
        "description": "john transferred R$98.76 to antony."
    },
    {
        "id": "a8f3d55c-5acd-4329-852d-52fdc79f16ff",
        "type": "debit",
        "fromId": "5340777d-b739-45e4-8660-8819c04030fa",
        "amount": "-10.99",
        "date": "2022-01-02T18:02:57.464Z",
        "description": "john withdrew R$10.99."
    },
    {
        "id": "35c86836-347d-4454-ac23-01f14061374e",
        "type": "credit",
        "fromId": "5340777d-b739-45e4-8660-8819c04030fa",
        "amount": "123.45",
        "date": "2022-01-02T18:00:44.842Z",
        "description": "john deposited R$123.45."
    }
]
```

### `GET /balance/:id`

This endpoint has a required `id` parameter (for example `/balance/b5f5d15a-c9ad-4a60-9fe9-6e5dcef87487`) that returns how much money the user has saved. The return is a json with `id`, `name` and `balance`. Something like:

```
{
    "id": "5340777d-b739-45e4-8660-8819c04030fa",
    "name": "john",
    "balance": "13.70"
}
```
