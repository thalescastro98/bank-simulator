# Bank Simulator API

## Description

Aiming to become a back-end developer and test my skills, I developed this API that simulates a bank in a simplified way, where the user can check his balance and make deposits, withdraws and transfers. It is possible to register users and new administrators. Also, you must be an administrator to access all endpoints.

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

- `npm run test` - runs all tests

- `npm run docker-postgres` - starts a local PostgreSQL instance for tests/local development

Note: Remember to use the `npm run docker-postgres` command before using the `npm run dev` and `npm run test` commands.

## Endpoints

First, remember that accessing any endpoint requires a Basic Authorization `login:password`. By default, `admin:admin` is a valid authorization. Also, in the postman folder there is a file with the endpoints examples.

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
    "id": "b5f5d15a-c9ad-4a60-9fe9-6e5dcef87487",
    "name": "john",
    "cpf": "77180560073",
    "email": "example@hotmail.com"
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

To make a deposit or withdraw, you need to send a json with `type` (this must be `deposit` or `withdraw`), `fromId` (uuid of the user who will perform the operation) and `amount`. For example:

```
{
    "type":"deposit",
    "fromId":"b5f5d15a-c9ad-4a60-9fe9-6e5dcef87487",
    "amount":"123.45"
}
```

If a deposit succeeds, a json will be returned with `id` (uuid of the operation), `type` (in this case it will be `credit`), `fromId` (uuid of the depositing user), `amount`, `date` (UTC) and `description` (a brief description of the operation). Something like:

```
{
    "id": "78dbf09a-0582-4e46-9cc8-cbcff0ea73c7",
    "type": "credit",
    "fromId": "b5f5d15a-c9ad-4a60-9fe9-6e5dcef87487",
    "amount": "123.45",
    "date": "2022-01-01T20:30:38.986Z",
    "description": "john deposited $123.45."
}
```

If a withdraw is successful (when sending a json with `withdraw` in `type`), the json returned will be similar to the above, but `type` will be `debit`, `amount` will be negative and `description` will change.

To make a transfer, `type` must be `transfer` and json must contain a `toId` (uuid of the user who will receive the money). For example:

```
{
    "type":"transfer",
    "fromId":"b5f5d15a-c9ad-4a60-9fe9-6e5dcef87487",
    "amount":"98.76",
    "toId":"9efb3284-1f8b-4fb9-a791-68dcd50a8df8"
}
```

If the transfer is successful, a json will be returned with `from` and `to`, where `from` is similar to the object returned by a withdraw and `to` is similar to the object returned by a deposit, changing only the `description `. Something like:

```
{
    "from": {
        "id": "ab6b8733-a67b-4c2b-b92f-853c98ecfab8",
        "type": "debit",
        "fromId": "b5f5d15a-c9ad-4a60-9fe9-6e5dcef87487",
        "amount": "-98.76",
        "date": "2022-01-01T20:38:08.438Z",
        "description": "john transferred $98.76 to antony."
    },
    "to": {
        "id": "218d1af0-acbf-402d-aed3-ff5a2b8059f2",
        "type": "credit",
        "fromId": "9efb3284-1f8b-4fb9-a791-68dcd50a8df8",
        "amount": "98.76",
        "date": "2022-01-01T20:38:08.438Z",
        "description": "john transferred $98.76 to antony."
    }
}
```

### `GET /transactions`

This endpoint has `id` as an optional parameter. If no parameters are passed, an array with all transactions made will be returned in json. That is, each element of the array is an object with `id`, `type`, `fromId`, `amount`, `date` and `description`. For example:

```
[
    {
        "id": "ab6b8733-a67b-4c2b-b92f-853c98ecfab8",
        "type": "debit",
        "fromId": "b5f5d15a-c9ad-4a60-9fe9-6e5dcef87487",
        "amount": "-98.76",
        "date": "2022-01-01T20:38:08.438Z",
        "description": "john transferred $98.76 to antony."
    },
    {
        "id": "218d1af0-acbf-402d-aed3-ff5a2b8059f2",
        "type": "credit",
        "fromId": "9efb3284-1f8b-4fb9-a791-68dcd50a8df8",
        "amount": "98.76",
        "date": "2022-01-01T20:38:08.438Z",
        "description": "john transferred $98.76 to antony."
    },
    {
        "id": "78dbf09a-0582-4e46-9cc8-cbcff0ea73c7",
        "type": "credit",
        "fromId": "b5f5d15a-c9ad-4a60-9fe9-6e5dcef87487",
        "amount": "123.45",
        "date": "2022-01-01T20:30:38.986Z",
        "description": "john deposited $123.45."
    }
]
```

If an id is passed as a parameter (for example `/transactions?id=b5f5d15a-c9ad-4a60-9fe9-6e5dcef87487`) an array will be returned with all transactions made by the user whose id was informed. For example:

```
[
     {
         "id": "ab6b8733-a67b-4c2b-b92f-853c98ecfab8",
         "type": "debit",
         "fromId": "b5f5d15a-c9ad-4a60-9fe9-6e5dcef87487",
         "amount": "-98.76",
         "date": "2022-01-01T20:38:08.438Z",
         "description": "john transferred $98.76 to antony."
     },
     {
         "id": "78dbf09a-0582-4e46-9cc8-cbcff0ea73c7",
         "type": "credit",
         "fromId": "b5f5d15a-c9ad-4a60-9fe9-6e5dcef87487",
         "amount": "123.45",
         "date": "2022-01-01T20:30:38.986Z",
         "description": "john deposited $123.45."
     }
]
```

### `GET /balance/:id`

This endpoint has a required `id` parameter (for example `/balance/b5f5d15a-c9ad-4a60-9fe9-6e5dcef87487`) that returns how much money the user has saved. The return is a json with `id`, `name` and `balance`. Something like:

```
{
     "id": "b5f5d15a-c9ad-4a60-9fe9-6e5dcef87487",
     "name": "john",
     "balance": "24.69"
}
```
