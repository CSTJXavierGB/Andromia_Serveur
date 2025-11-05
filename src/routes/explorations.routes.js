import express from 'express';
import HttpError from 'http-errors';
import axios from 'axios';

import validator from '../middlewares/validator.js';

import explorationRepository from '../repositories/exploration.repository.js';
import explorerRepository from "../repositories/explorer.repository.js";
import allyRepository from '../repositories/ally.repository.js';

const router = express.Router();

router.post('/explorer/:uuid/exploration/:key', post);

async function post(req, res, next) {
    try {
        //Get les informations de l'exploration du serveur andromia
        const portalUrl = process.env.EXPLORATION_URL + '/' + req.params.key;        
        const portalRes = await axios.get(portalUrl);

        if (portalRes.status !== 200) {
            return next(HttpError.NotFound(`Le portail avec la clée "${req.params.key}" n'existe pas.`));
        }

        let exploration = portalRes.data;

        //Trouve l'explorateur pour faire la référence avec l'exploration
        let explorer = await explorerRepository.retrieveOne(req.params.uuid);
        if (!explorer) {
            return next(HttpError.NotFound(`L'explorateur avec le UUID "${req.params.uuid}" n'existe pas.`));
        }

        //Post de l'ally si un est trouvé
        let ally = exploration.ally;
        if (ally) {
            ally = allyRepository.transformBD(ally, explorer);
            ally = await allyRepository.create(ally);
        }

        //Post de l'exploration
        exploration = explorationRepository.transformBD(exploration, explorer, ally);
        let newExploration = await explorationRepository.create(exploration);

        newExploration = newExploration.toObject({ getters: false, virtuals: false });
        newExploration = explorationRepository.transform(newExploration);

        res.status(201).json(newExploration);
    } catch (err) {
        return next(err);
    }
}

export default router;