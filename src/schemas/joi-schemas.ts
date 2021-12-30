import * as _Joi from 'joi';
import validator from 'cpf-cnpj-validator';
import { ErrorMessage } from '.';

const Joi = _Joi.extend(validator);

export const joiHandling = (schema: any, objectToBeEvaluated: any) => {
  const result = schema.validate(objectToBeEvaluated);
  if (result.error) throw new ErrorMessage(400, result.error.details);
  return result.value;
};

export const transactionsSchema = Joi.object({
  type: Joi.string().pattern(new RegExp('^deposit$|^withdraw$|^transfer$')).required(),
  fromId: Joi.string().guid({ version: 'uuidv4' }).required(),
  amount: Joi.string().pattern(new RegExp('^\\d{1,10}\\.\\d{2}$')).required(),
  toId: Joi.string().guid({ version: 'uuidv4' }),
});

export const registerUserSchema = Joi.object({
  cpf: Joi.document().cpf().length(11).required(),
  name: Joi.string().pattern(new RegExp('^[a-zA-Z]{3,30}$')).required(),
  email: Joi.string().email().required(),
});

export const credentialsSchema = Joi.object({
  name: Joi.string().min(4).max(30).required(),
  pass: Joi.string().min(4).max(30).required(),
});

export const registerAdminSchema = Joi.object({
  login: Joi.string().min(4).max(30).required(),
  password: Joi.string().min(4).max(30).required(),
});

export const getTransactionsSchema = Joi.object({
  id: Joi.string().guid({ version: 'uuidv4' }),
});

export const getBalanceSchema = Joi.object({
  id: Joi.string().guid({ version: 'uuidv4' }).required(),
});
