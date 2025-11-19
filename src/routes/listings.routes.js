import express from 'express';
import HttpErrors from 'http-errors';


import { guardAuthorizationJWT } from '../middlewares/authorization.jwt.js';
import listingRepository from '../repositories/listing.repository.js';

const router = express.Router();

router.get('/:listingUUID', retrieveOne);
router.post('/allies/:allyUUID', guardAuthorizationJWT, post);


async function retrieveOne(req, res, next) {
    try {
        const listingUUID = req.params.listingUUID;
        var listing = await listingRepository.retrieveByUUID(listingUUID);
        if (!listing) {
            throw HttpErrors.NotFound('Listing not found');
        }

        listing = listing.toObject({ getters: false, virtuals: false });
        listing = listingRepository.transform(listing);

        res.status(200).json({ listing });
    } catch (err) {
        return next(err);
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





export default router;
