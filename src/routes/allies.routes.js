import express from 'express';
import HttpError from 'http-errors';

import validator from '../middlewares/validator.js';
import alliesRepository from '../repositories/ally.repository.js';
import explorerRepository from '../repositories/explorer.repository.js';

const router = express.Router();

router.get('/:uuid', retrieveOne);
// router.get('/', retrieveAll); // Route de test pour récupérer tous les alliés
router.post('/', validator, post);

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

// ROUTE TEMPORAIRE : Pour créer un allié lié à un explorateur existant ou non
async function post(req, res, next) {
    const options = {
        explorer: true
    };
    try {
        let explorer;
        if (req.query.explorer) {
            explorer = await explorerRepository.retrieveOne(req.query.explorer);
            if (!explorer) {
                return next(HttpError.BadRequest(`L'explorateur avec le uuid "${req.query.explorer}" n'existe pas.`));
            }
        }

        let newAlly = await alliesRepository.create(req.body, explorer, options);
        newAlly = newAlly.toObject({ getters: false, virtuals: false });
        newAlly = alliesRepository.transform(newAlly, options);

        res.status(201).json(newAlly);
    } catch (err) {
        return next(err);
    }
}

// async function retrieveAll(req, res, next) {
//     try {
//         let allies = await alliesRepository.retrieveAll();
//         allies = allies.map((ally) => {
//             ally = ally.toObject({ getters: false, virtuals: false });
//             ally = alliesRepository.transform(ally);
//             return ally;
//         });
//         res.status(200).json(allies);
//     } catch (err) {
//         return next(err);
//     }
// }

export default router;
