import * as _Joi from "joi";
import validator from "cpf-cnpj-validator";

const Joi=_Joi.extend(validator);

export const transactionsSchema = Joi.object({
    type: Joi.string().pattern(new RegExp('^deposit$|^withdraw$|^transfer$')).required(),
    id: Joi.string().guid({version:'uuidv4'}).required(),
    amount: Joi.number().precision(2).positive().required(),
    toId: Joi.string().guid({version:'uuidv4'})
});

export const registerUserSchema = Joi.object({
    cpf:Joi.document().cpf().required(),
    name: Joi.string().pattern(new RegExp('^[a-zA-Z]{3,30}$')).required(),
    email:Joi.string().email().required()
});

export const credentialsSchema = Joi.object({
    name: Joi.string().min(4).max(30).required(),
    pass: Joi.string().min(4).max(30).required()
});

export const registerAdminSchema = Joi.object({
    login: Joi.string().min(4).max(30).required(),
    password: Joi.string().min(4).max(30).required()
});

export const getTransictionsSchema = Joi.object({
    id:Joi.string().guid({version:'uuidv4'})
});

export const getBalanceSchema = Joi.object({
    id:Joi.string().guid({version:'uuidv4'}).required()
});