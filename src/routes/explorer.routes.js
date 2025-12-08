import express from 'express';
import HttpErrors from 'http-errors';

import ExplorerRepository from '../repositories/explorer.repository.js';
import allyRepository from '../repositories/ally.repository.js';

import { guardAuthorizationJWT } from '../middlewares/authorization.jwt.js';
import { ELEMENTS_NAME } from '../core/constants.js';

const router = express.Router();

router.post('/', post);
router.get('/:uuid', guardAuthorizationJWT, retrieveOne);
router.get('/:uuid/elements', guardAuthorizationJWT, retrieveElements);
router.get('/:uuid/allies', guardAuthorizationJWT, retrieveExplorersAllies);

async function post(req, res, next) {
    try {
        let explorer = req.body;
        //Ne prend en compte just le username et le mot de passe
        explorer = {
            username : explorer.username,
            password : explorer.password,
            vault : {
                elements : []
            }
        };

        //Ajoute tous les éléments
        ELEMENTS_NAME.forEach(elementName => {
            explorer.vault.elements.push({
                quantity: 0,
                element: elementName
            });
        });

        explorer = await ExplorerRepository.create(explorer);

        explorer = explorer.toObject({ getters: false, virtuals: false });
        explorer = ExplorerRepository.transform(explorer);

        res.status(201).json({ explorer });
    } catch (err) {
        return next(err);
    }
}

async function retrieveExplorersAllies(req, res, next) {
    try {
        //Check if the logged in explorer is the same as the one being retrieved
        const explorerUuid = req.auth.uuid;
        if (explorerUuid !== req.params.uuid) {
            return next(HttpErrors.Forbidden());
        }
        let explorer = await ExplorerRepository.retrieveOne(explorerUuid, { allies: true });
        if (!explorer) {
            return next(HttpErrors.NotFound());
        } else {
            explorer = explorer.toObject({ getters: false, virtuals: true });
            explorer = ExplorerRepository.transform(explorer);

            explorer.allies = explorer.allies.map(ally => {
                ally = allyRepository.transform(ally);
                return ally;
            });

            res.status(200).json(explorer.allies);
        }
    } catch (err) {
        return next(err);
    }
}

async function retrieveElements(req, res, next) {
    try {
        //Check if the logged in explorer is the same as the one being retrieved
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
            res.status(200).json(explorer.vault.elements);
        }
    } catch (err) {
        return next(err);
    }
}

async function retrieveOne(req, res, next) {
    try {
        var options = {};
        // Check if the logged in explorer is the same as the one being retrieved
        const explorerUuid = req.auth.uuid;
        if (explorerUuid !== req.params.uuid) {
            return next(HttpErrors.Forbidden());
        }

        if (req.query.embed && req.query.embed === 'allies') {
            options.allies = true;
        }

        let explorer = await ExplorerRepository.retrieveOne(explorerUuid, options);
        if (!explorer) {
            return next(HttpErrors.NotFound());
        }

        explorer = explorer.toObject({ getters: false, virtuals: true });
        explorer = ExplorerRepository.transform(explorer, options);

        if (options.allies) {
            explorer.allies = explorer.allies.map(ally => {
                ally = allyRepository.transform(ally);
                return ally;
            });
        }

        res.status(200).json(explorer);
    } catch (err) {
        return next(err);
    }
}

export default router;
