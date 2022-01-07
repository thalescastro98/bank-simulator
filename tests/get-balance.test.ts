import * as request from 'supertest';
import { buildApp } from '../src/app';
import { newDeposit, newTransfer, newWithdraw, registerUser } from './schemas';
import { cpf } from 'cpf-cnpj-validator';

describe('Get balance test', () => {
  let app: any;
  beforeAll(async () => {
    app = buildApp();
    return;
  });

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
