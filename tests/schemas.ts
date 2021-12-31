import * as request from 'supertest';

export const registerAdmin = (app: any, login: string, password: string) => {
  return request(app).post('/register/admin').send({ login: login, password: password }).auth('admin', 'admin', { type: 'basic' });
};

export const registerUser = (app: any, name: string, cpf: string, email: string) => {
  return request(app).post('/register').send({ name: name, cpf: cpf, email: email }).auth('admin', 'admin', { type: 'basic' });
};

export const newDeposit = (app: any, fromId: string, amount: string) => {
  return request(app)
    .post('/transactions')
    .send({ type: 'deposit', fromId: fromId, amount: amount })
    .auth('admin', 'admin', { type: 'basic' });
};

export const newWithdraw = (app: any, fromId: string, amount: string) => {
  return request(app)
    .post('/transactions')
    .send({ type: 'withdraw', fromId: fromId, amount: amount })
    .auth('admin', 'admin', { type: 'basic' });
};

export const newTransfer = (app: any, fromId: string, amount: string, toId: string) => {
  return request(app)
    .post('/transactions')
    .send({ type: 'transfer', fromId: fromId, amount: amount, toId: toId })
    .auth('admin', 'admin', { type: 'basic' });
};
