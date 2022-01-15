import { buildApp } from '../src/app';
import { registerUser } from './schemas';
import { cpf } from 'cpf-cnpj-validator';
import { destroyConnection } from '../src/database';

describe('Register Users tests', () => {
  const app = buildApp();

  afterAll(async () => {
    await destroyConnection();
  });

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
