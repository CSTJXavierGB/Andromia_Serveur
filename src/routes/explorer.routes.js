import express from 'express';
import HttpErrors from 'http-errors';

import ExplorerRepository from '../repositories/explorer.repository.js';

// TODO : JWT Tokens
// import { guardAuthorizationJWT } from '../middlewares/authorization.jwt.js';



const router = express.Router();

router.post('/', post);
router.get('/', retrieveAll);
router.get('/:uuid', retrieveOne);

async function post(req, res, next) {
    try {
        let explorer = await ExplorerRepository.create(req.body);

        // TODO : JWT Tokens
        // const tokens = ExplorerRepository.generateJWT(explorer.uuid);

        explorer = explorer.toObject({getters:false, virtuals: false});
        explorer = ExplorerRepository.transform(explorer);

        // TODO : add tokens in response
        res.status(201).json({explorer});

    } catch (err) {
        return next(err);
    }
}

async function retrieveOne(req, res, next) {
    try {
        let explorer = await ExplorerRepository.retrieveOne(req.params.uuid);
        if (!explorer) {
            return next(HttpErrors.NotFound());
        } else {
            explorer = explorer.toObject({ getters: false, virtuals: false });
            explorer = ExplorerRepository.transform(explorer);
            res.status(200).json(explorer);
        }
    } catch (err) {
        return next(err);
    }
}
async function retrieveAll(req, res, next) {
    try {
        let explorers = await ExplorerRepository.retrieveAll();
        explorers = explorers.map((explorer) => {
            explorer = explorer.toObject({getters:false, virtuals:false});
            explorer = ExplorerRepository.transform(explorer);
            return explorer;
        });
        res.status(200).json(explorers);
    } catch (err) {
        return next(err);
    }
}

export default router;
