import express from 'express';
import HttpError from 'http-errors';
import axios from 'axios';

import validator from '../middlewares/validator.js';

import explorationRepository from '../repositories/exploration.repository.js';

const router = express.Router();

router.post('explorer/:uuid/exploration/:key', post);

async function post(req, res, next) {
    try {
        //Get les informations de l'exploration du serveur andromia
        const portalUrl = process.env.EXPLORATION_URL + '/' + req.params.key;        
        const res = await axios.get(portalUrl);

        if (res.status !== 200) {
            return next(HttpError.NotFound(`Le portail avec la clée "${req.params.key}" n'existe pas.`));
        }

        const exploration = res.data;

        //Post de l'exploration
        let newExploration

    } catch (err) {
        return next(err);
    }
}

export default router;