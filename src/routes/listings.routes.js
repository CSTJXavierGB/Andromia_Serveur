import express from 'express';
import paginate, { hasNextPages } from 'express-paginate';
import HttpError from 'http-errors';

import { handlePageURLParam } from '../middlewares/page.value.middleware.js';
import { PAGINATION_PAGE_LIMIT, PAGINATION_PAGE_MAX_LIMIT, PAGE_LINKS_NUMBER } from '../core/constants.js';

import listingRepository from '../repositories/listing.repository.js';

const router = express.Router();

router.get('/', handlePageURLParam, paginate.middleware(PAGINATION_PAGE_LIMIT, PAGINATION_PAGE_MAX_LIMIT), retieveAll);

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

        let responseBody = {};

        let [listings, totalDocuments] = await listingRepository.retrieveByCriteria(filter, options);
        listings = listings.map((l) => {
            l = l.toObject({ getters: false, virtuals: false });
            l = explorationsRepository.transform(l, options);
            return l;
        });

        //TODO: this whole chunk could be a function used for multiple diffrent routes, figure it out
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

    } catch (err) {
        next(err);
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