import express from 'express';
import paginate, { hasNextPages } from 'express-paginate';
import HttpError from 'http-errors';

import { generateMetaDataLinks } from '../core/paginationHandler.js';
import { handlePageURLParam } from '../middlewares/page.value.middleware.js';
import { PAGINATION_PAGE_LIMIT, PAGINATION_PAGE_MAX_LIMIT, PAGE_LINKS_NUMBER } from '../core/constants.js';

import listingRepository from '../repositories/listing.repository.js';

const router = express.Router();

router.get('/', handlePageURLParam, paginate.middleware(PAGINATION_PAGE_LIMIT, PAGINATION_PAGE_MAX_LIMIT), retieveAll);
router.post('/allies/:allyUUID', guardAuthorizationJWT, post);

async function retieveAll(req, res, next) {
    try {
        let filter = {};
        let options = {
            limit: req.query.limit,
            skip: req.skip,
        };

        options = { ...options, ...assignEmbedOptions(req.query.embed) };
        //Check filters
        if (req.query.status) {
            if (req.query.status === "completed") {
                filter = { 'buyer': { $exists:true } };
            } else if (req.query.status === "available") {
                filter = { 'buyer': { $exists:false } };
            }
        }

        let [listings, totalDocuments] = await listingRepository.retrieveByCriteria(filter, options);

        let responseBody = generateMetaDataLinks(totalDocuments, req.query.page, req.query.skip, req.query.limit);
        responseBody.data = listings.map((l) => {
            l = l.toObject({ getters: false, virtuals: false });
            l = explorationsRepository.transform(l, options);
            return l;
        });

        res.status(200).json(responseBody);

    } catch (err) {
        next(err);
    }
}

async function post(req, res, next) {
    try {

        const allyUUID = req.params.allyUUID;
        const explorerUuid = req.auth.uuid;
        const inox = req.body.inox;
        

        let listing = await listingRepository.create(allyUUID, explorerUuid, inox);

        listing = listing.toObject({ getters: false, virtuals: false });

        
         listing = listingRepository.transform(listing);


         if (req.query._body && req.query._body === 'false') {
            res.status(204).end();
        } else {
            res.status(201).json({ listing });
        }

    } catch (err) {
        return next(err);
    }
}

function assignEmbedOptions(reqEmbeds) {
    let options = {};

    if (reqEmbeds) {
        if (reqEmbeds.includes("seller")) {
            options.seller = true;
        }
        if (reqEmbeds.includes("buyer")) {
            options.buyer = true;
        }
        if (reqEmbeds.includes("ally")) {
            options.ally = true;
        }
    }
    return options;
}

export default router;
