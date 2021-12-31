import * as request from 'supertest';
import { buildApp } from '../src/app';
import { pg } from '../src/database';
import * as joischemas from '../src/schemas/joi-schemas';
import { newDeposit, newTransfer, newWithdraw, registerAdmin, registerUser } from './schemas';
import { cpf } from 'cpf-cnpj-validator';

describe('All tests', () => {
  let app: any;
  beforeAll(async () => {
    app = buildApp();
    await pg.migrate.latest();
    return;
  });

  afterAll(async () => {
    await pg.migrate.rollback();
    await pg.destroy();
    return;
  });

  describe('Basic authentication test for admin', () => {
    it('Successful authentication', async () => {
      const response = await request(app).get('/').auth('admin', 'admin', { type: 'basic' });
      expect(response.status).toBe(200);
      expect(response.text).toBe('Working');
    });

    describe('Failed authentication', () => {
      it('Wrong password', async () => {
        const response = await request(app).get('/').auth('admin', 'admi', { type: 'basic' });
        expect(response.status).toBe(401);
        expect(response.text).toBe('{"error":"Access Denied."}');
      });

      it('JoiSchema error in login', async () => {
        const response = await request(app).get('/').auth('ad', 'admi', { type: 'basic' });
        expect(response.body).toStrictEqual([
          {
            message: '"name" length must be at least 4 characters long',
            path: ['name'],
            type: 'string.min',
            context: {
              limit: 4,
              value: 'ad',
              label: 'name',
              key: 'name',
            },
          },
        ]);
        expect(response.status).toBe(400);
      });

      it('JoiSchema error in password', async () => {
        const response = await request(app).get('/').auth('admi', 'ad', { type: 'basic' });
        expect(response.body).toStrictEqual([
          {
            message: '"pass" length must be at least 4 characters long',
            path: ['pass'],
            type: 'string.min',
            context: { limit: 4, value: 'ad', label: 'pass', key: 'pass' },
          },
        ]);
        expect(response.status).toBe(400);
      });
    });
  });

  describe('Register admin tests', () => {
    it('Create new admin successfully', async () => {
      const response = await registerAdmin(app, 'newadmin', 'newpassword');
      expect(response.status).toBe(200);
      expect(response.body.login).toBe('newadmin');
      expect(response.body.password).toBe('newpassword');
      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toHaveLength(36);
    });

    it('Creating admins with same password', async () => {
      const firstAdm = await registerAdmin(app, 'firstadm', 'samepassword');
      const secondAdm = await registerAdmin(app, 'secondadm', 'samepassword');
      expect(secondAdm.status).toBe(200);
      expect(secondAdm.body.login).toBe('secondadm');
      expect(secondAdm.body.password).toBe('samepassword');
      expect(firstAdm.body.login).toBe('firstadm');
      expect(firstAdm.body.password).toBe('samepassword');
    });

    it('Using new admin credentials', async () => {
      const creating = await registerAdmin(app, 'createadmin', 'thepassword');
      const using = await request(app).get('/').auth('createadmin', 'thepassword', { type: 'basic' });
      expect(using.status).toBe(200);
      expect(using.text).toBe('Working');
    });

    it('Trying to creating admins with same login', async () => {
      const admOne = await registerAdmin(app, 'samelogin', 'passwordone');
      const admTwo = await registerAdmin(app, 'samelogin', 'passwordtwo');
      expect(admOne.body.login).toBe('samelogin');
      expect(admOne.body.password).toBe('passwordone');
      expect(admTwo.status).toBe(409);
      expect(admTwo.body).toStrictEqual({ error: 'Login has already been registered.' });
    });

    it('Trying to creating admin with login too long', async () => {
      const longLogin = await registerAdmin(app, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'normalpassword');
      expect(longLogin.status).toBe(400);
      expect(longLogin.body).toStrictEqual([
        {
          message: '"login" length must be less than or equal to 30 characters long',
          path: ['login'],
          type: 'string.max',
          context: { limit: 30, value: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', label: 'login', key: 'login' },
        },
      ]);
    });

    it('Trying to creating admin with login too short', async () => {
      const shortLogin = await registerAdmin(app, 'aaa', 'normalpasswordagain');
      expect(shortLogin.status).toBe(400);
      expect(shortLogin.body).toStrictEqual([
        {
          message: '"login" length must be at least 4 characters long',
          path: ['login'],
          type: 'string.min',
          context: { limit: 4, value: 'aaa', label: 'login', key: 'login' },
        },
      ]);
    });

    it('Trying to creating admin with password too long', async () => {
      const longPassword = await registerAdmin(app, 'normallogin', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      expect(longPassword.status).toBe(400);
      expect(longPassword.body).toStrictEqual([
        {
          message: '"password" length must be less than or equal to 30 characters long',
          path: ['password'],
          type: 'string.max',
          context: { limit: 30, value: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', label: 'password', key: 'password' },
        },
      ]);
    });

    it('Trying to creating admin with password too short', async () => {
      const shortPassword = await registerAdmin(app, 'normalloginagain', 'abc');
      expect(shortPassword.status).toBe(400);
      expect(shortPassword.body).toStrictEqual([
        {
          message: '"password" length must be at least 4 characters long',
          path: ['password'],
          type: 'string.min',
          context: { limit: 4, value: 'abc', label: 'password', key: 'password' },
        },
      ]);
    });
  });

  describe('Register Users tests', () => {
    it('Create new admin successfully', async () => {
      const userCPF = cpf.generate();
      const newUser = await registerUser(app, 'newuser', userCPF, 'email@gmail.com');
      expect(newUser.status).toBe(200);
      expect(newUser.body.name).toBe('newuser');
      expect(newUser.body.cpf).toBe(userCPF);
      expect(newUser.body.email).toBe('email@gmail.com');
      expect(newUser.body).toHaveProperty('id');
      expect(newUser.body.id).toHaveLength(36);
    });

    it('Trying to creating users with same cpf', async () => {
      const userCPF = cpf.generate();
      const firstUser = await registerUser(app, 'firstUser', userCPF, 'firstemail@gmail.com');
      const secondUser = await registerUser(app, 'secondUser', userCPF, 'secondemail@gmail.com');
      expect(firstUser.body.name).toBe('firstUser');
      expect(firstUser.body.cpf).toBe(userCPF);
      expect(firstUser.body.email).toBe('firstemail@gmail.com');
      expect(secondUser.status).toBe(409);
      expect(secondUser.body).toStrictEqual({ error: 'CPF has already been registered.' });
    });

    it('Trying to creating users with same email', async () => {
      const firstCPF = cpf.generate();
      const userOne = await registerUser(app, 'userOne', firstCPF, 'sameemail@gmail.com');
      const userTwo = await registerUser(app, 'userTwo', cpf.generate(), 'sameemail@gmail.com');
      expect(userOne.body.name).toBe('userOne');
      expect(userOne.body.cpf).toBe(firstCPF);
      expect(userOne.body.email).toBe('sameemail@gmail.com');
      expect(userTwo.status).toBe(409);
      expect(userTwo.body).toStrictEqual({ error: 'Email has already been registered.' });
    });

    it('Crating users with same name', async () => {
      const userCPF = cpf.generate();
      const sameNameOne = await registerUser(app, 'samename', cpf.generate(), 'samenameone@gmail.com');
      const sameNameTwo = await registerUser(app, 'samename', userCPF, 'samenametwo@gmail.com');
      expect(sameNameTwo.status).toBe(200);
      expect(sameNameTwo.body.name).toBe('samename');
      expect(sameNameTwo.body.cpf).toBe(userCPF);
      expect(sameNameTwo.body.email).toBe('samenametwo@gmail.com');
    });

    it('Trying to creating user with a name too short', async () => {
      const tooShort = await registerUser(app, 'ab', cpf.generate(), 'tooshort@gmail.com');
      expect(tooShort.status).toBe(400);
      expect(tooShort.body).toStrictEqual([
        {
          message: '"name" with value "ab" fails to match the required pattern: /^[a-zA-Z]{3,30}$/',
          path: ['name'],
          type: 'string.pattern.base',
          context: { regex: {}, value: 'ab', label: 'name', key: 'name' },
        },
      ]);
    });

    it('Trying to creating user with a name too long', async () => {
      const tooLong = await registerUser(app, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', cpf.generate(), 'tooLong@gmail.com');
      expect(tooLong.status).toBe(400);
      expect(tooLong.body).toStrictEqual([
        {
          message: '"name" with value "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" fails to match the required pattern: /^[a-zA-Z]{3,30}$/',
          path: ['name'],
          type: 'string.pattern.base',
          context: { regex: {}, value: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', label: 'name', key: 'name' },
        },
      ]);
    });

    it('Trying to creating user with invalid cpf', async () => {
      const invalidCPF = await registerUser(app, 'invalidcpf', '56403246054', 'invalidcpf@gmail.com');
      expect(invalidCPF.status).toBe(400);
      expect(invalidCPF.body).toStrictEqual([
        { message: 'CPF inválido', path: ['cpf'], type: 'document.cpf', context: { label: 'cpf', value: '56403246054', key: 'cpf' } },
      ]);
    });

    it('Trying to creating user with invalid email', async () => {
      const invalidEmail = await registerUser(app, 'invalidemail', cpf.generate(), 'invalidemailgmail.com');
      expect(invalidEmail.status).toBe(400);
      expect(invalidEmail.body).toStrictEqual([
        {
          message: '"email" must be a valid email',
          path: ['email'],
          type: 'string.email',
          context: { value: 'invalidemailgmail.com', invalids: ['invalidemailgmail.com'], label: 'email', key: 'email' },
        },
      ]);
    });
  });

  describe('Transactions test', () => {
    describe('Deposit tests', () => {
      it('Make a new deposit', async () => {
        const user = await registerUser(app, 'newdeposit', cpf.generate(), 'newdeposit@gmail.com');
        const deposit = await newDeposit(app, user.body.id, '123.45');
        expect(deposit.status).toBe(200);
        expect(deposit.body.type).toBe('credit');
        expect(deposit.body.fromId).toBe(user.body.id);
        expect(deposit.body.amount).toBe('123.45');
        expect(deposit.body).toHaveProperty('date');
        expect(deposit.body).toHaveProperty('description');
        expect(deposit.body).toHaveProperty('id');
        expect(deposit.body.id).toHaveLength(36);
      });

      it('Trying to make a deposit with an id not registered', async () => {
        const deposit = await newDeposit(app, 'c5e4cdfc-1c38-4aec-b1ea-92da4737989d', '123.45');
        expect(deposit.status).toBe(404);
        expect(deposit.body).toStrictEqual({
          error: 'This ID is not registered.',
        });
      });

      it('Trying to make a deposit with no money', async () => {
        const user = await registerUser(app, 'nomoney', cpf.generate(), 'nomoney@gmail.com');
        const noMoney = await newDeposit(app, user.body.id, '0.00');
        expect(noMoney.status).toBe(400);
        expect(noMoney.body).toStrictEqual({ error: 'Transactions with R$0.00 are not allowed' });
      });

      it('Trying to make a deposit with negative money', async () => {
        const user = await registerUser(app, 'negativemoney', cpf.generate(), 'negativemoney@gmail.com');
        const negativeMoney = await newDeposit(app, user.body.id, '-123.45');
        expect(negativeMoney.status).toBe(400);
        expect(negativeMoney.body).toStrictEqual([
          {
            message: '"amount" with value "-123.45" fails to match the required pattern: /^\\d{1,10}\\.\\d{2}$/',
            path: ['amount'],
            type: 'string.pattern.base',
            context: {
              regex: {},
              value: '-123.45',
              label: 'amount',
              key: 'amount',
            },
          },
        ]);
      });

      it('Trying to make a deposit with toId', async () => {
        const user = await registerUser(app, 'withtoid', cpf.generate(), 'withtoid@gmail.com');
        const withToId = await request(app)
          .post('/transactions')
          .send({ type: 'deposit', fromId: user.body.id, amount: '543.21', toId: 'fd30a8aa-8679-40d7-8d1d-0d73164c9f87' })
          .auth('admin', 'admin', { type: 'basic' });
        expect(withToId.status).toBe(400);
        expect(withToId.body).toStrictEqual({ error: 'toId must be null for this kind of operation.' });
      });

      it('Trying to make a deposit with invalid id', async () => {
        const noMoney = await newDeposit(app, 'de3a271-f5ac-4bb-bc63-b6cf4eafb3b5', '0.00');
        expect(noMoney.status).toBe(400);
        expect(noMoney.body).toStrictEqual([
          {
            message: '"fromId" must be a valid GUID',
            path: ['fromId'],
            type: 'string.guid',
            context: { label: 'fromId', value: 'de3a271-f5ac-4bb-bc63-b6cf4eafb3b5', key: 'fromId' },
          },
        ]);
      });
    });

    describe('Withdraw tests', () => {
      it('Make a new withdraw', async () => {
        const user = await registerUser(app, 'newwithdraw', cpf.generate(), 'newwithdraw@gmail.com');
        const deposit = await newDeposit(app, user.body.id, '1000.00');
        const withdraw = await newWithdraw(app, user.body.id, '123.45');
        expect(withdraw.status).toBe(200);
        expect(withdraw.body.type).toBe('debit');
        expect(withdraw.body.fromId).toBe(user.body.id);
        expect(withdraw.body.amount).toBe('-123.45');
        expect(withdraw.body).toHaveProperty('date');
        expect(withdraw.body).toHaveProperty('description');
        expect(withdraw.body).toHaveProperty('id');
        expect(withdraw.body.id).toHaveLength(36);
      });

      it('Trying to make a withdraw when user have no money', async () => {
        const user = await registerUser(app, 'withdrawwithnomoney', cpf.generate(), 'withdrawwithnomoney@gmail.com');
        const withdraw = await newWithdraw(app, user.body.id, '123.45');
        expect(withdraw.status).toBe(400);
        expect(withdraw.body).toStrictEqual({ error: "This user don't have this amount of money." });
      });

      it("Trying to make a withdraw when the user doesn't have enough money", async () => {
        const user = await registerUser(app, 'insufficientmoney', cpf.generate(), 'insufficientmoney@gmail.com');
        const deposit = await newDeposit(app, user.body.id, '123.44');
        const withdraw = await newWithdraw(app, user.body.id, '123.45');
        expect(withdraw.status).toBe(400);
        expect(withdraw.body).toStrictEqual({ error: "This user don't have this amount of money." });
      });

      it('Withdraw all money', async () => {
        const user = await registerUser(app, 'withdrawallmoney', cpf.generate(), 'withdrawallmoney@gmail.com');
        const deposit = await newDeposit(app, user.body.id, '543.21');
        const withdraw = await newWithdraw(app, user.body.id, '543.21');
        expect(withdraw.status).toBe(200);
        expect(withdraw.body.type).toBe('debit');
        expect(withdraw.body.fromId).toBe(user.body.id);
        expect(withdraw.body.amount).toBe('-543.21');
        expect(withdraw.body).toHaveProperty('date');
        expect(withdraw.body).toHaveProperty('description');
        expect(withdraw.body).toHaveProperty('id');
        expect(withdraw.body.id).toHaveLength(36);
      });

      it('Trying to make a withdraw with an id not registered', async () => {
        const withdraw = await newWithdraw(app, 'a55295a9-24e3-480b-81aa-eb360be8afa4', '123.45');
        expect(withdraw.status).toBe(404);
        expect(withdraw.body).toStrictEqual({ error: 'This ID is not registered.' });
      });

      it('Trying to make a withdraw with value 0.00', async () => {
        const user = await registerUser(app, 'novaluewithdraw', cpf.generate(), 'novaluewithdraw@gmail.com');
        const noMoney = await newWithdraw(app, user.body.id, '0.00');
        expect(noMoney.status).toBe(400);
        expect(noMoney.body).toStrictEqual({ error: 'Transactions with R$0.00 are not allowed' });
      });

      it('Trying to make a withdraw with negative money', async () => {
        const user = await registerUser(app, 'negativewithdraw', cpf.generate(), 'negativewithdraw@gmail.com');
        const negativeWithdraw = await newWithdraw(app, user.body.id, '-321.45');
        expect(negativeWithdraw.status).toBe(400);
        expect(negativeWithdraw.body).toStrictEqual([
          {
            message: '"amount" with value "-321.45" fails to match the required pattern: /^\\d{1,10}\\.\\d{2}$/',
            path: ['amount'],
            type: 'string.pattern.base',
            context: { regex: {}, value: '-321.45', label: 'amount', key: 'amount' },
          },
        ]);
      });

      it('Trying to make a withdraw with toId', async () => {
        const user = await registerUser(app, 'withdrawwithtoid', cpf.generate(), 'withdrawwithtoid@gmail.com');
        const withToId = await request(app)
          .post('/transactions')
          .send({ type: 'withdraw', fromId: user.body.id, amount: '543.21', toId: '38510be0-71f7-4070-8b1d-989e86e5bbe4' })
          .auth('admin', 'admin', { type: 'basic' });
        expect(withToId.status).toBe(400);
        expect(withToId.body).toStrictEqual({ error: 'toId must be null for this kind of operation.' });
      });

      it('Trying to make a withdraw with invalid id', async () => {
        const invalidId = await newWithdraw(app, '6ce87f01-b948-4ea6e-80ac-f54bbe5f6904c', '123.45');
        expect(invalidId.status).toBe(400);
        expect(invalidId.body).toStrictEqual([
          {
            message: '"fromId" must be a valid GUID',
            path: ['fromId'],
            type: 'string.guid',
            context: { label: 'fromId', value: '6ce87f01-b948-4ea6e-80ac-f54bbe5f6904c', key: 'fromId' },
          },
        ]);
      });
    });

    describe('Transfer tests', () => {
      it('Make a new transfer', async () => {
        const firstUser = await registerUser(app, 'firsttransfer', cpf.generate(), 'firsttransfer@gmail.com');
        const secondUser = await registerUser(app, 'secondtransfer', cpf.generate(), 'secondtransfer@gmail.com');
        const deposit = await newDeposit(app, firstUser.body.id, '1000.00');
        const transfer = await newTransfer(app, firstUser.body.id, '257.89', secondUser.body.id);
        expect(transfer.status).toBe(200);
        expect(transfer.body).toHaveProperty('from');
        expect(transfer.body).toHaveProperty('to');
        expect(transfer.body.from.type).toBe('debit');
        expect(transfer.body.from.fromId).toBe(firstUser.body.id);
        expect(transfer.body.from.amount).toBe('-257.89');
        expect(transfer.body.from).toHaveProperty('date');
        expect(transfer.body.from).toHaveProperty('description');
        expect(transfer.body.from).toHaveProperty('id');
        expect(transfer.body.from.id).toHaveLength(36);
        expect(transfer.body.to.type).toBe('credit');
        expect(transfer.body.to.fromId).toBe(secondUser.body.id);
        expect(transfer.body.to.amount).toBe('257.89');
        expect(transfer.body.to).toHaveProperty('date');
        expect(transfer.body.to).toHaveProperty('description');
        expect(transfer.body.to).toHaveProperty('id');
        expect(transfer.body.to.id).toHaveLength(36);
      });

      it('Trying to make a transfer when user have no money', async () => {
        const firstUser = await registerUser(app, 'firstnomoney', cpf.generate(), 'firstnomoney@gmail.com');
        const secondUser = await registerUser(app, 'secondnomoney', cpf.generate(), 'secondnomoney@gmail.com');
        const transfer = await newTransfer(app, firstUser.body.id, '0.59', secondUser.body.id);
        expect(transfer.status).toBe(400);
        expect(transfer.body).toStrictEqual({ error: "This user don't have this amount of money." });
      });

      it("Trying to make a transfer when the user doesn't have enough money", async () => {
        const firstUser = await registerUser(app, 'firstinsufficientmoney', cpf.generate(), 'firstinsufficientmoney@gmail.com');
        const secondUser = await registerUser(app, 'secondinsufficientmoney', cpf.generate(), 'secondinsufficientmoney@gmail.com');
        const deposit = await newDeposit(app, firstUser.body.id, '78.54');
        const transfer = await newTransfer(app, firstUser.body.id, '78.55', secondUser.body.id);
        expect(transfer.status).toBe(400);
        expect(transfer.body).toStrictEqual({ error: "This user don't have this amount of money." });
      });

      it('Transfer all money', async () => {
        const firstUser = await registerUser(app, 'firstallmoney', cpf.generate(), 'firstallmoney@gmail.com');
        const secondUser = await registerUser(app, 'secondallmoney', cpf.generate(), 'secondallmoney@gmail.com');
        const deposit = await newDeposit(app, firstUser.body.id, '1234567.89');
        const transfer = await newTransfer(app, firstUser.body.id, '1234567.89', secondUser.body.id);
        expect(transfer.status).toBe(200);
        expect(transfer.body).toHaveProperty('from');
        expect(transfer.body).toHaveProperty('to');
        expect(transfer.body.from.type).toBe('debit');
        expect(transfer.body.from.fromId).toBe(firstUser.body.id);
        expect(transfer.body.from.amount).toBe('-1234567.89');
        expect(transfer.body.from).toHaveProperty('date');
        expect(transfer.body.from).toHaveProperty('description');
        expect(transfer.body.from).toHaveProperty('id');
        expect(transfer.body.from.id).toHaveLength(36);
        expect(transfer.body.to.type).toBe('credit');
        expect(transfer.body.to.fromId).toBe(secondUser.body.id);
        expect(transfer.body.to.amount).toBe('1234567.89');
        expect(transfer.body.to).toHaveProperty('date');
        expect(transfer.body.to).toHaveProperty('description');
        expect(transfer.body.to).toHaveProperty('id');
        expect(transfer.body.to.id).toHaveLength(36);
      });

      it('Trying to make a transfer with an id not registered', async () => {
        const user = await registerUser(app, 'touser', cpf.generate(), 'touser@gmail.com');
        const transfer = await newTransfer(app, '74c667d0-6167-48ed-922a-e796500f85cc', '123.45', user.body.id);
        expect(transfer.status).toBe(404);
        expect(transfer.body).toStrictEqual({ error: 'This ID is not registered.' });
      });

      it('Trying to make a transfer with value 0.00', async () => {
        const firstUser = await registerUser(app, 'firstnovalue', cpf.generate(), 'firstnovalue@gmail.com');
        const secondUser = await registerUser(app, 'secondnovalue', cpf.generate(), 'secondnovalue@gmail.com');
        const noValue = await newTransfer(app, firstUser.body.id, '0.00', secondUser.body.id);
        expect(noValue.status).toBe(400);
        expect(noValue.body).toStrictEqual({ error: 'Transactions with R$0.00 are not allowed' });
      });

      it('Trying to make a transfer with negative money', async () => {
        const firstUser = await registerUser(app, 'firstnegativemoney', cpf.generate(), 'firstnegativemoney@gmail.com');
        const secondUser = await registerUser(app, 'secondnegativemoney', cpf.generate(), 'secondnegativemoney@gmail.com');
        const negativeTransfer = await newTransfer(app, firstUser.body.id, '-5.73', secondUser.body.id);
        expect(negativeTransfer.status).toBe(400);
        expect(negativeTransfer.body).toStrictEqual([
          {
            message: '"amount" with value "-5.73" fails to match the required pattern: /^\\d{1,10}\\.\\d{2}$/',
            path: ['amount'],
            type: 'string.pattern.base',
            context: {
              regex: {},
              value: '-5.73',
              label: 'amount',
              key: 'amount',
            },
          },
        ]);
      });

      it('Trying to make a transfer without toId', async () => {
        const user = await registerUser(app, 'transferwithouttoid', cpf.generate(), 'transferwithouttoid@gmail.com');
        const withoutToId = await request(app)
          .post('/transactions')
          .send({ type: 'transfer', fromId: user.body.id, amount: '543.21' })
          .auth('admin', 'admin', { type: 'basic' });
        expect(withoutToId.status).toBe(400);
        expect(withoutToId.body).toStrictEqual({ error: 'Missing information.' });
      });

      it('Trying to make a transfer with invalid fromid', async () => {
        const user = await registerUser(app, 'transferinvalidefromid', cpf.generate(), 'transferinvalidefromid@gmail.com');
        const invalideFromId = await newTransfer(app, 'b75a66a7-8ea-4acd-99af-9550bca4fef', '49.76', user.body.id);
        expect(invalideFromId.status).toBe(400);
        expect(invalideFromId.body).toStrictEqual([
          {
            message: '"fromId" must be a valid GUID',
            path: ['fromId'],
            type: 'string.guid',
            context: { label: 'fromId', value: 'b75a66a7-8ea-4acd-99af-9550bca4fef', key: 'fromId' },
          },
        ]);
      });

      it('Trying to make a transfer with invalid toid', async () => {
        const user = await registerUser(app, 'transferinvalidetoid', cpf.generate(), 'transferinvalidetoid@gmail.com');
        const invalideToId = await newTransfer(app, user.body.id, '49.76', '9ea9b54-5d95-49f-9bce-a63d743b94d4');
        expect(invalideToId.status).toBe(400);
        expect(invalideToId.body).toStrictEqual([
          {
            message: '"toId" must be a valid GUID',
            path: ['toId'],
            type: 'string.guid',
            context: { label: 'toId', value: '9ea9b54-5d95-49f-9bce-a63d743b94d4', key: 'toId' },
          },
        ]);
      });

      it('Trying to make a transfer to yourself', async () => {
        const user = await registerUser(app, 'transfertransfertoyourself', cpf.generate(), 'transfertransfertoyourself@gmail.com');
        const transferToYourself = await newTransfer(app, user.body.id, '49.76', user.body.id);
        expect(transferToYourself.status).toBe(400);
        expect(transferToYourself.body).toStrictEqual({ error: "A user can't transfer money to yourself." });
      });
    });

    it('Trying to make another type of operation', async () => {
      const user = await registerUser(app, 'anotheroperation', cpf.generate(), 'anotheroperation@gmail.com');
      const operation = await request(app)
        .post('/transactions')
        .send({ type: 'operation', fromId: user.body.id, amount: '1000.52' })
        .auth('admin', 'admin', { type: 'basic' });
      expect(operation.status).toBe(400);
      expect(operation.body).toStrictEqual([
        {
          message: '"type" with value "operation" fails to match the required pattern: /^deposit$|^withdraw$|^transfer$/',
          path: ['type'],
          type: 'string.pattern.base',
          context: { regex: {}, value: 'operation', label: 'type', key: 'type' },
        },
      ]);
    });

    it('Trying to make another type of operation again', async () => {
      const firstUser = await registerUser(app, 'firstanotheroperation', cpf.generate(), 'firstanotheroperation@gmail.com');
      const secondUser = await registerUser(app, 'secondanotheroperation', cpf.generate(), 'secondanotheroperation@gmail.com');
      const operation = await request(app)
        .post('/transactions')
        .send({ type: 'transferr', fromId: firstUser.body.id, amount: '1000.52', toId: secondUser.body.id })
        .auth('admin', 'admin', { type: 'basic' });
      expect(operation.status).toBe(400);
      expect(operation.body).toStrictEqual([
        {
          message: '"type" with value "transferr" fails to match the required pattern: /^deposit$|^withdraw$|^transfer$/',
          path: ['type'],
          type: 'string.pattern.base',
          context: { regex: {}, value: 'transferr', label: 'type', key: 'type' },
        },
      ]);
    });

    it('Trying to make a operation with invalid amount', async () => {
      const user = await registerUser(app, 'invalidamount', cpf.generate(), 'invalidamount@gmail.com');
      const operation = await newDeposit(app, user.body.id, '10.5');
      expect(operation.status).toBe(400);
      expect(operation.body).toStrictEqual([
        {
          message: '"amount" with value "10.5" fails to match the required pattern: /^\\d{1,10}\\.\\d{2}$/',
          path: ['amount'],
          type: 'string.pattern.base',
          context: { regex: {}, value: '10.5', label: 'amount', key: 'amount' },
        },
      ]);
    });

    it('Trying to make a operation with invalid amount again', async () => {
      const firstUser = await registerUser(app, 'firstinvalidamountagain', cpf.generate(), 'firstinvalidamountagain@gmail.com');
      const secondUser = await registerUser(app, 'secondinvalidamountagain', cpf.generate(), 'secondinvalidamountagain@gmail.com');
      const operation = await newTransfer(app, firstUser.body.id, '716', secondUser.body.id);
      expect(operation.status).toBe(400);
      expect(operation.body).toStrictEqual([
        {
          message: '"amount" with value "716" fails to match the required pattern: /^\\d{1,10}\\.\\d{2}$/',
          path: ['amount'],
          type: 'string.pattern.base',
          context: { regex: {}, value: '716', label: 'amount', key: 'amount' },
        },
      ]);
    });

    it('Get all transactions', async () => {
      const firstUser = await registerUser(app, 'firstgetalltransactions', cpf.generate(), 'firstgetalltransactions@gmail.com');
      const secondUser = await registerUser(app, 'secondgetalltransactions', cpf.generate(), 'secondgetalltransactions@gmail.com');
      const thirdUser = await registerUser(app, 'thirdgetalltransactions', cpf.generate(), 'thirdgetalltransactions@gmail.com');
      const operation1 = await newDeposit(app, firstUser.body.id, '45.12');
      const operation2 = await newDeposit(app, thirdUser.body.id, '71846.00');
      const operation3 = await newDeposit(app, secondUser.body.id, '0.01');
      const operation4 = await newWithdraw(app, thirdUser.body.id, '217.97');
      const operation5 = await newTransfer(app, thirdUser.body.id, '12971.56', secondUser.body.id);
      const operation6 = await newTransfer(app, secondUser.body.id, '6030.74', firstUser.body.id);
      const operation7 = await newWithdraw(app, firstUser.body.id, '1506.91');
      const allTransactions = await request(app).get('/transactions').auth('admin', 'admin', { type: 'basic' });
      expect(allTransactions.status).toBe(200);
      allTransactions.body.forEach((element: any) => {
        expect(element).toHaveProperty('id');
        expect(element).toHaveProperty('type');
        expect(element).toHaveProperty('fromId');
        expect(element).toHaveProperty('amount');
        expect(element).toHaveProperty('date');
        expect(element).toHaveProperty('description');
      });
    });

    it('Get users transactions', async () => {
      const firstUser = await registerUser(app, 'firstgetusertransactions', cpf.generate(), 'firstgetusertransactions@gmail.com');
      const secondUser = await registerUser(app, 'secondgetusertransactions', cpf.generate(), 'secondgetusertransactions@gmail.com');
      const thirdUser = await registerUser(app, 'thirdgetusertransactions', cpf.generate(), 'thirdgetusertransactions@gmail.com');
      const operation1 = await newDeposit(app, thirdUser.body.id, '126.78');
      const operation2 = await newDeposit(app, firstUser.body.id, '1894.61');
      const operation3 = await newDeposit(app, secondUser.body.id, '12.78');
      const operation4 = await newWithdraw(app, thirdUser.body.id, '10.89');
      const operation5 = await newTransfer(app, thirdUser.body.id, '50.79', firstUser.body.id);
      const operation6 = await newTransfer(app, firstUser.body.id, '523.38', secondUser.body.id);
      const operation7 = await newWithdraw(app, firstUser.body.id, '309.25');
      const transactionsOfFirstUser = await request(app)
        .get(`/transactions?id=${firstUser.body.id}`)
        .auth('admin', 'admin', { type: 'basic' });
      const transactionsOfSecondUser = await request(app)
        .get(`/transactions?id=${secondUser.body.id}`)
        .auth('admin', 'admin', { type: 'basic' });
      const transactionsOfThirdUser = await request(app)
        .get(`/transactions?id=${thirdUser.body.id}`)
        .auth('admin', 'admin', { type: 'basic' });
      expect(transactionsOfFirstUser.body.length).toBe(4);
      expect(transactionsOfSecondUser.body.length).toBe(2);
      expect(transactionsOfThirdUser.body.length).toBe(3);
      expect(transactionsOfFirstUser.status).toBe(200);
      transactionsOfFirstUser.body.forEach((element: any) => {
        expect(element).toHaveProperty('id');
        expect(element).toHaveProperty('type');
        expect(element).toHaveProperty('fromId');
        expect(element).toHaveProperty('amount');
        expect(element).toHaveProperty('date');
        expect(element).toHaveProperty('description');
      });
      expect(transactionsOfSecondUser.status).toBe(200);
      transactionsOfSecondUser.body.forEach((element: any) => {
        expect(element).toHaveProperty('id');
        expect(element).toHaveProperty('type');
        expect(element).toHaveProperty('fromId');
        expect(element).toHaveProperty('amount');
        expect(element).toHaveProperty('date');
        expect(element).toHaveProperty('description');
      });
      expect(transactionsOfThirdUser.status).toBe(200);
      transactionsOfThirdUser.body.forEach((element: any) => {
        expect(element).toHaveProperty('id');
        expect(element).toHaveProperty('type');
        expect(element).toHaveProperty('fromId');
        expect(element).toHaveProperty('amount');
        expect(element).toHaveProperty('date');
        expect(element).toHaveProperty('description');
      });
    });

    it('Get transactions of a user not registered', async () => {
      const getTransactions = await request(app)
        .get('/transactions?id=f2b065f0-dca7-47d1-b7d9-62c553901ad3')
        .auth('admin', 'admin', { type: 'basic' });
      expect(getTransactions.status).toBe(404);
      expect(getTransactions.body).toStrictEqual({ error: 'This ID is not registered.' });
    });

    it('Get transactions from user who did not make transactions', async () => {
      const user = await registerUser(app, 'userwithouttransactions', cpf.generate(), 'userwithouttransactions@gmail.com');
      const getTransactions = await request(app).get(`/transactions?id=${user.body.id}`).auth('admin', 'admin', { type: 'basic' });
      expect(getTransactions.status).toBe(200);
      expect(getTransactions.body).toStrictEqual([]);
    });
  });

  describe('Get balance test', () => {
    it('Get balance of a user', async () => {
      const firstUser = await registerUser(app, 'firstgetbalanceuser', cpf.generate(), 'firstgetbalanceuser@gmail.com');
      const secondUser = await registerUser(app, 'secondgetbalanceuser', cpf.generate(), 'secondgetbalanceuser@gmail.com');
      const thirdUser = await registerUser(app, 'thirdgetbalanceuser', cpf.generate(), 'thirdgetbalanceuser@gmail.com');
      const operation1 = await newDeposit(app, thirdUser.body.id, '1532.10');
      const operation2 = await newDeposit(app, firstUser.body.id, '1347.12');
      const operation3 = await newWithdraw(app, thirdUser.body.id, '932.51');
      const operation4 = await newTransfer(app, thirdUser.body.id, '72.65', firstUser.body.id);
      const operation5 = await newTransfer(app, firstUser.body.id, '836.12', secondUser.body.id);
      const operation6 = await newDeposit(app, secondUser.body.id, '42.41');
      const operation7 = await newWithdraw(app, firstUser.body.id, '583.65');
      const getBalanceOfFirstUser = await request(app).get(`/balance/${firstUser.body.id}`).auth('admin', 'admin', { type: 'basic' });
      const getBalanceOfSecondUser = await request(app).get(`/balance/${secondUser.body.id}`).auth('admin', 'admin', { type: 'basic' });
      const getBalanceOfThirdUser = await request(app).get(`/balance/${thirdUser.body.id}`).auth('admin', 'admin', { type: 'basic' });
      expect(getBalanceOfFirstUser.status).toBe(200);
      expect(getBalanceOfSecondUser.status).toBe(200);
      expect(getBalanceOfThirdUser.status).toBe(200);
      expect(getBalanceOfFirstUser.body).toStrictEqual({ id: firstUser.body.id, name: 'firstgetbalanceuser', balance: '0.00' });
      expect(getBalanceOfSecondUser.body).toStrictEqual({ id: secondUser.body.id, name: 'secondgetbalanceuser', balance: '878.53' });
      expect(getBalanceOfThirdUser.body).toStrictEqual({ id: thirdUser.body.id, name: 'thirdgetbalanceuser', balance: '526.94' });
    });

    it('Get balance of a user who did not make transactions', async () => {
      const user = await registerUser(app, 'balancewithouttransactions', cpf.generate(), 'balancewithouttransactions@gmail.com');
      const getbalance = await request(app).get(`/balance/${user.body.id}`).auth('admin', 'admin', { type: 'basic' });
      expect(getbalance.status).toBe(200);
      expect(getbalance.body).toStrictEqual({ id: user.body.id, name: 'balancewithouttransactions', balance: '0.00' });
    });

    it('Get balance of a id not registered', async () => {
      const getbalance = await request(app).get('/balance/72c53a78-f7d7-4428-b289-a5507b0adf6b').auth('admin', 'admin', { type: 'basic' });
      expect(getbalance.status).toBe(404);
      expect(getbalance.body).toStrictEqual({ error: 'This ID is not registered.' });
    });

    it('Get balance invalid id', async () => {
      const getbalance = await request(app).get('/balance/ef59193-6817-4b5-8e9f-374601c64b59').auth('admin', 'admin', { type: 'basic' });
      expect(getbalance.status).toBe(400);
      expect(getbalance.body).toStrictEqual([
        {
          message: '"id" must be a valid GUID',
          path: ['id'],
          type: 'string.guid',
          context: { label: 'id', value: 'ef59193-6817-4b5-8e9f-374601c64b59', key: 'id' },
        },
      ]);
    });
  });
});
