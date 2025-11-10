import express from 'express';
import HttpError from 'http-errors';
import axios from 'axios';
import dayjs from 'dayjs';

import validator from '../middlewares/validator.js';

import explorationsRepository from '../repositories/exploration.repository.js';
import explorersRepository from "../repositories/explorer.repository.js";
import alliesRepository from '../repositories/ally.repository.js';

const router = express.Router();

router.get('/explorers/:uuid/explorations', retrieveAllFromExplorer);
router.post('/explorers/:uuid/explorations/:key', post);
router.patch('/explorations/:uuid/adopt', patch);

async function retrieveAllFromExplorer(req, res, next) {  
  try {
    let options = {};
    let filter = { 'explorer' : req.params.uuid };

    if (req.query.embed) {
      const embeds = req.query.embed;
      if (embeds.includes("ally")) {
        options.ally = true;
      }
      if (embeds.includes("explorer")) {
        options.explorer = true;
      }
    }

    let explorations = await explorationsRepository.retrieveByCriteria(filter, options);

    explorations = explorations.map((e) => {
      e = e.toObject({ getters: false, virtuals: false });
      e = explorationsRepository.transform(e);
      return e;
    });

    res.status(200).json(explorations);
  } catch (err) {
    next(err);
  }
}

async function patch(req, res, next) {
  try {
    const exploration = explorationsRepository.retrieveOne(req.params.uuid, { ally: true });
    if (!exploration) {
      return next(HttpError.NotFound(`L'exploration avec le uuid ${req.params.uuidExploration} n'existe pas.`));
    }
    //Vérification du temps depuis la création de l'exploration
    const expireDate = dayjs(exploration.explorationDate)
      .add(process.env.EXPLORATION_EXPIRE_MINUTE, 'minute');
    if (dayjs().isAfter(expireDate)) {
      return next(HttpError.Forbidden("La période de temps pour adopter L'allié s'est expiré."));
    }

    let ally = exploration.ally;
    ally.explorer = exploration.explorer;

    let newAlly = alliesRepository.update(ally.uuid, ally);

    newAlly = newAlly.toObject({ getters: false, virtuals: false });
    newAlly = alliesRepository.transform(newAlly);

    res.status(200).json(newAlly);
  } catch (err) {
    next(err);
  }
}

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
    let explorer = await explorersRepository.retrieveOne(req.params.uuid);
    if (!explorer) {
      return next(HttpError.NotFound(`L'explorateur avec le UUID "${req.params.uuid}" n'existe pas.`));
    }

    //Post de l'ally si un est trouvé
    let ally = exploration.ally;
    if (ally) {
      ally = alliesRepository.transformBD(ally);
      ally = await alliesRepository.create(ally);
    }

    //Post de l'exploration
    exploration = explorationsRepository.transformBD(exploration, explorer, ally);
    let newExploration = await explorationsRepository.create(exploration);

    newExploration = newExploration.toObject({ getters: false, virtuals: false });
    newExploration = explorationsRepository.transform(newExploration);

    res.status(201).json(newExploration);
  } catch (err) {
    return next(err);
  }
}

export default router;