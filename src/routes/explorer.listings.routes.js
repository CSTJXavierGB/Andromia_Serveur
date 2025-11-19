import express from 'express';
import HttpErrors from 'http-errors';

import listingRepository from '../repositories/listing.repository.js';

import { guardAuthorizationJWT } from '../middlewares/authorization.jwt.js';

const router = express.Router();

router.get('/:explorerUUID/listings', guardAuthorizationJWT, getAllListingsByExplorerUUID);



async function getAllListingsByExplorerUUID(req, res, next) {
    try {

        const explorerUUID = req.params.explorerUUID;
        if (req.auth.uuid !== explorerUUID) {
            throw HttpErrors.Forbidden('You are not allowed to access these listings');
        }
        var listings = await listingRepository.retrieveAllByExplorerUUID(explorerUUID);

        if (!listings || listings.length === 0) {
            return res.status(204).end();
        }

       listings = listings.map(listing => {
              listing = listing.toObject({ getters: false, virtuals: false });
              listingRepository.transform(listing);
              return listing;
       });


       res.status(200).json({ listings });

    } catch (err) {
        return next(err);
    }
}

export default router;