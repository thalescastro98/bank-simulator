import * as request from 'supertest';
import { buildApp } from '../src/app';
import { pg } from '../src/database';
import { registerAdmin } from './schemas';

describe('Register admin tests', () => {
  let app: any;
  beforeAll(async () => {
    app = buildApp();
    return;
  });

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
