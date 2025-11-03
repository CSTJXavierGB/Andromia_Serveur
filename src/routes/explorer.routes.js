import express from 'express';
import HttpErrors from 'http-errors';

import ExplorerRepository from '../repositories/explorer.repository.js';

import { guardAuthorizationJWT } from '../middlewares/authorization.jwt.js';

const router = express.Router();

router.post('/', post);
// TODO : Remove route, only for testing purposes
// router.get('/', retrieveAll);
router.get('/:uuid', guardAuthorizationJWT, retrieveOne);

async function post(req, res, next) {
    try {
        let explorer = await ExplorerRepository.create(req.body);

        explorer = explorer.toObject({ getters: false, virtuals: false });
        explorer = ExplorerRepository.transform(explorer);

        res.status(201).json({ explorer });
    } catch (err) {
        return next(err);
    }
}

async function retrieveOne(req, res, next) {
    try {
        // Check if the logged in explorer is the same as the one being retrieved
        const explorerUuid = req.auth.uuid;
        if (explorerUuid !== req.params.uuid) {
            return next(HttpErrors.Forbidden());
        }

        let explorer = await ExplorerRepository.retrieveOne(explorerUuid);
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

// TODO : Remove route, only for testing purposes
// async function retrieveAll(req, res, next) {
//     try {
//         let explorers = await ExplorerRepository.retrieveAll();
//         explorers = explorers.map((explorer) => {
//             explorer = explorer.toObject({getters:false, virtuals:false});
//             explorer = ExplorerRepository.transform(explorer);
//             return explorer;
//         });
//         res.status(200).json(explorers);
//     } catch (err) {
//         return next(err);
//     }
// }

export default router;
