import express from 'express';
import HttpError from 'http-errors';
import axios from 'axios';
import dayjs from 'dayjs';

import validator from '../middlewares/validator.js';

import explorationsRepository from '../repositories/exploration.repository.js';
import explorersRepository from "../repositories/explorer.repository.js";
import alliesRepository from '../repositories/ally.repository.js';

const router = express.Router();

router.get('/explorers/:uuid/explorations', test);
router.post('/explorers/:uuid/explorations/:key', post);
router.patch('/explorations/:uuid/adopt', patch);

async function retrieveAll(req, res, next) {
    
    let options = {
        limit: req.query.limit,
        skip: req.skip,
    };

    if (req.query.embed) {
        const embeds = req.query.embed;
        if (embeds.includes("ally")) {
            options.ally = true;
        }
        if (embeds.includes("explorer")) {
            options.explorer = true;
        }
    }

    try {

    } catch (err) {
        next(err);
    }
}

async function example(req, res, next) {
  let filter = { };
  const options = {
    limit: req.query.limit,
    skip: req.skip,
  };

  if(req.query.embed && req.query.embed === 'planet') {
    options.planet = true;
  }

  if(req.query.element) {
    filter = { 'scans.element' : req.query.element }
  }


  try {
    const responseBody = {};

    let [explorations, totalDocuments] = await explorationsRepository.retrieveByCriteria(filter, options);
    explorations = explorations.map((e) => {
      e = e.toObject({ getters: false, virtuals: false });
      e = explorationsRepository.transform(e, options);
      return e;
    });

    const totalPages = Math.ceil(totalDocuments / req.query.limit);
    const pageLinksFunction = paginate.getArrayPages(req);
    let pageLinks = pageLinksFunction(PAGE_LINKS_NUMBER, totalPages, req.query.page);

    responseBody._metadata = {
      hasNextPage: req.query.page < totalPages,
      page: req.query.page,
      limit: req.query.limit,
      skip: req.query.skip,
      totalPages: totalPages,
      totalDocuments: totalDocuments,
    };
    responseBody._links = {};

    let _links = ['prev', 'self', 'next'];

    if (req.query.page === 1) {
      _links = _links.splice(1, 2);
    }

    if (req.query.page === totalPages) {
      _links = _links.slice(0, 2);
      pageLinks = pageLinks.slice(1);
    }

    _links.forEach((link, index) => {
      responseBody._links[link] = `${process.env.BASE_URL}${pageLinks[index].url}`;
      //responseBody._links.prev link = 'prev';
    });

    responseBody.data = explorations;

    res.status(200).json(responseBody);
  } catch (err) {
    return next(err);
  }
}

async function patch(req, res, next) {
    try {
        const exploration = explorationsRepository.retrieveOne(req.params.uuid, {ally: true});
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
            ally = alliesRepository.transformBD(ally, explorer);
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