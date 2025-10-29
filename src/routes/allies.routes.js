import express from 'express';
import HttpErrors from 'http-errors';

import validator from '../middlewares/validator.js';

import alliesRepository from '../repositories/ally.repository.js';

import { guardAuthorizationJWT } from '../middlewares/authorization.jwt.js';

const router = express.Router();

router.get('/:uuid', retrieveOne);
router.post('/', validator, post);

async function retrieveOne(req, res, next) {
    try {
        let ally = await alliesRepository.retrieveByUUID(req.params.uuid);
        if (!ally) {
            return next(HttpErrors.NotFound(`L'allié avec le uuid "${req.params.uuid}" n'existe pas.`));
        } else {
            ally = ally.toObject({ getters: false, virtuals: false });
            res.status(200).json(ally);
        }
    } catch (err) {
        return next(err);
    }
}

async function post(req, res, next) {
  try {
    let newAlly = await alliesRepository.create(req.body);
    res.header('Location', `${process.env.BASE_URL}/allies/${newAlly.uuid}`);
  
    newAlly = newAlly.toObject({ getters: false, virtuals: false });

    res.status(201).json(newAlly);
  } catch (err) {
    return next(err);
  }
}

export default router;
