import express from 'express';
import HttpError from 'http-errors';
import axios from 'axios';
import dayjs from 'dayjs';

import { EXPLORATION_EXPIRE_MINUTE } from '../core/constants.js';
import validator from '../middlewares/validator.js';

import explorationsRepository from '../repositories/exploration.repository.js';
import explorersRepository from "../repositories/explorer.repository.js";
import alliesRepository from '../repositories/ally.repository.js';

const router = express.Router();

router.get('/explorations/:uuid', retrieveOne);
router.get('/explorers/:uuid/explorations', retrieveAllFromExplorer);
router.post('/explorers/:uuid/explorations/:key', post);
router.patch('/explorations/:uuid/adopt', patch);

async function retrieveOne(req, res, next) {
  try {
    let options = {};

    if (req.query.embed) {
      const embeds = req.query.embed;
      if (embeds.includes("ally")) {
        options.ally = true;
      }
      if (embeds.includes("explorer")) {
        options.explorer = true;
      }
    }

    let exploration = await explorationsRepository.retrieveOne(req.params.uuid, options);
    if (!exploration) {
      return next(HttpError.NotFound(`L'exploration avec le UUID "${req.params.uuid}" n'existe pas.`));
    }

    exploration = exploration.toObject({ getters: false, virtuals: false });
    exploration = explorationsRepository.transform(exploration, options);

    res.status(200).json(exploration);
  } catch (err) {
    next(err);
  }
}

async function retrieveAllFromExplorer(req, res, next) {  
  try {
    let options = {};

    if (req.query.embed) {
      const embeds = req.query.embed;
      if (embeds.includes("ally")) {
        options.ally = true;
      }
      if (embeds.includes("explorer")) {
        options.explorer = true;
      }
    }

    //Get l'explorer pour son id
    let explorer = await explorersRepository.retrieveOne(req.params.uuid);
    if (!explorer) {
      return next(HttpError.NotFound(`L'explorateur avec le uuid "${req.params.uuid}" n'existe pas.`));
    }

    let explorations = await explorationsRepository.retrieveByCriteria({ "explorer" : explorer._id}, options);
    if (!explorations) {
      return next(HttpError.NotFound(`Aucune exploration lié à l'explorateur avec le uuid "${req.params.uuid}" n'a été trouvé.`));
    }

    explorations = explorations.map((e) => {
      e = e.toObject({ getters: false, virtuals: false });
      e = explorationsRepository.transform(e, options);
      return e;
    });

    res.status(200).json(explorations);
  } catch (err) {
    next(err);
  }
}

async function patch(req, res, next) {
  try {
    let exploration = await explorationsRepository.retrieveOne(req.params.uuid, { ally: true });
    if (!exploration) {
      return next(HttpError.NotFound(`L'exploration avec le uuid ${req.params.uuidExploration} n'existe pas.`));
    }
    exploration = exploration.toObject({ getters: false, virtuals: false });

    //Vérification si l'exploration possède un ally
    if (!exploration.ally) {
      return next(HttpError.Forbidden("L'exploration ne possède pas d'allié à adopter"));
    }
    //Vérification du temps depuis la création de l'exploration
    const expireDate = dayjs(exploration.explorationDate)
      .add(EXPLORATION_EXPIRE_MINUTE, 'minute');
    if (dayjs().isAfter(expireDate)) {
      return next(HttpError.Forbidden("La période de temps pour adopter L'allié s'est expiré."));
    }

    let ally = exploration.ally;
    ally.explorer = exploration.explorer._id;

    let newAlly = await alliesRepository.update(ally.uuid, ally);

    newAlly = newAlly.toObject({ getters: false, virtuals: false });
    newAlly = alliesRepository.transform(newAlly);

    res.status(200).json(newAlly);
  } catch (err) {
    next(err);
  }
}

async function post(req, res, next) {
  try {
    //---Get les informations de l'exploration du serveur andromia---
    const portalUrl = process.env.EXPLORATION_URL + '/' + req.params.key;
    const portalRes = await axios.get(portalUrl, {
      //Si le status est 404(géré plus bas) ou 200 throw une erreur(default est throw si non 200)
      validateStatus: status => {
        return status === 404 || status === 200
      }
    });

    if (portalRes.status === 404) {
      return next(HttpError.NotFound(`Le portail avec la clée "${req.params.key}" n'existe pas.`));
    }

    let exploration = portalRes.data;

    //---Trouve l'explorateur---
    let explorer = await explorersRepository.retrieveOne(req.params.uuid);
    if (!explorer) {
      return next(HttpError.NotFound(`L'explorateur avec le UUID "${req.params.uuid}" n'existe pas.`));
    }

    //---Post de l'ally---
    let ally = exploration.ally;
    //il est possible qu'auncun ally soit trouvé
    if (ally) {
      ally = explorationsRepository.transformBdAlly(ally);
      ally = await alliesRepository.create(ally);
    }    

    //---Post de l'exploration---
    exploration = explorationsRepository.transformBdExploration(exploration, explorer, ally);
    let newExploration = await explorationsRepository.create(exploration);

    //---Update de l'explorateur---
    explorer = explorationsRepository.transformBdExplorer(newExploration, explorer);
    await explorersRepository.update(explorer.uuid, explorer);

    //---Transformation des donnée pour le json retourné---
    newExploration = newExploration.toObject({ getters: false, virtuals: false });
    
    newExploration = explorationsRepository.transform(newExploration);

    res.status(201).json(newExploration);
  } catch (err) {
    return next(err);
  }
}

export default router;