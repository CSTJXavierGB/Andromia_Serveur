import express from 'express';
import HttpErrors from 'http-errors';

import validator from '../middlewares/validator.js';

import accountRepository from '../repositories/account.repository.js';
import expenseRepository from '../repositories/expense.repository.js';

import { guardAuthorizationJWT } from '../middlewares/authorization.jwt.js';

import accountsValidator from '../validators/example.validator.js';

const router = express.Router();

router.post('/', accountsValidator.postValidator(), validator, post);
router.get('/:base64', retrieveOne);
router.get('/:base64/expenses', retrieveExpenseForAccount);

async function post(req, res, next) {
    try {
        let account = await accountRepository.create(req.body);

        // TODO : JWT Tokens
        const tokens = accountRepository.generateJWT(account.uuid);

        account = account.toObject({getters:false, virtuals: false});
        account = accountRepository.transform(account);

        

        res.status(201).json({account, tokens});

    } catch (err) {
        return next(err);
    }
}

async function retrieveOne(req, res, next) {
    try {
        let account = await accountRepository.retrieveByUUID(req.params.uuid);
        if (!account) {
            return next(HttpErrors.NotFound());
        } else {
            account = account.toObject({ getters: false, virtuals: false });
            account = accountRepository.transform(account);
            res.status(200).json(account);
        }
    } catch (err) {
        return next(err);
    }
}

async function retrieveExpenseForAccount(req, res, next) {
    try {
        const tokenBase64 = req.auth.base64;
        if (req.params.base64 !== tokenBase64) {
            return next(HttpErrors.Forbidden());
        }
        const account = await accountRepository.retrieveByBase64(tokenBase64);
        let expenses = await expenseRepository.retrieveForOneUser(account._id);

        expenses = expenses.map(e => {
            e = e.toObject();
            return expenseRepository.transform(e);
        });

        res.status(200).json(expenses);
    } catch (err) {
        return next(err);
    }
}

export default router;
