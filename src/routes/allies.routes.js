import express from 'express';
import HttpError from 'http-errors';

import alliesRepository from '../repositories/ally.repository.js';

const router = express.Router();

router.get('/:uuid', retrieveOne);

async function retrieveOne(req, res, next) {
    const options = {};

    try {
        if (req.query.embed && req.query.embed === 'explorer') {
            options.explorer = true;
        }

        let ally = await alliesRepository.retrieveByUUID(req.params.uuid, options);
        if (!ally) {
            return next(HttpError.NotFound(`L'allié avec le uuid "${req.params.uuid}" n'existe pas.`));
        }

        ally = ally.toObject({ getters: false, virtuals: false });
        ally = alliesRepository.transform(ally, options);

        res.status(200).json(ally);
    } catch (err) {
        return next(err);
    }
}

export default router;
